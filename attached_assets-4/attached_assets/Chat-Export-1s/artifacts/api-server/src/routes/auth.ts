import { Router, type IRouter } from "express";
import { db, tenantsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { signToken, hashPassword, comparePassword, requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import { z } from "zod";

let _resend: InstanceType<typeof Resend> | null = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
const FROM_EMAIL = `${process.env.RESEND_FROM_NAME ?? "Clientum"} <${process.env.RESEND_FROM_EMAIL ?? "noreply@clientum.com.ar"}>`;

function getBaseUrl(req: any): string {
  const host = req.headers["x-forwarded-host"] as string | undefined;
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
  if (host) return `${proto}://${host}`;
  return `http://localhost:${process.env.PORT ?? 8080}`;
}

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

const RegisterBody = z.object({
  orgName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { orgName, email, password, name } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  let slug = slugify(orgName);
  const existingTenant = await db.select().from(tenantsTable).where(eq(tenantsTable.slug, slug)).limit(1);
  if (existingTenant.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  const [tenant] = await db.insert(tenantsTable).values({ name: orgName, slug }).returning();

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    tenantId: tenant.id,
    email,
    passwordHash,
    name,
    role: "admin",
  }).returning();

  const token = signToken({ userId: user.id, tenantId: tenant.id, email: user.email, role: user.role });

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, user.tenantId)).limit(1);

    if (!tenant) {
      req.log.error({ userId: user.id, tenantId: user.tenantId }, "Login: tenant not found for user");
      res.status(503).json({ error: "Error de configuración de cuenta. Contactá a soporte." });
      return;
    }

    const token = signToken({ userId: user.id, tenantId: user.tenantId, email: user.email, role: user.role });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan },
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Error al iniciar sesión. Intentá de nuevo." });
  }
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email inválido" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email)).limit(1);
  if (!user) {
    res.json({ message: "Si el email existe, recibirás un enlace de recuperación en los próximos minutos." });
    return;
  }

  let resend: ReturnType<typeof getResend>;
  try {
    resend = getResend();
  } catch {
    req.log.warn("RESEND_API_KEY not configured — cannot send reset email");
    res.status(503).json({ error: "El servicio de email no está configurado. Contactá a soporte." });
    return;
  }

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await db.update(usersTable).set({ resetToken: token, resetTokenExpiry: expiry }).where(eq(usersTable.id, user.id));

  const resetLink = `${getBaseUrl(req)}/reset-password?token=${token}`;

  const { error: emailError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject: "Recuperación de contraseña — Clientum",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 16px;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr><td style="background:linear-gradient(135deg,#1a3a6b 0%,#2467a2 100%);padding:32px 40px;text-align:center;">
                <div style="display:inline-flex;align-items:center;gap:10px;">
                  <div style="width:36px;height:36px;background:#2563eb;border-radius:10px;display:inline-block;line-height:36px;text-align:center;font-weight:900;color:#fff;font-size:18px;">C</div>
                  <span style="color:#ffffff;font-size:20px;font-weight:700;vertical-align:middle;margin-left:8px;">Clientum</span>
                </div>
              </td></tr>
              <!-- Body -->
              <tr><td style="padding:40px 40px 32px;">
                <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">Recuperá tu contraseña</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                  Hola <strong style="color:#111827;">${user.name}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta en Clientum.
                </p>
                <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                  Hacé clic en el botón de abajo para crear una nueva contraseña. El enlace expira en <strong style="color:#111827;">1 hora</strong>.
                </p>
                <div style="text-align:center;margin-bottom:32px;">
                  <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(37,99,235,0.35);">
                    Restablecer contraseña
                  </a>
                </div>
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:24px;">
                  <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">O copiá este enlace en tu navegador</p>
                  <p style="margin:0;font-size:13px;color:#2467a2;word-break:break-all;">${resetLink}</p>
                </div>
                <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                  Si no solicitaste este cambio, podés ignorar este email. Tu contraseña no será modificada.
                </p>
              </td></tr>
              <!-- Footer -->
              <tr><td style="padding:20px 40px 28px;border-top:1px solid #f3f4f6;text-align:center;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Clientum · CRM para PyMEs argentinas</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });

  if (emailError) {
    req.log.error({ emailError }, "Resend error sending reset email");
    res.status(500).json({ error: "No se pudo enviar el email. Intentá de nuevo en unos minutos." });
    return;
  }

  res.json({ message: "Si el email existe, recibirás un enlace de recuperación en los próximos minutos." });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const parsed = z.object({ token: z.string().min(1), newPassword: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos. La contraseña debe tener al menos 8 caracteres." });
    return;
  }

  const { token, newPassword } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token)).limit(1);

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    res.status(400).json({ error: "El enlace de recuperación es inválido o expiró." });
    return;
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(usersTable).set({ passwordHash, resetToken: null, resetTokenExpiry: null }).where(eq(usersTable.id, user.id));

  res.json({ message: "Contraseña actualizada correctamente." });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const { userId, tenantId } = (req as unknown as AuthRequest).user;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);

  if (!user || !tenant) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan },
  });
});

export default router;
