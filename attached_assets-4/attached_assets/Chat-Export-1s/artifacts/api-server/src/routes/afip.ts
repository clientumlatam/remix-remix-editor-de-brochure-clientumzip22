import { Router, type Request, type Response } from "express";
import { db, afipConfigsTable, afipComprobantesTable, subscriptionsTable } from "@workspace/db";
import { eq, and, or, desc, count } from "drizzle-orm";
import forge from "node-forge";
import { getToken, refreshToken } from "../lib/afip/wsaa";
import { ultimoComprobante, solicitarCae, type InvoiceData } from "../lib/afip/wsfe";
import { requireAuth, type JwtPayload } from "../lib/auth";

const router = Router();
type AuthReq = Request & { user: JwtPayload };

function requireAfipPlan(plan: string | undefined): boolean {
  return ["business", "enterprise"].includes(plan ?? "");
}

async function getTenantPlan(tenantId: number): Promise<string> {
  const [sub] = await db.select({ plan: subscriptionsTable.plan })
    .from(subscriptionsTable)
    .where(and(
      eq(subscriptionsTable.tenantId, tenantId),
      or(eq(subscriptionsTable.status, "active"), eq(subscriptionsTable.status, "trialing")),
    )).limit(1);
  return sub?.plan ?? "free";
}

router.get("/afip/status", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const plan = await getTenantPlan(tenantId);
  const hasAccess = requireAfipPlan(plan);

  const [config] = await db.select({
    cuit:        afipConfigsTable.cuit,
    razonSocial: afipConfigsTable.razonSocial,
    puntoVenta:  afipConfigsTable.puntoVenta,
    environment: afipConfigsTable.environment,
    tokenExpiry: afipConfigsTable.tokenExpiry,
    certPem:     afipConfigsTable.certPem,
  }).from(afipConfigsTable).where(eq(afipConfigsTable.tenantId, tenantId)).limit(1);

  const configured = !!(config?.cuit && config?.certPem);
  const tokenVivo  = config?.tokenExpiry ? config.tokenExpiry > new Date() : false;
  const tokenHorasRestantes = config?.tokenExpiry
    ? Math.round((config.tokenExpiry.getTime() - Date.now()) / 3_600_000) : null;

  let certDiasRestantes: number | null = null;
  if (config?.certPem) {
    try {
      const cert = forge.pki.certificateFromPem(config.certPem);
      certDiasRestantes = Math.round((cert.validity.notAfter.getTime() - Date.now()) / 86_400_000);
    } catch { /* cert inválido */ }
  }

  const [ultimoComp] = hasAccess
    ? await db.select({
        numero:   afipComprobantesTable.numero,
        tipo:     afipComprobantesTable.tipo,
        fecha:    afipComprobantesTable.fecha,
        impTotal: afipComprobantesTable.impTotal,
      }).from(afipComprobantesTable)
        .where(eq(afipComprobantesTable.tenantId, tenantId))
        .orderBy(desc(afipComprobantesTable.createdAt))
        .limit(1)
    : [];

  const [totalRow] = hasAccess
    ? await db.select({ total: count() }).from(afipComprobantesTable).where(eq(afipComprobantesTable.tenantId, tenantId))
    : [];

  res.json({
    hasAccess, configured, tokenVivo, plan,
    cuit: config?.cuit ?? null,
    razonSocial: config?.razonSocial ?? null,
    puntoVenta: config?.puntoVenta ?? null,
    environment: config?.environment ?? "homologacion",
    tokenHorasRestantes, certDiasRestantes,
    ultimoComprobante: ultimoComp ?? null,
    totalComprobantes: totalRow?.total ?? 0,
  });
});

router.post("/afip/configure", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const plan = await getTenantPlan(tenantId);
  if (!requireAfipPlan(plan)) {
    res.status(403).json({ error: "AFIP disponible en plan Business o Enterprise" }); return;
  }

  const { cuit, razonSocial, puntoVenta, certPem, privateKeyPem, environment } = req.body as {
    cuit?: string; razonSocial?: string; puntoVenta?: number;
    certPem?: string; privateKeyPem?: string; environment?: string;
  };

  if (!cuit || !puntoVenta) {
    res.status(400).json({ error: "CUIT y punto de venta son requeridos" }); return;
  }

  const cuitClean = cuit.replace(/-/g, "");
  const [existing] = await db.select({ id: afipConfigsTable.id })
    .from(afipConfigsTable).where(eq(afipConfigsTable.tenantId, tenantId)).limit(1);

  const data: Partial<typeof afipConfigsTable.$inferInsert> = {
    tenantId,
    cuit: cuitClean,
    razonSocial: razonSocial ?? "",
    puntoVenta: Number(puntoVenta),
    environment: environment ?? "homologacion",
    updatedAt: new Date(),
  };
  if (certPem) data.certPem = certPem;
  if (privateKeyPem) data.privateKeyPem = privateKeyPem;

  if (existing) {
    await db.update(afipConfigsTable).set(data).where(eq(afipConfigsTable.tenantId, tenantId));
  } else {
    await db.insert(afipConfigsTable).values(data as typeof afipConfigsTable.$inferInsert);
  }

  res.json({ ok: true, message: "Configuración guardada correctamente" });
});

