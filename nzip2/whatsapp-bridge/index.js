/**
 * WhatsApp bridge for the ai-marketing-expert chatbot.
 *
 * A small Node.js service (Baileys is not available in PHP) that:
 *  - Maintains a single WhatsApp Web session (multi-device, QR pairing).
 *  - Exposes local HTTP endpoints for WordPress (PHP) to poll status/QR
 *    and to request outbound sends.
 *  - Forwards every inbound WhatsApp message to a WordPress REST webhook,
 *    which runs it through the existing AI chatbot and replies via /send.
 *
 * This process is only reachable on localhost — WordPress (PHP) is the
 * only client, and it authenticates with WHATSAPP_BRIDGE_TOKEN.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const express = require("express");
const QRCode = require("qrcode");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const PORT = parseInt(process.env.WHATSAPP_BRIDGE_PORT || "3300", 10);
const BRIDGE_TOKEN = process.env.WHATSAPP_BRIDGE_TOKEN || "";
const WP_WEBHOOK_URL = process.env.WP_WEBHOOK_URL || "http://127.0.0.1:5000/index.php?rest_route=/aime/v1/chatbot/whatsapp/incoming";
const WP_WEBHOOK_SECRET = process.env.WP_WEBHOOK_SECRET || "";
const AUTH_DIR = path.join(__dirname, "auth", "session");

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

let sock = null;
let latestQrDataUrl = null;
let connectionStatus = "disconnected"; // disconnected | connecting | qr | connected
let connectedPhone = null;
let startingUp = false;

function requireBridgeToken(req, res, next) {
  if (!BRIDGE_TOKEN) {
    // Bridge is unconfigured; refuse all traffic rather than running open.
    return res.status(503).json({ error: "Bridge token not configured" });
  }
  const provided = req.get("X-Bridge-Token") || "";
  if (provided !== BRIDGE_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

async function forwardIncomingMessage(fromJid, phone, name, text) {
  if (!WP_WEBHOOK_URL) return;
  try {
    const resp = await fetch(WP_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": WP_WEBHOOK_SECRET,
      },
      body: JSON.stringify({ phone, name, message: text }),
    });
    if (!resp.ok) {
      console.error("[bridge] webhook forward failed:", resp.status, await resp.text());
      return;
    }
    const data = await resp.json();
    if (data && data.reply) {
      await sendMessage(fromJid, data.reply);
    }
  } catch (err) {
    console.error("[bridge] webhook forward error:", err.message);
  }
}

async function sendMessage(jid, text) {
  if (!sock) throw new Error("WhatsApp socket not connected");
  await sock.sendMessage(jid, { text });
}

function phoneToJid(phone) {
  const digits = String(phone).replace(/[^0-9]/g, "");
  return `${digits}@s.whatsapp.net`;
}

async function startSocket() {
  if (startingUp) return;
  startingUp = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    connectionStatus = "connecting";
    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        connectionStatus = "qr";
        latestQrDataUrl = await QRCode.toDataURL(qr);
      }

      if (connection === "open") {
        connectionStatus = "connected";
        latestQrDataUrl = null;
        connectedPhone = sock.user && sock.user.id ? sock.user.id.split(":")[0].split("@")[0] : null;
        console.log("[bridge] WhatsApp connected as", connectedPhone);
      }

      if (connection === "close") {
        connectedPhone = null;
        const statusCode = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output
          ? lastDisconnect.error.output.statusCode
          : null;
        const loggedOut = statusCode === DisconnectReason.loggedOut;
        connectionStatus = "disconnected";
        sock = null;
        startingUp = false;
        if (loggedOut) {
          // Session invalidated (user unlinked from phone) — wipe creds so a
          // fresh QR is generated on next connect instead of retrying a dead session.
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          fs.mkdirSync(AUTH_DIR, { recursive: true });
        } else {
          // Transient disconnect — reconnect automatically.
          startSocket();
        }
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;
        const jid = msg.key.remoteJid;
        if (!jid || jid.endsWith("@g.us") || jid === "status@broadcast") continue; // ignore group/status messages

        const text =
          msg.message.conversation ||
          (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) ||
          (msg.message.imageMessage && msg.message.imageMessage.caption) ||
          "";
        if (!text) continue;

        const phone = jid.split("@")[0];
        const name = msg.pushName || "";
        forwardIncomingMessage(jid, phone, name, text);
      }
    });
  } catch (err) {
    console.error("[bridge] failed to start socket:", err.message);
    connectionStatus = "disconnected";
    startingUp = false;
  } finally {
    startingUp = false;
  }
}

const app = express();
app.use(express.json());

app.get("/status", requireBridgeToken, (req, res) => {
  res.json({ status: connectionStatus, phone: connectedPhone });
});

app.get("/qr", requireBridgeToken, (req, res) => {
  res.json({ status: connectionStatus, qr: latestQrDataUrl });
});

app.post("/connect", requireBridgeToken, async (req, res) => {
  if (connectionStatus === "connected") {
    return res.json({ status: connectionStatus });
  }
  startSocket();
  res.json({ status: "connecting" });
});

app.post("/logout", requireBridgeToken, async (req, res) => {
  try {
    if (sock) {
      await sock.logout().catch(() => {});
      sock = null;
    }
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    connectionStatus = "disconnected";
    connectedPhone = null;
    latestQrDataUrl = null;
    res.json({ status: "disconnected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/send", requireBridgeToken, async (req, res) => {
  const { phone, message } = req.body || {};
  if (!phone || !message) {
    return res.status(400).json({ error: "phone and message are required" });
  }
  if (connectionStatus !== "connected") {
    return res.status(409).json({ error: "WhatsApp is not connected" });
  }
  try {
    await sendMessage(phoneToJid(phone), message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`[bridge] listening on 127.0.0.1:${PORT}`);
  // Auto-start the socket so a previously-linked session reconnects
  // without requiring an admin visit first.
  startSocket();
});
