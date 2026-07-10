import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = `${process.env.RESEND_FROM_NAME ?? "Clientum"} <${process.env.RESEND_FROM_EMAIL ?? "noreply@clientum.com.ar"}>`;
const YEAR = new Date().getFullYear();

function footer() {
  return `
    <tr><td style="padding:20px 40px 28px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">© ${YEAR} Clientum · CRM para PyMEs argentinas</p>
    </td></tr>
  `;
}

function header(title: string) {
  return `
    <tr><td style="background:linear-gradient(135deg,#1a3a6b 0%,#2467a2 100%);padding:28px 40px;text-align:center;">
      <div>
        <span style="display:inline-block;width:36px;height:36px;background:#2563eb;border-radius:10px;line-height:36px;text-align:center;font-weight:900;color:#fff;font-size:18px;vertical-align:middle;">C</span>
        <span style="color:#ffffff;font-size:20px;font-weight:700;vertical-align:middle;margin-left:8px;">Clientum</span>
      </div>
      <p style="margin:12px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">${title}</p>
    </td></tr>
  `;
}

function wrap(rows: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
      ${rows}
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function btn(label: string, href: string) {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(37,99,235,0.35);">${label}</a>
  </div>`;
}

function pill(label: string, color = "#2563eb") {
  return `<span style="display:inline-block;padding:3px 10px;background:${color}22;color:${color};border-radius:20px;font-size:12px;font-weight:600;">${label}</span>`;
}

function kv(rows: Array<[string, string]>) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
    ${rows.map(([k, v]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;width:40%;">${k}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;font-weight:600;text-align:right;">${v}</td>
      </tr>`).join("")}
  </table>`;
}

async function send(to: string, subject: string, html: string) {
  const { error } = await getResend().emails.send({ from: FROM, to, subject, html });
  return error;
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  orgName: string;
  appUrl: string;
}) {
  const { to, name, orgName, appUrl } = opts;
  const html = wrap(`
    ${header("¡Bienvenido a Clientum!")}
    <tr><td style="padding:40px 40px 32px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">¡Hola, ${name}! 👋</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6;">
        Tu cuenta en <strong style="color:#111827;">Clientum</strong> está lista. Ya podés gestionar contactos, leads, deals, facturas e inventario desde un solo lugar.
      </p>
      <div style="background:#f0f7ff;border-left:4px solid #2563eb;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#1e40af;"><strong>Organización:</strong> ${orgName}</p>
      </div>
      <p style="margin:0 0 8px;font-size:14px;color:#6b7280;font-weight:600;">Con Clientum podés:</p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
        <li>Gestionar contactos y empresas en un directorio centralizado</li>
        <li>Hacer seguimiento de leads y oportunidades en un pipeline kanban</li>
        <li>Emitir y controlar facturas con estados automatizados</li>
        <li>Registrar actividades: llamadas, reuniones, emails y tareas</li>
        <li>Administrar tu catálogo de productos e inventario</li>
      </ul>
      ${btn("Ir al dashboard", `${appUrl}/app/dashboard`)}
      <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
        ¿Necesitás ayuda? Respondé este email y te asistimos.
      </p>
    </td></tr>
    ${footer()}
  `);
  return send(to, "¡Bienvenido a Clientum! Tu cuenta está lista", html);
}

export async function sendInvoiceEmail(opts: {
  to: string;
  contactName: string;
  orgName: string;
  invoiceNumber: string;
  total: number;
  dueDate?: string | null;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  notes?: string | null;
  appUrl: string;
}) {
  const { to, contactName, orgName, invoiceNumber, total, dueDate, items, notes, appUrl } = opts;
  const fmt = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
  const itemsHtml = items.map(it => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${it.description}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:center;">${it.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:right;">${fmt(it.unitPrice)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;font-weight:700;text-align:right;">${fmt(it.total)}</td>
    </tr>`).join("");

  const html = wrap(`
    ${header(`Factura de ${orgName}`)}
    <tr><td style="padding:40px 40px 32px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
        <div>
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Factura</p>
          <h1 style="margin:0;font-size:26px;font-weight:800;color:#111827;">${invoiceNumber}</h1>
        </div>
        <div style="text-align:right;">
          ${pill("ENVIADA", "#059669")}
          ${dueDate ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Vencimiento: <strong style="color:#111827;">${new Date(dueDate).toLocaleDateString("es-AR")}</strong></p>` : ""}
        </div>
      </div>
      <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6;">
        Hola <strong style="color:#111827;">${contactName}</strong>, a continuación encontrás el detalle de tu factura emitida por <strong style="color:#111827;">${orgName}</strong>.
      </p>
      ${items.length > 0 ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 0;font-size:12px;color:#9ca3af;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Descripción</th>
            <th style="padding:10px 0;font-size:12px;color:#9ca3af;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Cant.</th>
            <th style="padding:10px 0;font-size:12px;color:#9ca3af;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Precio</th>
            <th style="padding:10px 0;font-size:12px;color:#9ca3af;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>` : ""}
      <div style="text-align:right;margin-top:16px;padding:16px;background:#f0f7ff;border-radius:10px;">
        <p style="margin:0;font-size:18px;font-weight:800;color:#1e40af;">Total: ${fmt(total)}</p>
      </div>
      ${notes ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-top:20px;"><p style="margin:0;font-size:13px;color:#6b7280;"><strong>Notas:</strong> ${notes}</p></div>` : ""}
      ${btn("Ver factura online", `${appUrl}/app/invoices`)}
    </td></tr>
    ${footer()}
  `);
  return send(to, `Factura ${invoiceNumber} de ${orgName}`, html);
}

export async function sendDealWonEmail(opts: {
  to: string;
  userName: string;
  dealTitle: string;
  value: number;
  contactName?: string | null;
  companyName?: string | null;
  appUrl: string;
}) {
  const { to, userName, dealTitle, value, contactName, companyName, appUrl } = opts;
  const fmt = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
  const details: Array<[string, string]> = [
    ["Deal", dealTitle],
    ["Valor", fmt(value)],
  ];
  if (contactName) details.push(["Contacto", contactName]);
  if (companyName) details.push(["Empresa", companyName]);

  const html = wrap(`
    ${header("¡Deal cerrado!")}
    <tr><td style="padding:40px 40px 32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;line-height:1;">🏆</div>
        <h1 style="margin:12px 0 4px;font-size:24px;font-weight:800;color:#111827;">¡Felicitaciones, ${userName}!</h1>
        <p style="margin:0;font-size:15px;color:#6b7280;">Cerraste un nuevo deal exitosamente</p>
      </div>
      <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Deal ganado</p>
        <p style="margin:0 0 4px;font-size:20px;font-weight:800;color:#15803d;">${dealTitle}</p>
        <p style="margin:0;font-size:26px;font-weight:900;color:#166534;">${fmt(value)}</p>
      </div>
      ${kv(details)}
      ${btn("Ver deal en Clientum", `${appUrl}/app/deals`)}
    </td></tr>
    ${footer()}
  `);
  return send(to, `🏆 Deal ganado: ${dealTitle}`, html);
}

export async function sendNewLeadEmail(opts: {
  to: string;
  userName: string;
  leadTitle: string;
  value: number;
  source?: string | null;
  contactName?: string | null;
  companyName?: string | null;
  appUrl: string;
}) {
  const { to, userName, leadTitle, value, source, contactName, companyName, appUrl } = opts;
  const fmt = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
  const details: Array<[string, string]> = [
    ["Lead", leadTitle],
    ["Valor estimado", fmt(value)],
  ];
  if (source) details.push(["Fuente", source]);
  if (contactName) details.push(["Contacto", contactName]);
  if (companyName) details.push(["Empresa", companyName]);

  const html = wrap(`
    ${header("Nuevo lead registrado")}
    <tr><td style="padding:40px 40px 32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:40px;line-height:1;">🎯</div>
        <h1 style="margin:12px 0 4px;font-size:22px;font-weight:800;color:#111827;">Nuevo lead ingresado</h1>
        <p style="margin:0;font-size:15px;color:#6b7280;">Hola <strong>${userName}</strong>, se registró una nueva oportunidad</p>
      </div>
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#1e40af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Lead</p>
        <p style="margin:0;font-size:18px;font-weight:800;color:#1e40af;">${leadTitle}</p>
        ${value > 0 ? `<p style="margin:6px 0 0;font-size:15px;color:#2563eb;font-weight:700;">Valor: ${fmt(value)}</p>` : ""}
      </div>
      ${kv(details)}
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
        Hacé seguimiento desde el pipeline de leads para no perder ninguna oportunidad.
      </p>
      ${btn("Ver en el pipeline", `${appUrl}/app/leads`)}
    </td></tr>
    ${footer()}
  `);
  return send(to, `🎯 Nuevo lead: ${leadTitle}`, html);
}

export async function sendInvoicePaidEmail(opts: {
  to: string;
  userName: string;
  invoiceNumber: string;
  total: number;
  contactName?: string | null;
  appUrl: string;
}) {
  const { to, userName, invoiceNumber, total, contactName, appUrl } = opts;
  const fmt = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
  const html = wrap(`
    ${header("Pago recibido")}
    <tr><td style="padding:40px 40px 32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;line-height:1;">💰</div>
        <h1 style="margin:12px 0 4px;font-size:22px;font-weight:800;color:#111827;">¡Pago recibido!</h1>
        <p style="margin:0;font-size:15px;color:#6b7280;">Hola <strong>${userName}</strong>, se registró un pago en tu cuenta</p>
      </div>
      <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;color:#166534;font-weight:600;">${invoiceNumber}</p>
        ${contactName ? `<p style="margin:0 0 8px;font-size:14px;color:#15803d;">Cliente: ${contactName}</p>` : ""}
        <p style="margin:0;font-size:28px;font-weight:900;color:#166534;">${fmt(total)}</p>
      </div>
      ${btn("Ver factura", `${appUrl}/app/invoices`)}
    </td></tr>
    ${footer()}
  `);
  return send(to, `💰 Pago recibido — ${invoiceNumber}`, html);
}