router.post("/afip/refresh-token", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const plan = await getTenantPlan(tenantId);
  if (!requireAfipPlan(plan)) {
    res.status(403).json({ error: "AFIP disponible en plan Business o Enterprise" }); return;
  }
  try {
    await refreshToken(tenantId);
    res.json({ ok: true, message: "Token AFIP renovado correctamente" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json({ ok: false, error: msg });
  }
});

router.post("/afip/test-connection", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const plan = await getTenantPlan(tenantId);
  if (!requireAfipPlan(plan)) {
    res.status(403).json({ error: "AFIP disponible en plan Business o Enterprise" }); return;
  }
  try {
    const { token, sign, cuit, puntoVenta } = await getToken(tenantId);
    const [config] = await db.select({ environment: afipConfigsTable.environment })
      .from(afipConfigsTable).where(eq(afipConfigsTable.tenantId, tenantId)).limit(1);
    const env = config?.environment ?? "homologacion";
    const ultimo = await ultimoComprobante(token, sign, cuit, puntoVenta, 11, env);
    res.json({ ok: true, message: `Conexión exitosa con AFIP (${env}). Último Tipo 11: ${ultimo}`, cuit, puntoVenta, environment: env });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json({ ok: false, error: msg });
  }
});

router.post("/afip/solicitar-cae", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const plan = await getTenantPlan(tenantId);
  if (!requireAfipPlan(plan)) {
    res.status(403).json({ error: "AFIP disponible en plan Business o Enterprise" }); return;
  }

  const { tipo = 11, concepto = 2, docTipo = 99, docNro = "0", impTotal, impNeto, impIva = 0, iva21Neto, iva105Neto, descripcion } = req.body as Partial<InvoiceData> & { descripcion?: string };

  if (!impTotal || isNaN(Number(impTotal))) {
    res.status(400).json({ error: "impTotal es requerido" }); return;
  }

  try {
    const { token, sign, cuit, puntoVenta } = await getToken(tenantId);
    const [config] = await db.select({ environment: afipConfigsTable.environment })
      .from(afipConfigsTable).where(eq(afipConfigsTable.tenantId, tenantId)).limit(1);
    const env = config?.environment ?? "homologacion";

    const inv: InvoiceData = {
      tipo: Number(tipo), concepto: Number(concepto), docTipo: Number(docTipo),
      docNro: String(docNro), impTotal: Number(impTotal), impNeto: Number(impNeto ?? impTotal),
      impIva: Number(impIva),
      iva21Neto: iva21Neto ? Number(iva21Neto) : undefined,
      iva105Neto: iva105Neto ? Number(iva105Neto) : undefined,
    };

    const result = await solicitarCae(token, sign, cuit, puntoVenta, inv, env);

    const [inserted] = await db.insert(afipComprobantesTable).values({
      tenantId,
      tipo: inv.tipo, numero: result.numero, puntoVenta,
      fecha: result.fecha, cae: result.cae, caeFchVto: result.caeFchVto,
      docTipo: inv.docTipo, docNro: inv.docNro,
      impTotal: String(inv.impTotal), impNeto: String(inv.impNeto), impIva: String(inv.impIva),
      concepto: inv.concepto, status: "emitida",
      descripcion: descripcion ?? null, rawResponse: JSON.stringify(result),
    }).returning();

    res.json({ ok: true, ...result, id: inserted.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json({ ok: false, error: msg });
  }
});

router.get("/afip/comprobantes", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const plan = await getTenantPlan(tenantId);
  if (!requireAfipPlan(plan)) {
    res.status(403).json({ error: "AFIP disponible en plan Business o Enterprise" }); return;
  }

  const comprobantes = await db.select()
    .from(afipComprobantesTable)
    .where(eq(afipComprobantesTable.tenantId, tenantId))
    .orderBy(desc(afipComprobantesTable.createdAt))
    .limit(100);

  res.json({ comprobantes, total: comprobantes.length });
});

router.get("/afip/comprobantes/stats", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const comprobantes = await db.select({ status: afipComprobantesTable.status, impTotal: afipComprobantesTable.impTotal })
    .from(afipComprobantesTable).where(eq(afipComprobantesTable.tenantId, tenantId));

  const total      = comprobantes.length;
  const totalMonto = comprobantes.reduce((s, c) => s + Number(c.impTotal), 0);
  const emitidas   = comprobantes.filter(c => c.status === "emitida").length;
  res.json({ total, totalMonto, emitidas });
});

export default router;
