import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// --- Auth: database pool, session store, and user routes ---
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
const PgSession = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
    role?: string;
  }
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET no está configurado. Es requerido para las sesiones de autenticación.");
}

app.use(
  session({
    store: new PgSession({ pool: pgPool, tableName: "session" }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    },
  })
);

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "No autenticado." });
  }
  next();
}

async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "No autenticado." });
  }
  try {
    // Re-check the role from the DB on every request instead of trusting the
    // session snapshot, so a role change/demotion takes effect immediately
    // without requiring the user to log out and back in.
    const result = await pgPool.query("SELECT role FROM users WHERE id = $1", [req.session.userId]);
    const currentRole = result.rows[0]?.role;
    if (currentRole !== "admin") {
      return res.status(403).json({ error: "Se requiere rol de administrador." });
    }
    req.session.role = currentRole;
    next();
  } catch (error) {
    console.error("Error verificando rol de administrador:", error);
    return res.status(500).json({ error: "Ocurrió un error al verificar permisos." });
  }
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos." });
    }
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ error: "El usuario debe tener entre 3 y 32 caracteres (letras, números, . _ -)." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
    }

    const existing = await pgPool.query("SELECT id FROM users WHERE username = $1", [username]);
    if ((existing.rowCount ?? 0) > 0) {
      return res.status(409).json({ error: "Ese usuario ya existe." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // The very first account created becomes admin so there's always someone
    // who can manage the Brochure/Contenido section; everyone after is "user".
    // Uses a single transaction with a table-level lock so two concurrent
    // first-registrations can't both observe count=0 and both become admin.
    const client = await pgPool.connect();
    let user: { id: number; username: string; role: string };
    try {
      await client.query("BEGIN");
      await client.query("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE");
      const { rows: countRows } = await client.query("SELECT COUNT(*)::int AS count FROM users");
      const role = countRows[0]?.count === 0 ? "admin" : "user";
      const inserted = await client.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role",
        [username, passwordHash, role]
      );
      user = inserted.rows[0];
      await client.query("COMMIT");
    } catch (txError) {
      await client.query("ROLLBACK");
      throw txError;
    } finally {
      client.release();
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error("Error regenerando sesión tras registro:", err);
        return res.status(500).json({ error: "Error al iniciar sesión tras el registro." });
      }
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Error guardando sesión tras registro:", saveErr);
          return res.status(500).json({ error: "Error al iniciar sesión tras el registro." });
        }
        return res.status(201).json({ user: { id: user.id, username: user.username, role: user.role } });
      });
    });
  } catch (error: any) {
    console.error("Error en /api/auth/register:", error);
    return res.status(500).json({ error: "Ocurrió un error al registrar el usuario." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos." });
    }

    const result = await pgPool.query("SELECT id, username, password_hash, role FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    // Always run a hash comparison to reduce username-enumeration timing signal.
    const validHash = user?.password_hash || "$2a$12$invalidsaltinvalidsaltinvalidsaltinvalidsaltinvalidsal";
    const isValid = await bcrypt.compare(password, validHash);

    if (!user || !isValid) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error("Error regenerando sesión tras login:", err);
        return res.status(500).json({ error: "Error al iniciar sesión." });
      }
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Error guardando sesión tras login:", saveErr);
          return res.status(500).json({ error: "Error al iniciar sesión." });
        }
        return res.json({ user: { id: user.id, username: user.username, role: user.role } });
      });
    });
  } catch (error: any) {
    console.error("Error en /api/auth/login:", error);
    return res.status(500).json({ error: "Ocurrió un error al iniciar sesión." });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error cerrando sesión:", err);
      return res.status(500).json({ error: "Ocurrió un error al cerrar sesión." });
    }
    res.clearCookie("connect.sid");
    return res.json({ ok: true });
  });
});

app.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "No autenticado." });
  }
  try {
    // Re-check the role from the DB instead of trusting the session snapshot,
    // so a role change/promotion (e.g. to "admin") is reflected in the UI
    // immediately, without requiring the user to log out and back in.
    const result = await pgPool.query("SELECT role FROM users WHERE id = $1", [req.session.userId]);
    const currentRole = result.rows[0]?.role;
    if (!currentRole) {
      return res.status(401).json({ error: "No autenticado." });
    }
    req.session.role = currentRole;
    return res.json({ user: { id: req.session.userId, username: req.session.username, role: currentRole } });
  } catch (error) {
    console.error("Error en /api/auth/me:", error);
    return res.status(500).json({ error: "Ocurrió un error al verificar la sesión." });
  }
});

// Lazy client initialization for safety
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    console.warn("[Gemini API] La clave GEMINI_API_KEY no está configurada o es de prueba. Las solicitudes usarán el fallback local de alta calidad.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper function to handle transient model errors, high demand (503), rate limits (429), and automatic fallback
async function generateContentWithFallback(
  ai: GoogleGenAI | null,
  options: {
    contents: any;
    config?: any;
    defaultModel?: string;
  }
) {
  if (!ai) {
    throw new Error("Cliente de IA no inicializado o clave de API faltante. Activando fallback local automático.");
  }
  const modelsToTry = [
    options.defaultModel || "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite"
  ];
  
  let lastError: any = null;
  
  for (const modelName of modelsToTry) {
    let attempts = 3;
    let delay = 1000;
    
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        console.log(`[Gemini Request] Intentando llamar con modelo: ${modelName} (Intento ${attempt}/${attempts})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        console.warn(`[Gemini Handled-Retry] Intento ${attempt}/${attempts} con ${modelName} falló (reintentando o usando fallback):`, error.message || error);
        
        const isRateLimitOrUnavailable = 
          error.status === 503 || 
          error.status === 429 || 
          error.message?.includes("503") || 
          error.message?.includes("429") ||
          error.message?.includes("UNAVAILABLE") ||
          error.message?.includes("RESOURCE_EXHAUSTED");
          
        if (isRateLimitOrUnavailable && attempt < attempts) {
          console.log(`[Gemini Retry] Reintentando en ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        } else {
          // Break the attempt loop to try the fallback model, or fail
          break;
        }
      }
    }
  }
  
  throw lastError || new Error("Error: Fallaron todos los intentos con todos los modelos disponibles.");
}

// API Routes
// --- HIGH-QUALITY LOCAL FALLBACK GENERATORS (when Gemini API is out of quota/429) ---

function getMockIndustryCopy(industry: string): any {
  const normalized = (industry || "").toLowerCase().trim();
  
  if (normalized.includes("agr") || normalized.includes("camp") || normalized.includes("campo") || normalized.includes("logist")) {
    return {
      cover: {
        slogan: `Optimización para ${industry} con tecnología de punta.`,
        sub: `Seguimiento de procesos, bot de WhatsApp para consultas de ${industry}, ruteo logístico y CRM especializado de Clientum.`
      },
      chatbot: {
        title: `Atención y cotizaciones automáticas para ${industry} 24/7.`,
        features: [
          { title: "Respuestas al instante", desc: "El bot responde consultas sobre tarifas, disponibilidad y valores de servicios al instante." },
          { title: "Reportes automáticos", desc: "Envía avisos de carga y estados de pedidos directo al cliente." },
          { title: "Toma de reservas rápida", desc: "Toma solicitudes de servicios y productos desde WhatsApp." },
          { title: "Alertas personalizadas", desc: "Comparte alertas de estado y geolocalizadas automáticas a los operarios." }
        ],
        flowSteps: [
          `El cliente escribe al WhatsApp solicitando cotización de ${industry}`,
          "La IA de Clientum consulta la base de stock o servicios y cotiza en pesos al instante",
          "El cliente confirma la operación enviando sus datos o ubicación de Google Maps",
          `Se genera la orden automática en el CRM especializado para tu equipo`
        ]
      },
      crm: {
        title: `Trazabilidad completa de tu cadena en ${industry}.`,
        features: [
          { title: "Control de estados visual", desc: "Arrastrá y soltá transacciones según el estado operativo en tiempo real." },
          { title: "Clientes y subcontratistas", desc: "Todo el historial de servicios, deudas y contratos en un perfil único." },
          { title: "Geolocalización integrada", desc: "Mapa de operaciones y logísticas asociadas en tiempo real." }
        ]
      },
      services: [
        {
          title: `Consultoría de Procesos de ${industry}`,
          desc: "Automatizamos pesaje, recepción y optimización de flotas. Ahorro de costos promedio del 25%.",
          bullets: ["Auditoría de puntos operativos", "Optimización de despachos", "Retorno de inversión rápida", "Soporte personalizado"]
        },
        {
          title: "ERP Integrado",
          desc: "Facturación electrónica con liquidaciones AFIP incorporadas en pesos de forma ágil.",
          bullets: ["Control en tiempo real", "Ventas multimedios", "Trazabilidad de operaciones", "Monitoreo constante"]
        },
        {
          title: "Logística y Ruteo Inteligente",
          desc: `Catálogo digital y tracking en vivo de despachos de ${industry} vinculados al CRM de Clientum.`,
          bullets: ["App móvil para transportes integrada", "MercadoPago y cuenta corriente", "Posicionamiento en Google", "Almacenaje inteligente"]
        }
      ],
      testimonial: {
        text: `Logramos coordinar todas nuestras operaciones diarias con solo la mitad del esfuerzo usando el bot de WhatsApp de Clientum. El sistema automatizado nos ahorró horas de trabajo administrativo.`,
        author: "Gustavo B.",
        company: `Servicios Patagónicos — General Roca`
      },
      outreachEmail: `Asunto: Automatización de WhatsApp y CRM para tu empresa de ${industry} 🚀\n\nHola,\n\nEspero que estés muy bien. Me pongo en contacto porque sé que en el rubro de ${industry}, responder a tiempo las consultas de WhatsApp y coordinar las ventas/servicios suele ser un cuello de botella.\n\nCon Clientum creamos un sistema con Chatbot de WhatsApp 24/7 y CRM automatizado que ayuda a marcas de tu rubro a responder consultas al instante y asegurar que ningún cliente se pierda.\n\n¿Tendrás 15 minutos esta semana para una charla rápida por Meet o una llamada y ver cómo podemos potenciar tus ventas?\n\nUn saludo cordial!`
    };
  }

  if (normalized.includes("gastr") || normalized.includes("rest") || normalized.includes("comid") || normalized.includes("caf") || normalized.includes("bar") || normalized.includes("gourmet")) {
    return {
      cover: {
        slogan: `Revolucioná tu negocio de ${industry} en piloto automático.`,
        sub: `Chatbot para reservas de mesas o pedidos de comida, toma de comandas automática, encuestas de satisfacción y CRM gastronómico.`
      },
      chatbot: {
        title: `Reservas, pedidos y fidelización en ${industry} 24/7.`,
        features: [
          { title: "Reservas 24/7 sin llamadas", desc: "Evitá llamadas en hora pico. El bot gestiona la capacidad y confirma la reserva al instante." },
          { title: "Toma de pedidos y Delivery", desc: "Los clientes cargan su plato o pedido desde WhatsApp y pagan vía link de MercadoPago." },
          { title: "Fidelización de Comensales", desc: "Envía promociones segmentadas según el historial de consumo de cada cliente." },
          { title: "Encuestas de satisfacción", desc: "Califica la experiencia al finalizar la entrega o visita para mejorar el servicio." }
        ],
        flowSteps: [
          `Un cliente escribe pidiendo mesa o delivery para el fin de semana`,
          "El bot consulta la disponibilidad en tiempo real en tu CRM de Clientum",
          "Le envía la confirmación con un link de pago o código QR para agilizar",
          "Se genera la comanda automática en la cocina y se asigna el repartidor"
        ]
      },
      crm: {
        title: "La ficha de cada cliente en la palma de tu mano.",
        features: [
          { title: "Perfil de Clientes", desc: "Registrá preferencias de consumo, reciclados, cumpleaños y frecuencias de visita." },
          { title: "Historial de Consumos", desc: "Controlá qué platos o productos se venden más y cuáles tienen mejor margen de ganancia." },
          { title: "Pipeline de Eventos", desc: "Gestioná cotizaciones de catering corporativos y reservas grupales de forma visual." }
        ]
      },
      services: [
        {
          title: "Consultoría de Experiencia del Cliente",
          desc: "Optimización de tiempos de servicio y diseño de menús digitales interactivos. +20% cubiertos diarios.",
          bullets: ["Diagnóstico de rotación", "Estrategia de fidelización", "Aumento de ticket promedio", "Integración de carta digital"]
        },
        {
          title: "Integración de Cocina y Despachos",
          desc: "Conectamos el bot de WhatsApp directo con tu sistema de comanda para evitar demoras y confusiones.",
          bullets: ["Envío instantáneo a comanderas", "Control de tiempos de cocina", "Notificación automática al mozo/repartidor", "Cero comandas perdidas"]
        },
        {
          title: "Marketing Local Automatizado",
          desc: `Campañas de atracción segmentadas por geolocalización vinculadas directamente a tu CRM de Clientum.`,
          bullets: ["Captura de leads en Instagram", "E-marketing para cumpleaños", "Estrategias de hora feliz", "Reportes de ROI en tiempo real"]
        }
      ],
      testimonial: {
        text: `El 60% de nuestras reservas y pedidos del fin de semana ahora se hacen solas por el bot de WhatsApp. Redujimos notablemente las llamadas perdidas y aumentamos la facturación.`,
        author: "Sofía G.",
        company: `Delicias Gourmet — Bariloche`
      },
      outreachEmail: `Asunto: Automatización de reservas y pedidos para tu negocio de ${industry} 🍽️\n\nHola,\n\nEspero que estés muy bien. Me pongo en contacto porque sé que en el rubro de ${industry}, la atención de consultas rápidas en WhatsApp y la toma de pedidos suele colapsar al equipo en horas pico.\n\nCon Clientum creamos un sistema con Chatbot de WhatsApp 24/7 y CRM automatizado que ayuda a marcas de tu rubro a automatizar reservas y pedidos, asegurando una experiencia rápida.\n\n¿Tendrás 15 minutos esta semana para una charla rápida y ver cómo podemos potenciar tu local?\n\nUn saludo cordial!`
    };
  }

  if (normalized.includes("inmob") || normalized.includes("prop") || normalized.includes("casa") || normalized.includes("dep") || normalized.includes("real estate") || normalized.includes("construc")) {
    return {
      cover: {
        slogan: "Agendá visitas y calificá interesados en piloto automático.",
        sub: "WhatsApp Chatbot para tasaciones y filtros de propiedades, CRM de inmuebles integrado y contratos digitales en pesos."
      },
      chatbot: {
        title: "Tu guardia inmobiliaria, activa todos los días.",
        features: [
          { title: "Filtro de ambientes y precios", desc: "El bot envía catálogos de departamentos que se ajustan al presupuesto del lead." },
          { title: "Agendamiento de visitas", desc: "Sincroniza agendas de los martilleros para visitas presenciales a los departamentos." },
          { title: "Requisitos de alquiler express", desc: "Informa requisitos (garantías propietarias, recibos de sueldo) sin llamadas previas." },
          { title: "Tasaciones preliminares", desc: "Recopila metros cuadrados, zona y estado para cotizar estimaciones de alquiler." }
        ],
        flowSteps: [
          "El lead ve un cartel en un balcón y escribe al QR de WhatsApp de Clientum",
          "El bot le envía fotos, expensas y mapa de ubicación del departamento",
          "La IA le pregunta sus ingresos mensuales para calificarlo según políticas",
          "Agenda día y hora con el corredor de la firma enviándole el recordatorio"
        ]
      },
      crm: {
        title: "Toda tu cartera de propiedades bajo control.",
        features: [
          { title: "Pipeline Inmobiliario", desc: "Etapas desde 'Interesado', 'Visita agendada', 'Seña entregada' hasta 'Contrato firmado'." },
          { title: "Fichas de Inmuebles", desc: "Unifica fotos, planos, contratos históricos y estados de pagos en una sola pantalla." },
          { title: "Seguimiento de expensas", desc: "Envía recordatorios automáticos de cobros mensuales de alquileres y expensas." }
        ]
      },
      services: [
        {
          title: "Sistemas de Gestión de Alquileres",
          desc: "Automatización de contratos, cobros por transferencia e indexaciones del ICL automatizadas.",
          bullets: ["Cálculo automático de aumentos", "Factura de alquiler AFIP express", "Soporte legal integrado", "Panel de propietarios"]
        },
        {
          title: "E-Commerce Inmobiliario",
          desc: "Plataforma web premium con filtros avanzados, mapas interactivos de barrios cerrados y renders 3D.",
          bullets: ["SEO específico de zonas", "Generador automático de fichas PDF", "Botón de seña MercadoPago", "Integración portales nacionales"]
        },
        {
          title: "Marketing para Desarrolladoras",
          desc: "Embudo de captación de inversores de pozo. Segmentación en redes sociales con CRM trackeado.",
          bullets: ["Leads de pozo precalificados", "Folletería digital dinámica", "Envío masivo de avances de obra", "Medición exacta del ROI"]
        }
      ],
      testimonial: {
        text: "Nuestras guardias de fin de semana ahora están 100% automatizadas. El bot califica al interesado, le muestra fotos del departamento y le agenda la cita. Increíble.",
        author: "Gabriela S.",
        company: "Inmobiliaria Pilar Propiedades — Buenos Aires"
      },
      outreachEmail: `Asunto: Automatización de visitas e interesados para tu inmobiliaria 🏢\n\nHola,\n\nEspero que estés muy bien. Me pongo en contacto porque sé que en el rubro inmobiliario, la clasificación de interesados y el agendamiento de visitas físicas consume muchísimo tiempo de tus agentes.\n\nCon Clientum creamos un sistema con Chatbot de WhatsApp 24/7 and CRM especializado que ayuda a inmobiliarias a calificar interesados de forma automática según presupuesto y requisitos, agendando visitas solas.\n\n¿Tendrás 15 minutos esta semana para una charla rápida y ver cómo podemos potenciar tus propiedades?\n\nUn saludo cordial!`
    };
  }

  if (normalized.includes("salu") || normalized.includes("med") || normalized.includes("clin") || normalized.includes("estet") || normalized.includes("odont") || normalized.includes("dent")) {
    return {
      cover: {
        slogan: "Gestión de turnos médicos y recordatorios automáticos.",
        sub: "El bot agenda citas según la disponibilidad del profesional, envía recordatorios de ausentismo y centraliza el CRM de pacientes."
      },
      chatbot: {
        title: "Tu guardia de turnos médica, activa todos los días.",
        features: [
          { title: "Agendamiento automático de turnos", desc: "El paciente elige el profesional, la especialidad y el horario desde WhatsApp." },
          { title: "Recordatorios preventivos", desc: "Reduce el ausentismo enviando avisos de confirmación 24 horas antes del turno." },
          { title: "Ficha médica digital", desc: "Visualizá historias clínicas, indicaciones y estudios adjuntos en el CRM." },
          { title: "Atención post-consulta", desc: "Sigue la recuperación del paciente con encuestas de evolución automáticas." }
        ],
        flowSteps: [
          "El paciente escribe solicitando un turno para odontología o medicina",
          "El bot consulta la agenda de los doctores en el CRM y ofrece horarios libres",
          "El paciente selecciona el horario y recibe los requisitos de preparación",
          "Se le envía un recordatorio automático de confirmación con opción de reprogramar"
        ]
      },
      crm: {
        title: "Historias clínicas y agendas perfectamente coordinadas.",
        features: [
          { title: "Ficha del Paciente", desc: "Historias clínicas digitales completas, adjuntos de estudios y notas del doctor." },
          { title: "Control de Ausentismo", desc: "Métricas claras de asistencia, cancelaciones y reprogramaciones en tiempo real." },
          { title: "Facturación a Obras Sociales", desc: "Registro automático de órdenes médicas, coseguros y liquidaciones prepagas." }
        ]
      },
      services: [
        {
          title: "Sistemas de Gestión de Clínicas",
          desc: "Automatización de agendas de múltiples profesionales, cobros de consultas e integración de telemedicina.",
          bullets: ["Sincronización Google Calendar", "Control de turnos cancelados", "Firma digital de recetas", "Factura electrónica AFIP"]
        },
        {
          title: "Portal de Pacientes Inteligente",
          desc: "Sitio web para autogestión de turnos, descarga de resultados de laboratorios e historial integrado con el CRM.",
          bullets: ["Autenticación segura", "Filtro de especialistas", "Pasarela de pagos coseguro", "Soporte multi-clínica"]
        },
        {
          title: "Marketing para Centros de Estética y Salud",
          desc: "Embudos de captación para tratamientos de alto valor. Captura inteligente de leads en redes sociales.",
          bullets: ["Seguimiento de tratamientos", "Folletería digital interactiva", "Promociones por temporada", "Costo por consulta optimizado"]
        }
      ],
      testimonial: {
        text: "Redujimos el ausentismo en los turnos de estética en un 45% en solo dos meses. Los recordatorios de WhatsApp automáticos funcionan de maravilla.",
        author: "Paula D.",
        company: "Clínica de Estética Vital — Neuquén"
      },
      outreachEmail: `Asunto: Automatización de turnos y reducción de ausentismo para tu centro médico 🩺\n\nHola,\n\nEspero que estés muy bien. Me pongo en contacto porque sé que en el rubro de la salud y estética, coordinar agendas de turnos y lidiar con el ausentismo de pacientes de último minuto es un gran dolor de cabeza administrativo.\n\nCon Clientum creamos un sistema con Chatbot de WhatsApp 24/7 y CRM que permite a tus pacientes reservar turnos solos de manera ágil, y les envía recordatorios automatizados de confirmación.\n\n¿Tendrás 15 minutos esta semana para una charla rápida por Meet o una llamada y ver cómo podemos implementarlo en tu centro?\n\nUn saludo cordial!`
    };
  }

  // Default PyME fallback
  return {
    cover: {
      slogan: `La revolución digital para tu negocio de ${industry}.`,
      sub: `Llegá a más clientes con un Chatbot de WhatsApp 24/7, CRM de ventas ágil, automatizaciones de contacto y facturación integrada.`
    },
    chatbot: {
      title: `Atención automatizada 24/7 para ${industry}.`,
      features: [
        { title: "Respuestas al instante", desc: "Tus clientes reciben respuestas instantáneas a preguntas frecuentes de WhatsApp las 24 horas." },
        { title: "Calificación inteligente", desc: "Filtra interesados verdaderos recopilando datos de contacto, rubro y presupuesto." },
        { title: "Agendamiento automático", desc: "El bot coordina citas y reuniones directamente con tu agenda integrada en tiempo real." },
        { title: "Cotizaciones veloces", desc: "Calcula precios y envía presupuestos personalizados al cliente en formato PDF." }
      ],
      flowSteps: [
        `El cliente escribe a tu WhatsApp preguntando por tus servicios de ${industry}`,
        "El bot de Clientum responde al instante con tu catálogo y preguntas de calificación",
        "El prospecto elige un servicio, completa sus datos de contacto y confirma el interés",
        "El lead llega caliente al CRM Clientum con alerta instantánea para tu equipo"
      ]
    },
    crm: {
      title: "Controlá todo tu embudo de ventas sin perder un solo lead.",
      features: [
        { title: "Pipeline visual", desc: "Mové tus prospectos entre las etapas de venta mediante arrastrar y soltar de forma simple." },
        { title: "Historial unificado", desc: "Toda la conversación, emails y notas de cada cliente en un solo lugar centralizado." },
        { title: "Tareas automáticas", desc: "Creá recordatorios y seguimientos automáticos para que tu equipo nunca se olvide de llamar." }
      ]
    },
    services: [
      {
        title: "Implementación del CRM Clientum",
        desc: `Configuramos tu pipeline de ventas y cargamos tu base de clientes actual adaptado a ${industry}. Listo en 5 días.`,
        bullets: ["Setup inicial completo", "Capacitación en vivo para tu equipo", "Soporte prioritario por WhatsApp", "Garantía de adaptación"]
      },
      {
        title: "Diseño de Chatbot de WhatsApp",
        desc: "Creamos los flujos de conversación de tu bot con IA para automatizar la atención inicial y captación.",
        bullets: ["Integración oficial Meta API", "Calificación automática", "Agendamiento con Google Calendar", "Estadísticas completas de chats"]
      },
      {
        title: "Consultoría de Ventas Digitales",
        desc: "Estrategia para acelerar tu proceso comercial y multiplicar la tasa de cierre de ventas en tu empresa.",
        bullets: ["Análisis de procesos comerciales", "Diseño de embudo de captación", "Auditorías de tasa de conversión", "Reuniones de evolución mensual"]
      }
    ],
    testimonial: {
      text: `Clientum cambió la forma de trabajar de nuestro equipo. Atendemos el triple de consultas de WhatsApp y la organización en el CRM nos permitió duplicar los cierres.`,
      author: "Martín R.",
      company: `Comercial Patagónica S.A.`
    },
    outreachEmail: `Asunto: Automatización de WhatsApp y CRM para tu empresa de ${industry} 🚀\n\nHola,\n\nEspero que estés muy bien. Me pongo en contacto porque sé que en el rubro de ${industry}, responder a tiempo las consultas de WhatsApp y coordinar las ventas suele ser complejo.\n\nCon Clientum creamos un sistema con Chatbot de WhatsApp 24/7 y CRM automatizado que ayuda a PyMEs locales a responder consultas al instante y asegurar que ningún cliente se pierda.\n\n¿Tendrás 15 minutos esta semana para una charla rápida por Meet o una llamada y ver cómo podemos potenciar tus ventas?\n\nUn saludo cordial!`
  };
}

function getMockProspects(city: string, industry: string): any {
  const cityClean = city || "General Roca";
  const indClean = industry || "Comercio";

  const genericNames = [
    { name: `Distribuidora ${cityClean}`, address: "San Martín 450" },
    { name: `${indClean} del Sol`, address: "9 de Julio 820" },
    { name: `Ferretería Central ${cityClean}`, address: "Av. Roca 1234" },
    { name: `Inmobiliaria de la Comarca`, address: "Belgrano 345" },
    { name: `Consultorios Médicos del Valle`, address: "Tucumán 910" },
    { name: `Servicios Integrales ${cityClean}`, address: "Mitre 670" },
    { name: `Comercio Norte ${cityClean}`, address: "España 230" },
    { name: `${indClean} Patagónica`, address: "Olascoaga 540" },
    { name: `Empresa Sur S.R.L.`, address: "Yrigoyen 190" },
    { name: `${indClean} del Comahue`, address: "Alsina 880" },
    { name: `Proveedora Roca S.A.`, address: "Av. Roca 2100" },
    { name: `Centro Comercial ${cityClean}`, address: "9 de Julio 410" },
    { name: `${indClean} Austral`, address: "San Martín 1780" },
    { name: `Soluciones del Valle`, address: "Belgrano 620" },
    { name: `${indClean} Norte Patagónico`, address: "Tucumán 490" },
    { name: `Grupo Empresarial ${cityClean}`, address: "Mitre 1340" },
    { name: `${indClean} del Río Negro`, address: "Av. Argentina 560" },
    { name: `Comercial Los Álamos`, address: "España 1100" },
    { name: `${indClean} Las Bardas`, address: "Olascoaga 970" },
    { name: `Servicios Profesionales Sur`, address: "Yrigoyen 750" }
  ];

  let names = [...genericNames];
  const indLower = indClean.toLowerCase();
  
  if (indLower.includes("agr") || indLower.includes("camp")) {
    names = [
      { name: `Cereales del Limay S.A.`, address: "Ruta 22 Km 1205" },
      { name: `Agropecuaria El Ombú`, address: "Av. San Martín 150" },
      { name: `Frutas de la Patagonia S.A.`, address: "Ruta Nacional 151" },
      { name: `Riego e Insumos del Comahue`, address: "Mitre 780" },
      { name: `Logística Rural Valle Alto`, address: "Alsina 1420" },
      { name: `Semillas Patagónicas S.R.L.`, address: "Ruta 22 Km 1190" },
      { name: `Acopio y Granos del Sur`, address: "Av. Roca 880" },
      { name: `Agroquímica del Comahue`, address: "España 340" },
      { name: `Cooperativa Agropecuaria ${cityClean}`, address: "San Martín 1200" },
      { name: `Insumos Rurales Patagonia`, address: "Belgrano 760" },
      { name: `Maquinaria Agrícola Norte`, address: "Yrigoyen 490" },
      { name: `Ganadería Los Álamos`, address: "Ruta 6 Km 23" },
      { name: `Forrajes y Pasturas del Valle`, address: "Mitre 1100" },
      { name: `Agroveterinaria del Rio Negro`, address: "Olascoaga 620" },
      { name: `Granja Integral ${cityClean}`, address: "Alsina 340" },
      { name: `Exportadora Frutihortícola Sur`, address: "Ruta 22 Km 1215" },
      { name: `Irrigación y Riego S.A.`, address: "Tucumán 870" },
      { name: `Fertinorte S.R.L.`, address: "España 1050" },
      { name: `Campo Verde Agroinsumos`, address: "9 de Julio 540" },
      { name: `Vivero Patagónico del Comahue`, address: "Av. Roca 1650" }
    ];
  } else if (indLower.includes("inmob") || indLower.includes("prop") || indLower.includes("construc")) {
    names = [
      { name: `Inmobiliaria ${cityClean}`, address: "Av. Roca 560" },
      { name: `Martilleros Asociados del Neuquén`, address: "Olascoaga 340" },
      { name: `Constructora del Valle`, address: "Belgrano 120" },
      { name: `Propiedades de la Patagonia`, address: "San Martín 890" },
      { name: `Estudio Inmobiliario Sur`, address: "Yrigoyen 410" },
      { name: `Inversiones Inmobiliarias del Comahue`, address: "Mitre 670" },
      { name: `Desarrollos Urbanos Patagonia`, address: "España 980" },
      { name: `Corredores del Río Negro S.R.L.`, address: "Alsina 230" },
      { name: `Constructora Patagónica S.A.`, address: "9 de Julio 1350" },
      { name: `Emprendimientos del Valle`, address: "Tucumán 780" },
      { name: `Hormigón y Construcciones Norte`, address: "Av. Roca 1890" },
      { name: `Tasaciones y Pericias ${cityClean}`, address: "Belgrano 450" },
      { name: `Inmobiliaria Araucanía`, address: "San Martín 1230" },
      { name: `Estudio Martillero Patagónico`, address: "Olascoaga 760" },
      { name: `Materiales de Construcción Sur`, address: "España 430" },
      { name: `Administración de Propiedades ${cityClean}`, address: "Mitre 990" },
      { name: `Loteos y Subdivisiones del Valle`, address: "Yrigoyen 610" },
      { name: `Arquitectura Patagónica S.R.L.`, address: "9 de Julio 870" },
      { name: `Corralón de Materiales Limay`, address: "Alsina 1450" },
      { name: `Desarrollos Residenciales Norte`, address: "Av. Argentina 340" }
    ];
  } else if (indLower.includes("gastr") || indLower.includes("rest") || indLower.includes("comid")) {
    names = [
      { name: `Restó Estación ${cityClean}`, address: "Tucumán 120" },
      { name: `Café de la Comarca`, address: "San Martín 430" },
      { name: `Pizzería Don Corleone`, address: "Av. Roca 850" },
      { name: `La Parrilla de ${cityClean}`, address: "Ruta 22 Km 1198" },
      { name: `Cervecería Artesanal Limay`, address: "Olascoaga 780" },
      { name: `Bodegón del Neuquén`, address: "Belgrano 560" },
      { name: `Confitería del Valle`, address: "España 340" },
      { name: `Sushi & Wok Patagónico`, address: "Mitre 1120" },
      { name: `Heladería Los Pioneros`, address: "9 de Julio 670" },
      { name: `Empanadas Roca S.R.L.`, address: "Yrigoyen 230" },
      { name: `Delivery del Sur`, address: "Alsina 890" },
      { name: `Resto Bar La Comarca`, address: "San Martín 1560" },
      { name: `Cafetería La Mañana`, address: "Av. Roca 340" },
      { name: `Panadería y Pastelería del Valle`, address: "Tucumán 780" },
      { name: `Fast Food Patagónico`, address: "España 1230" },
      { name: `Catering Eventos del Sur`, address: "Belgrano 890" },
      { name: `Vinoteca y Tapas ${cityClean}`, address: "Olascoaga 450" },
      { name: `Comida Casera El Mitre`, address: "Mitre 670" },
      { name: `Vermutería del Comahue`, address: "9 de Julio 980" },
      { name: `Rotisería y Viandas Norte`, address: "Yrigoyen 540" }
    ];
  } else if (indLower.includes("salu") || indLower.includes("med") || indLower.includes("clin") || indLower.includes("estet")) {
    names = [
      { name: `Clínica de la Comarca`, address: "Av. Roca 980" },
      { name: `Sanatorio Río Negro S.A.`, address: "Tucumán 340" },
      { name: `Centro Odontológico San Lucas`, address: "Belgrano 510" },
      { name: `Estética y Salud Integral`, address: "9 de Julio 760" },
      { name: `Consultorios Médicos del Comahue`, address: "España 120" },
      { name: `Centro de Diagnóstico del Valle`, address: "San Martín 670" },
      { name: `Fisioterapia y Kinesiología Norte`, address: "Mitre 890" },
      { name: `Óptica Patagónica`, address: "Olascoaga 230" },
      { name: `Farmacia del Valle S.R.L.`, address: "Alsina 1340" },
      { name: `Centro de Salud Mental ${cityClean}`, address: "Yrigoyen 560" },
      { name: `Laboratorio de Análisis Clínicos`, address: "Av. Roca 450" },
      { name: `Centro Oncológico del Sur`, address: "Tucumán 1100" },
      { name: `Maternidad y Obstetricia ${cityClean}`, address: "España 780" },
      { name: `Clínica Veterinaria del Comahue`, address: "Belgrano 890" },
      { name: `Spa & Wellness Patagónico`, address: "San Martín 1450" },
      { name: `Centro Quirúrgico del Valle`, address: "9 de Julio 340" },
      { name: `Radiología e Imágenes Norte`, address: "Mitre 670" },
      { name: `Nutrición y Dietética del Sur`, address: "Olascoaga 980" },
      { name: `Psicología y Psicopedagogía ${cityClean}`, address: "Alsina 450" },
      { name: `Centro de Rehabilitación Limay`, address: "España 1230" }
    ];
  } else if (indLower.includes("distr") || indLower.includes("mayor") || indLower.includes("comerc")) {
    names = [
      { name: `Distribuidora ${cityClean} S.R.L.`, address: "San Martín 1500" },
      { name: `Mayorista del Valle`, address: "Ruta 22 Km 1200" },
      { name: `Ferretería El Candado`, address: "Av. Roca 430" },
      { name: `Comercial Patagónica S.A.`, address: "9 de Julio 120" },
      { name: `Corralón del Sur`, address: "Alsina 910" },
      { name: `Importadora Comahue S.R.L.`, address: "España 670" },
      { name: `Distribuidora de Bebidas Norte`, address: "Mitre 1340" },
      { name: `Proveedor Gastronómico del Valle`, address: "Olascoaga 560" },
      { name: `Mayorista de Limpieza Patagónica`, address: "Yrigoyen 780" },
      { name: `Comercio Sur S.A.`, address: "Tucumán 450" },
      { name: `Distribuidora Textil del Comahue`, address: "Belgrano 1120" },
      { name: `Repuestos y Autopartes Norte`, address: "Av. Roca 1780" },
      { name: `Insumos Industriales ${cityClean}`, address: "España 980" },
      { name: `Mayorista de Alimentos del Sur`, address: "San Martín 2100" },
      { name: `Distribuidora Electrónica Patagónica`, address: "Mitre 430" },
      { name: `Comercio Unido del Valle`, address: "9 de Julio 890" },
      { name: `Proveedor de Oficinas ${cityClean}`, address: "Alsina 670" },
      { name: `Mayorista de Herramientas Norte`, address: "Olascoaga 1230" },
      { name: `Distribución y Logística del Sur`, address: "Yrigoyen 340" },
      { name: `Corralón y Materiales Comahue`, address: "Av. Argentina 890" }
    ];
  }

  const prospects = names.map((item, idx) => {
    const amount = 150000 + idx * 45000;
    const phonePrefix = cityClean.toLowerCase().includes("neuqu") ? "299" : "298";
    const phone = `+54 ${phonePrefix} 4${Math.floor(100000 + Math.random() * 900000)}`;
    const contacts = [
      "Ing. Marcos S.", "Laura G.", "Carlos M.", "Lic. Rodríguez", "Sofía Fernández",
      "Andrés P.", "Valeria T.", "Diego N.", "Mariela H.", "Gustavo R.",
      "Luciana B.", "Facundo L.", "Romina V.", "Pablo E.", "Cecilia M.",
      "Sebastián O.", "Natalia F.", "Hernán C.", "Florencia A.", "Maximiliano D."
    ];
    const painPoints = [
      "Atiende consultas de WhatsApp de forma manual y tarda hasta 12 horas en responder.",
      "Tiene base de clientes en Excel desactualizada y pierde seguimiento de presupuestos.",
      "No cuenta con embudo de ventas claro; los vendedores agendan reuniones por su cuenta.",
      "Sufre de ausentismo en reservas/turnos y no tiene recordatorios automáticos.",
      "Gestiona reclamos e historial de compras sin un sistema centralizado, generando demoras.",
      "Pierde ventas porque no responde cotizaciones fuera del horario comercial.",
      "No tiene visibilidad de qué vendedor está siguiendo qué cliente en cada momento.",
      "Sus campañas de WhatsApp son manuales y consumen horas del equipo cada semana.",
      "No cuenta con integración digital con AFIP para facturación automática.",
      "Carece de reportes de ventas; las decisiones se toman sin datos concretos.",
      "Los nuevos leads del sitio web se pierden porque nadie los registra en tiempo real.",
      "Agenda de turnos gestionada por teléfono; muchos clientes no aparecen sin aviso.",
      "No tiene un canal centralizado: atiende por WhatsApp, email e Instagram por separado.",
      "Su CRM actual es una hoja de cálculo compartida con versiones desincronizadas.",
      "Desconoce el LTV de sus clientes y no tiene estrategia de retención activa.",
      "Su equipo de ventas no tiene acceso móvil al historial de clientes en visitas.",
      "Genera propuestas en Word y las envía por email sin seguimiento automatizado.",
      "No puede medir el ROI de sus acciones comerciales ni de publicidad digital.",
      "Pierde clientes recurrentes porque no tiene alertas de renovación de contrato.",
      "Su proceso de onboarding de nuevos clientes es manual y tarda varios días."
    ];

    return {
      company: item.name,
      industry: indClean,
      amount: amount,
      city: cityClean,
      address: `${item.address}, ${cityClean}`,
      phone: phone,
      contact: contacts[idx % contacts.length],
      painPoint: painPoints[idx % painPoints.length],
      score: 9 - (idx % 3),
      guiacoresUrl: `https://www.google.com/search?q=site:guiacores.com.ar+${encodeURIComponent(item.name)}`
    };
  });

  return { prospects };
}

function getMockChatbotAnswer(payload: any): string {
  const { brochureData, message } = payload;
  const msgLower = (message || "").toLowerCase();
  
  if (msgLower.includes("precio") || msgLower.includes("cost") || msgLower.includes("cuanto") || msgLower.includes("val") || msgLower.includes("ars") || msgLower.includes("pesos")) {
    return `¡Hola! Mira, nuestros planes de implementación de Clientum CRM son súper accesibles para PyMEs locales y se adaptan a tu escala. Varían según los módulos (como el Bot de WhatsApp 24/7, la automatización AFIP o el CRM multiusuario). \n\nGeneralmente, las propuestas rondan entre los $120.000 y $480.000 ARS mensuales. ¿Te gustaría que agendemos una demo rápida de 15 minutos sin compromiso y te armo un presupuesto exacto?`;
  }
  
  if (msgLower.includes("whatsapp") || msgLower.includes("bot") || msgLower.includes("automatiz") || msgLower.includes("atend") || msgLower.includes("chat")) {
    return `¡Totalmente! El chatbot de WhatsApp de Clientum es un golazo. Atiende solo, las 24 horas del día. Cuando un cliente te escribe, el bot le responde al instante, lo califica y, si es necesario, te lo agenda en el CRM o te deriva la conversación.\n\nPara tu rubro, esto significa que nunca más vas a perder una venta o dejar un mensaje sin responder fuera del horario comercial. ¿Querés que agendemos una llamada cortita por Meet y te muestro cómo funciona el bot en vivo?`;
  }
  
  if (msgLower.includes("crm") || msgLower.includes("gestion") || msgLower.includes("vent") || msgLower.includes("pipeline") || msgLower.includes("seguim")) {
    return `¡Exacto! El CRM de Clientum está pensado para ser súper visual y ágil. Tenés un pipeline de ventas tipo drag-and-drop donde ves en qué etapa está cada cliente en tiempo real. \n\nAdemás, te automatiza las tareas de seguimiento para que tus vendedores no se olviden de llamar a nadie, y centraliza todo el historial de chats y correos del cliente en un solo lugar. Es ideal para ordenar tu negocio de una vez por todas. ¿Te interesa que coordinemos un Meet rápido para verlo?`;
  }
  
  if (msgLower.includes("contacto") || msgLower.includes("llam") || msgLower.includes("reun") || msgLower.includes("dem") || msgLower.includes("meet") || msgLower.includes("habl")) {
    return `¡Dale, buenísimo! Me encantaría que charlemos. Podés hacer clic en el botón de agendar demo que tenés en la barra superior o pasarme tu celular de WhatsApp y te escribo para coordinar. \n\nEn solo 15 minutos te muestro cómo automatizamos Clientum para potenciar tus ventas. ¿Qué día y horario te queda mejor esta semana?`;
  }
  
  return `¡Hola! Gracias por tu consulta. Clientum es la plataforma ideal para tu negocio porque integra un Chatbot de WhatsApp 24/7, un CRM súper visual y facturación electrónica en un solo lugar.\n\nEsto te permite automatizar la atención inicial, agendar turnos o pedidos en piloto automático y no perder nunca más un lead por responder tarde.\n\n¿Te gustaría que coordinemos un Meet rápido de 15 minutos esta semana para mostrarte el sistema funcionando en tiempo real? ¡Te va a encantar!`;
}

function getMockOptimizeCopy(text: string, goal: string): string {
  const t = text || "";
  if (goal === "agresivo" || goal === "vendedor") {
    return `🚀 ¡Multiplicá tus resultados! ${t} No pierdas más tiempo ni dejes que las ventas se te escapen de las manos. ¡Hacé clic acá y empezá hoy mismo! 🔥`;
  }
  if (goal === "profesional" || goal === "formal") {
    return `Optimice el rendimiento de su organización. ${t} Descubra cómo nuestra solución integral y automatizada le permite escalar sus ventas de forma eficiente y profesional.`;
  }
  if (goal === "conciso" || goal === "corto") {
    return `${t.slice(0, 150)}... ¡La solución ágil para potenciar tu negocio hoy!`;
  }
  return `✨ ${t} ¡Automatizá tu negocio con Clientum y vendé 24/7!`;
}

function getMockTranslateBrochure(texts: any, targetLanguage: string): any {
  const result: any = {};
  const isEng = (targetLanguage || "").toLowerCase().includes("ing") || (targetLanguage || "").toLowerCase().includes("en");
  const isPor = (targetLanguage || "").toLowerCase().includes("por") || (targetLanguage || "").toLowerCase().includes("pt");
  
  for (const key of Object.keys(texts)) {
    const val = texts[key];
    if (typeof val === "string") {
      if (isEng) {
        if (val.includes("Clientum")) result[key] = val;
        else if (val.includes("Tecnología")) result[key] = "Real technology for real SMEs.";
        else if (val.includes("atiente solo")) result[key] = "Your business runs on autopilot, 24/7.";
        else if (val.includes("pierdas una venta")) result[key] = "Never lose a sale again.";
        else result[key] = `${val} (EN)`;
      } else if (isPor) {
        if (val.includes("Clientum")) result[key] = val;
        else if (val.includes("Tecnología")) result[key] = "Tecnologia real para PMEs reais.";
        else if (val.includes("atiente solo")) result[key] = "Seu negocio atende sozinho, 24 horas.";
        else if (val.includes("pierdas una venta")) result[key] = "Nunca mais perca uma venda.";
        else result[key] = `${val} (PT)`;
      } else {
        result[key] = val;
      }
    } else {
      result[key] = val;
    }
  }
  return result;
}

function getMockICP(industry: string, acv: string): any {
  const ind = industry || "Tecnología y Servicios B2B";
  const contractValue = acv || "$180.000 ARS/mes";
  return {
    industry: ind,
    arrRange: "$50K - $250K USD",
    employeeCount: "20 - 150 empleados",
    stage: "Crecimiento / Escalando con tracción",
    growthRate: "20% - 50% YoY",
    decisionMakerRole: "Director de Operaciones / Gerente de Ventas / CEO",
    decisionMakerSeniority: "C-Level o Director de Área",
    painPoints: [
      "Pérdida de contactos por respuestas lentas o fuera de horario comercial en WhatsApp.",
      "Desorganización comercial y falta de seguimiento de presupuestos.",
      "Falta de automatización en facturación electrónica y conciliación de cuentas."
    ],
    budgetAuthority: "Aprobación de gastos directos hasta $500.000 ARS/mes sin directorio",
    avgContractValue: contractValue,
    salesCycle: "2 - 6 semanas",
    winRatePotential: "35% - 45%",
    ltvToCac: "4:1",
    regions: "Patagonia (Río Negro, Neuquén, Chubut) y resto de Argentina",
    timeZones: "GMT-3 (Argentina)",
    meddicMetrics: "Reducción del 80% en tiempo de respuesta inicial, aumento del 25% en conversión de leads.",
    meddicEconomicBuyer: "Dueño de la PyME, Director General o Gerente de Finanzas.",
    meddicDecisionCriteria: "Costo de implementación, soporte en español, facilidad de uso sin código, integración de WhatsApp.",
    meddicDecisionProcess: "Demo en vivo (15 min), propuesta comercial formal, validación técnica de WhatsApp, firma de contrato.",
    meddicIdentifyPain: "¿Cuánto tardan en responder fuera de hora? ¿Cuántas consultas de WhatsApp se pierden por mes?",
    meddicChampion: "Responsable de Ventas o Coordinador Administrativo harto de usar Excel desactualizado."
  };
}

function getMockResearch(company: string, industry: string): any {
  const comp = company || "Empresa Prospecto S.A.";
  const ind = industry || "Comercio";
  return {
    company: comp,
    industry: ind,
    revenue: "$80M - $150M ARS anuales",
    founded: "2014",
    employees: "15 - 35 empleados",
    funding: "Capital propio / Autofinanciado",
    recentNews: "Ampliación de catálogo de servicios en la zona de influencia de la Patagonia y digitalización de canales.",
    buyingSignals: [
      "Búsqueda activa de personal de atención comercial o soporte administrativo.",
      "Lanzamiento de canales de venta online o perfiles de redes con alta interacción de comentarios.",
      "Crecimiento en volumen de consultas pero estancamiento en el equipo físico de ventas."
    ],
    keyContacts: [
      { name: "Martín Gómez", title: "Socio Gerente", email: "m.gomez@prospecto.com.ar", linkedin: "linkedin.com/in/gomez-patagonia", influence: "Alta" },
      { name: "Clara Rossi", title: "Coordinadora Comercial", email: "c.rossi@prospecto.com.ar", linkedin: "linkedin.com/in/rossi-ventas", influence: "Media-Alta" }
    ],
    urgencyPainLevel: 5,
    urgencyTimeline: "Próximas 2 a 3 semanas",
    urgencyBudgetStatus: "Presupuesto aprobado para modernización comercial",
    personalizationHooks: [
      `Felicitar a Martín Gómez por la trayectoria local y sugerir automatizar las preguntas recurrentes del rubro ${ind}.`,
      `Ofrecer un bot calificador de WhatsApp para filtrar prospectos calificados antes de transferir a su equipo de ventas.`,
      `Destacar cómo la integración con CRM de Clientum elimina la necesidad de cargar datos manualmente desde planillas Excel.`
    ],
    fitScore: 9,
    fitReasoning: "Alta coincidencia con el ICP ideal: PyME patagónica con alta interacción en WhatsApp, con clara necesidad de automatizar procesos repetitivos y acelerar ventas."
  };
}

function getMockOutreach(company: string, contact: string, title: string, industry: string, painPoint: string): any {
  const cName = contact || "Estimado";
  const comp = company || "tu empresa";
  const ind = industry || "tu rubro";
  const pain = painPoint || "las respuestas lentas y el seguimiento de prospectos por WhatsApp";
  
  return {
    prospect: cName,
    company: comp,
    title: title || "Gerente General",
    goal: "Agendar reunión de demo de 15 minutos",
    email1Subject: `Consulta rápida para ${comp} - Automatización en WhatsApp`,
    email1Body: `Hola ${cName.split(' ')[0]},\n\nVi el crecimiento de ${comp} en la región y me llamó la atención cómo gestionan el gran flujo de consultas comerciales.\n\nDiseñamos un chatbot de WhatsApp específico para el rubro ${ind} que responde cotizaciones, stock y agenda reuniones las 24 horas, derivando al CRM de Clientum solo los leads pre-calificados. Esto les ahorra unas 12 horas semanales de atención manual.\n\n¿Te parece que tengamos una charla cortita de 15 minutos por Meet para mostrarte un ejemplo en vivo adaptado a tu negocio?\n\nUn saludo,\nEquipo de Clientum`,
    email2Subject: `Re: Consulta rápida para ${comp} - Un dato de conversión`,
    email2Body: `Hola ${cName.split(' ')[0]},\n\nTe escribo brevemente porque las PyMEs del sector ${ind} que implementaron el bot de WhatsApp y CRM de Clientum aumentaron sus ventas un 40% el primer mes, simplemente porque respondieron consultas en menos de 2 minutos.\n\nEvitamos demoras y centralizamos todo el historial del prospecto automáticamente.\n\n¿Te queda bien un Meet rápido este jueves a las 11:00 hs para ver cómo aplicarlo en ${comp}?\n\nAbrazo,\nEquipo de Clientum`,
    email3Subject: `Último intento / Solución ágil para ${comp}`,
    email3Body: `Hola ${cName.split(' ')[0]},\n\nSé que estás a mil gestionando el día a día en ${comp}, por lo que esta es mi última consulta para no interrumpir.\n\nSi el dolor principal hoy es que tu equipo comercial pierde tiempo respondiendo preguntas de soporte básico en vez de cerrar ventas, Clientum se instala en 5 días y se paga solo con 2 ventas ganadas.\n\nSi te interesa dar el salto tecnológico, avisame y coordinamos. Si no, ¡te deseo el mayor de los éxitos en este trimestre!\n\nSaludos atentos,\nEquipo de Clientum`,
    linkedinSequence: [
      "Paso 1: Solicitud de contacto con nota personalizada: 'Hola Martín, un gusto conectar. Me entusiasma ver cómo lideran en el rubro en la Patagonia. ¡Saludos!'",
      "Paso 2 (Día +2): Compartir un artículo de valor: 'Hola Martín, te comparto este breve análisis sobre el impacto de la atención instantánea por WhatsApp en el sector de logística rural. Espero que te sirva.'",
      "Paso 3 (Día +4): Enviar propuesta directa: 'Hola Martín, veo que en tu local reciben muchas consultas diarias. ¿Evaluaron automatizar las cotizaciones recurrentes por WhatsApp para aliviar a tu equipo? Saludos.'",
      "Paso 4 (Día +7): Mensaje final de seguimiento: 'Hola Martín, te dejé un correo para ver si te servía un Meet de 15 minutos sin compromiso para ver Clientum en vivo. ¿Te interesa que coordinemos?'"
    ],
    phoneScript: `\"Hola Martín, ¿cómo estás? Te habla Marcos de Clientum. Te llamo cortito porque vi el crecimiento que tienen en la zona y sé que están con mucha demanda. Te quería preguntar brevemente: ¿hoy tu equipo está dando abasto con las consultas que les entran por WhatsApp o sienten que a veces se les pasan oportunidades de venta por demoras en responder? ... Excelente, justamente desarrollamos un sistema de bot y CRM que soluciona esto en 5 días. ¿Te queda bien que coordinemos un Meet rápido de 15 minutos el miércoles a las 10:00 hs para que veas el sistema adaptado a tu marca?\"`
  };
}

// Helper function to query real-time businesses using Google Places API (New)
async function fetchGooglePlacesAPI(city: string, industry: string, apiKey: string): Promise<any[]> {
  const query = `${industry} en ${city}`;
  console.log(`[Google Places API] Iniciando consulta para: "${query}"...`);

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.websiteUri,places.types"
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "es"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Places API falló (HTTP ${response.status}): ${errText}`);
    }

    const data = await response.json();
    const places = data.places || [];
    console.log(`[Google Places API Success] Encontrados ${places.length} resultados.`);

    const contactNames = [
      "Luciana Silva", "Carlos Benítez", "Mariano Gómez", "Sofia Rodriguez", 
      "Gustavo B.", "Andrés Martínez", "Gabriela López", "Facundo Peralta",
      "Estela Castro", "Martin Diaz"
    ];

    return places.slice(0, 20).map((place: any, index: number) => {
      const companyName = place.displayName?.text || `Comercio en ${city}`;
      const rating = place.rating || null;
      const phone = place.nationalPhoneNumber || "Sin teléfono";
      const address = place.formattedAddress || `Dirección en ${city}`;
      const website = place.websiteUri || "";
      const types = place.types || [];

      let painPoint = "Excelente presencia de marca en Google pero carece de un canal automático de cotizaciones y CRM para agendar reuniones de ventas 24/7.";
      let score = 7;

      if (!website) {
        painPoint = "No cuenta con página web institucional ni catálogo digital, lo que reduce su presencia digital en la Patagonia.";
        score = 9;
      } else if (rating && rating < 4.2) {
        painPoint = `Calificación de ${rating} estrellas en Google Maps por demoras en atención. Necesita un asistente de WhatsApp de Clientum para agilizar respuestas.`;
        score = 8;
      } else if (phone === "Sin teléfono") {
        painPoint = "No expone teléfono directo en Maps. Necesita integrar landing page de captación de Clientum con bot de WhatsApp.";
        score = 8;
      } else if (types.includes("restaurant") || types.includes("food") || types.includes("bar")) {
        painPoint = "Dificultad para centralizar reservas de mesas y pedidos para llevar desde WhatsApp.";
        score = 8;
      } else if (types.includes("store") || types.includes("clothing_store") || types.includes("shopping_mall")) {
        painPoint = "Pérdida de clientes potenciales los fines de semana por falta de chatbot automatizado en Instagram y WhatsApp.";
        score = 8;
      }

      const baseAmount = !website ? 220000 : 180000;
      const amount = baseAmount + (index * 15000);
      const guiacoresUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName + " " + city)}`;

      return {
        company: companyName,
        industry: industry,
        amount: amount,
        city: city,
        address: address,
        phone: phone,
        contact: contactNames[index % contactNames.length],
        painPoint: painPoint,
        score: score,
        guiacoresUrl: guiacoresUrl,
        rating: rating,
        website: website
      };
    });
  } catch (error: any) {
    console.error("[Google Places API Error] Error en fetchGooglePlacesAPI:", error);
    throw error;
  }
}

// Helper function to connect to Apify Google Places crawler
async function fetchApifyGooglePlaces(city: string, industry: string): Promise<any[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token || token === "MY_APIFY_API_TOKEN" || token.trim() === "") {
    throw new Error("La clave APIFY_API_TOKEN no está configurada en las variables de entorno.");
  }

  const query = `${industry} en ${city}`;
  console.log(`[Apify Scraper] Conectando a Apify para buscar: "${query}"...`);

  let items: any[] = [];
  let success = false;
  let lastErr: any = null;

  // Intentar con compass~crawler-google-places (anterior por defecto)
  try {
    console.log(`[Apify Scraper] Intentando con compass~crawler-google-places...`);
    const url = `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${token}`;
    const body = {
      queries: [query],
      searchStrings: [query],
      maxPlacesPerQuery: 20,
      maxResults: 20,
      limit: 20,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const resData = await response.json();
      if (Array.isArray(resData)) {
        items = resData;
        success = true;
        console.log(`[Apify Scraper] Éxito con compass~crawler-google-places. Encontrados: ${items.length} items.`);
      }
    } else {
      const errText = await response.text();
      throw new Error(`compass~crawler-google-places falló (HTTP ${response.status}): ${errText}`);
    }
  } catch (err: any) {
    lastErr = err;
    console.warn(`[Apify Scraper Warning] Falló primer intento con compass~crawler-google-places:`, err.message || err);
  }

  // Intentar con apify~google-maps-scraper como fallback
  if (!success) {
    try {
      console.log(`[Apify Scraper] Intentando con apify~google-maps-scraper como fallback...`);
      const url = `https://api.apify.com/v2/acts/apify~google-maps-scraper/run-sync-get-dataset-items?token=${token}`;
      const body = {
        searchStringsArray: [query],
        maxCrawledPlacesPerSearch: 20,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const resData = await response.json();
        if (Array.isArray(resData)) {
          items = resData;
          success = true;
          console.log(`[Apify Scraper] Éxito con apify~google-maps-scraper. Encontrados: ${items.length} items.`);
        }
      } else {
        const errText = await response.text();
        throw new Error(`apify~google-maps-scraper falló (HTTP ${response.status}): ${errText}`);
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`[Apify Scraper Warning] Falló segundo intento con apify~google-maps-scraper:`, err.message || err);
    }
  }

  // Intentar con compass~google-maps-scraper como tercer fallback
  if (!success) {
    try {
      console.log(`[Apify Scraper] Intentando con compass~google-maps-scraper como fallback...`);
      const url = `https://api.apify.com/v2/acts/compass~google-maps-scraper/run-sync-get-dataset-items?token=${token}`;
      const body = {
        queries: [query],
        searchStrings: [query],
        maxPlacesPerQuery: 20,
        maxResults: 20,
        limit: 20,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const resData = await response.json();
        if (Array.isArray(resData)) {
          items = resData;
          success = true;
          console.log(`[Apify Scraper] Éxito con compass~google-maps-scraper. Encontrados: ${items.length} items.`);
        }
      } else {
        const errText = await response.text();
        throw new Error(`compass~google-maps-scraper falló (HTTP ${response.status}): ${errText}`);
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`[Apify Scraper Warning] Falló tercer intento con compass~google-maps-scraper:`, err.message || err);
    }
  }

  if (!success) {
    throw lastErr || new Error("No se pudo completar el scraping con ningún actor de Apify.");
  }

  return items.map((item: any, index: number) => {
    const companyName = item.title || item.name || item.companyName || `Comercio en ${city}`;
    const rating = item.stars || item.rating || item.totalScore || null;
    const phone = item.phone || item.phoneNumber || item.phoneNormalized || "Sin teléfono";
    const address = item.address || item.formattedAddress || item.streetAddress || `Dirección en ${city}`;
    const website = item.website || item.websiteUrl || "";
    
    let painPoint = "Falta de automatización en la respuesta de consultas comerciales.";
    let score = 7;

    if (!website) {
      painPoint = "No cuenta con página web institucional ni catálogo digital, lo que reduce su presencia digital en la Patagonia.";
      score = 9;
    } else if (rating && rating < 4.2) {
      painPoint = `Calificación de ${rating} estrellas en Google Maps por demoras en atención. Necesita un asistente de WhatsApp de Clientum para agilizar respuestas.`;
      score = 8;
    } else if (phone === "Sin teléfono") {
      painPoint = "No expone teléfono directo en Maps. Necesita integrar landing page de captación de Clientum con bot de WhatsApp.";
      score = 8;
    } else {
      painPoint = "Excelente presencia de marca en Google pero carece de un canal automático de cotizaciones y CRM para agendar reuniones de ventas 24/7.";
      score = 6;
    }

    const baseAmount = !website ? 220000 : 180000;
    const amount = baseAmount + (index * 15000);
    const guiacoresUrl = item.url || item.googleMapsUrl || `https://www.google.com/search?q=${encodeURIComponent(companyName + " " + city)}`;

    return {
      company: companyName,
      industry: industry,
      amount: amount,
      city: city,
      address: address,
      phone: phone,
      // contact is null until enriched via Hunter.io
      contact: null,
      contactVerified: false,
      contactEmail: null,
      contactPosition: null,
      painPoint: painPoint,
      score: score,
      guiacoresUrl: guiacoresUrl,
      rating: rating,
      website: website
    };
  });
}

// ── Hunter.io contact enrichment ─────────────────────────────────────────────

async function enrichWithHunter(domain: string): Promise<{
  contacts: Array<{ name: string; email: string; position: string; confidence: number; linkedin?: string | null }>;
  organization?: string | null;
} | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return null;

  // Normalise domain: strip protocol + www + path
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split("?")[0]
    .toLowerCase()
    .trim();

  if (!cleanDomain || cleanDomain.length < 3) return null;

  try {
    const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(cleanDomain)}&limit=5&api_key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.warn(`[Hunter] HTTP ${res.status} for domain ${cleanDomain}`);
      return null;
    }
    const json: any = await res.json();
    if (!json?.data) return null;

    const contacts = (json.data.emails ?? [])
      .filter((e: any) => e.first_name || e.last_name)
      .map((e: any) => ({
        name:       [e.first_name, e.last_name].filter(Boolean).join(" "),
        email:      e.value ?? "",
        position:   e.position ?? "Contacto",
        confidence: e.confidence ?? 0,
        linkedin:   e.linkedin ?? null,
      }));

    return {
      contacts,
      organization: json.data.organization ?? null,
    };
  } catch (err: any) {
    console.warn(`[Hunter] Error for domain ${cleanDomain}:`, err.message);
    return null;
  }
}

// POST /api/enrich-contact
// Body: { domain: string }
// Returns: { contacts, organization, source } or { contacts: [], source: "none" }
app.post("/api/enrich-contact", requireAuth, async (req, res) => {
  const { domain } = req.body ?? {};
  if (!domain || typeof domain !== "string") {
    return res.status(400).json({ error: "domain requerido" });
  }

  const result = await enrichWithHunter(domain);

  if (!result || result.contacts.length === 0) {
    return res.json({ contacts: [], organization: null, source: "none" });
  }

  return res.json({
    contacts:     result.contacts,
    organization: result.organization,
    source:       "hunter",
  });
});

app.post("/api/scrape-places", requireAuth, async (req, res) => {
  try {
    const { city, industry } = req.body;
    if (!city || !industry) {
      return res.status(400).json({ error: "Faltan parámetros requeridos: city e industry." });
    }
    const prospects = await fetchApifyGooglePlaces(city, industry);
    return res.json({ prospects, isRealScraped: true });
  } catch (error: any) {
    console.error("[Apify Route Error]:", error);
    return res.status(500).json({ error: error.message || "Error al realizar scraping de Google Maps mediante Apify." });
  }
});

// Only the public chatbot demo is reachable without a session; every other
// action here belongs to the CRM/dashboard and requires an authenticated user.
const PUBLIC_GENERATE_ACTIONS = new Set(["chatbotAnswer"]);

// Brochure & Contenido actions (SidebarEditor) are admin-only.
const ADMIN_ONLY_GENERATE_ACTIONS = new Set([
  "generateIndustryCopy",
  "optimizeCopy",
  "generateImage",
  "translateBrochure",
]);

app.post("/api/generate", async (req, res, next) => {
  const action = req.body?.action;
  if (ADMIN_ONLY_GENERATE_ACTIONS.has(action)) {
    return requireAdmin(req, res, next);
  }
  if (!PUBLIC_GENERATE_ACTIONS.has(action)) {
    return requireAuth(req, res, next);
  }
  next();
}, async (req, res) => {
  try {
    const { action, payload } = req.body;
    const ai = getAI();
    
    if (action === "validateGooglePlacesKey") {
      const { apiKey } = payload;
      if (!apiKey || apiKey.trim() === "") {
        return res.json({ success: false, error: "La clave provista está vacía." });
      }
      try {
        console.log(`[Google Places Validation] Validando clave provista...`);
        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id"
          },
          body: JSON.stringify({
            textQuery: "Hotel Bariloche",
            maxResultCount: 1
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[Google Places Validation Error] HTTP ${response.status}:`, errText);
          let userError = "La clave no es válida o no tiene habilitada la API de Places (New).";
          try {
            const errJson = JSON.parse(errText);
            if (errJson.error?.message) {
              userError = `Error de Google: ${errJson.error.message}`;
            }
          } catch(e) {}
          return res.json({ success: false, error: userError });
        }

        const data = await response.json();
        console.log(`[Google Places Validation Success] Clave validada correctamente.`);
        return res.json({ success: true, count: (data.places || []).length });
      } catch (err: any) {
        console.error(`[Google Places Validation Exception]`, err);
        return res.json({ success: false, error: err.message || "Error al conectar con la API de Google Places." });
      }
    }

    if (action === "generateIndustryCopy") {
      const { industry } = payload;
      const prompt = `Actúa como un experto redactor publicitario y estratega de negocios para PyMEs argentinas.
Genera contenido personalizado para el brochure de "Clientum 2026" adaptado ESPECÍFICAMENTE al rubro: "${industry}".
El tono debe ser muy profesional, persuasivo, cercano (usando el voseo argentino / español rioplatense de forma natural, sin exagerar) y enfocado en la rentabilidad de las PyMEs locales.

Debes devolver un objeto JSON con la siguiente estructura de datos (todo adaptado al rubro ${industry}):
{
  "cover": {
    "slogan": "Slogan corto e impactante (máx 60 caract) con un 'span' opcional o marcado en su lugar",
    "sub": "Párrafo corto de introducción (máx 150 caract) explicando el chatbot WhatsApp, CRM y facturación para este rubro específico"
  },
  "chatbot": {
    "title": "Título llamativo para el bot de WhatsApp en este rubro",
    "features": [
      { "title": "Característica 1", "desc": "Descripción adaptada al rubro" },
      { "title": "Característica 2", "desc": "Descripción adaptada al rubro" },
      { "title": "Característica 3", "desc": "Descripción adaptada al rubro" }
    ],
    "flowSteps": [
      "Paso 1 del chatbot adaptado",
      "Paso 2 del chatbot adaptado",
      "Paso 3 del chatbot adaptado",
      "Paso 4 del chatbot adaptado"
    ]
  },
  "crm": {
    "title": "Título llamativo para el CRM",
    "features": [
      { "title": "Beneficio 1 para el rubro", "desc": "Breve explicación" },
      { "title": "Beneficio 2 para el rubro", "desc": "Breve explicación" },
      { "title": "Beneficio 3 para el rubro", "desc": "Breve explicación" }
    ]
  },
  "services": [
    { "title": "Servicio 1", "desc": "Detalle del servicio ideal para este rubro", "bullets": ["Punto 1", "Punto 2"] },
    { "title": "Servicio 2", "desc": "Detalle del servicio ideal para este rubro", "bullets": ["Punto 1", "Punto 2"] },
    { "title": "Servicio 3", "desc": "Detalle del servicio ideal para este rubro", "bullets": ["Punto 1", "Punto 2"] }
  ],
  "testimonial": {
    "text": "Un testimonio ficticio pero realista de un cliente del rubro de alguna ciudad de Argentina (ej. Mendoza, Córdoba, Rosario) que use Clientum.",
    "author": "Nombre del Autor (ej. Sofía G.)",
    "company": "Nombre de empresa ficticia del rubro (ej. Viñedos Mendoza S.A.)"
  },
  "outreachEmail": "Asunto: Breve correo de prospección comercial/outreach personalizado para este rubro, utilizando voseo argentino de manera persuasiva y proponiendo 15 minutos de charla, haciendo referencia a los puntos del brochure de Clientum (como el bot de WhatsApp 24/7 y CRM de Clientum) que resuelven los dolores de este rubro."
}

IMPORTANTE: Devuelve exclusivamente el objeto JSON sin markdown.`;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                cover: {
                  type: Type.OBJECT,
                  properties: {
                    slogan: { type: Type.STRING },
                    sub: { type: Type.STRING }
                  },
                  required: ["slogan", "sub"]
                },
                chatbot: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    features: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          desc: { type: Type.STRING }
                        },
                        required: ["title", "desc"]
                      }
                    },
                    flowSteps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["title", "features", "flowSteps"]
                },
                crm: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    features: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          desc: { type: Type.STRING }
                        },
                        required: ["title", "desc"]
                      }
                    }
                  },
                  required: ["title", "features"]
                },
                services: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      desc: { type: Type.STRING },
                      bullets: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["title", "desc", "bullets"]
                  }
                },
                testimonial: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    author: { type: Type.STRING },
                    company: { type: Type.STRING }
                  },
                  required: ["text", "author", "company"]
                },
                outreachEmail: { type: Type.STRING }
              },
              required: ["cover", "chatbot", "crm", "services", "testimonial", "outreachEmail"]
            }
          }
        });

        return res.json({ result: JSON.parse(response.text || "{}") });
      } catch (geminiError: any) {
        console.warn("[Gemini Fallback] Quota exhaustion / error generating copy. Using mock template for industry:", industry);
        const fallbackData = getMockIndustryCopy(industry);
        return res.json({ result: fallbackData, isFallback: true });
      }
    }

    if (action === "chatbotAnswer") {
      const { brochureData, message, history } = payload;
      const prompt = `Actúas como un asesor comercial y consultor de automatización de Clientum 2026. Tu objetivo es vender los servicios de Clientum y responder dudas sobre el brochure corporativo personalizado de Clientum para el rubro del prospecto.
El brochure activo actual contiene esta información:
- Lema/Cover: "${brochureData?.cover?.slogan}" - "${brochureData?.cover?.sub}"
- Chatbot de WhatsApp: "${brochureData?.chatbot?.title}"
- CRM de Clientum: "${brochureData?.crm?.title}"
- Testimonio: "${brochureData?.testimonial?.text}" de ${brochureData?.testimonial?.author} (${brochureData?.testimonial?.company})
- Servicios Principales: ${JSON.stringify(brochureData?.services)}

Responde de manera concisa (máximo 3 párrafos cortos), convincente, y usa voseo argentino (español rioplatense) con un tono comercial persuasivo, amigable, tecnológico y sumamente enfocado en cómo la automatización de Clientum resuelve la respuesta lenta, potencia las ventas y profesionaliza el negocio.
Pregunta del usuario: "${message}"

Historial de conversación previa para contexto: ${JSON.stringify(history || [])}

Responde de forma directa, vendedora y simpática.`;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt
        });

        return res.json({ result: response.text?.trim() });
      } catch (geminiError: any) {
        console.warn("[Gemini Fallback] Quota exhaustion / error generating chatbot answer. Using smart local assistant.");
        const fallbackAnswer = getMockChatbotAnswer(payload);
        return res.json({ result: fallbackAnswer, isFallback: true });
      }
    }

    if (action === "optimizeCopy") {
      const { text, goal } = payload;
      const prompt = `Optimiza el siguiente texto de un brochure corporativo para que sea más ${goal || "persuasivo y profesional"}.
Mantén el español rioplatense si aplica, hazlo conciso, impactante y directo. Devuelve únicamente el texto optimizado, sin introducciones ni comillas externas.

Texto a optimizar:
"${text}"`;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt
        });

        return res.json({ result: response.text?.trim() });
      } catch (geminiError: any) {
        console.warn("[Gemini Fallback] Quota exhaustion / error in optimizeCopy. Running local enhancer.");
        const fallbackAnswer = getMockOptimizeCopy(text, goal);
        return res.json({ result: fallbackAnswer, isFallback: true });
      }
    }

    if (action === "translateBrochure") {
      const { texts, targetLanguage } = payload;
      const prompt = `Traduce las siguientes frases o párrafos de un brochure corporativo al idioma: "${targetLanguage}".
Mantén la terminología comercial profesional de manera impecable. Devuelve un objeto JSON con las traducciones mapeadas uno a uno con el mismo orden o claves.

Textos a traducir en formato JSON:
${JSON.stringify(texts, null, 2)}

Devuelve únicamente el objeto JSON con las traducciones mapeadas con las mismas llaves.`;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        return res.json({ result: JSON.parse(response.text || "{}") });
      } catch (geminiError: any) {
        console.warn("[Gemini Fallback] Quota exhaustion / error in translateBrochure. Running local translator.");
        const fallbackAnswer = getMockTranslateBrochure(texts, targetLanguage);
        return res.json({ result: fallbackAnswer, isFallback: true });
      }
    }

    if (action === "prospectLeads") {
      const { city, industry, googleMapsPlatformKey } = payload;
      
      const gmpKey = googleMapsPlatformKey || process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY;
      if (gmpKey && gmpKey !== "YOUR_API_KEY" && gmpKey.trim() !== "") {
        try {
          const prospects = await fetchGooglePlacesAPI(city, industry, gmpKey);
          console.log(`[Google Places API Success] Se recuperaron con éxito ${prospects.length} prospectos reales.`);
          return res.json({ result: { prospects }, isRealScraped: true, isGooglePlaces: true });
        } catch (gmpErr: any) {
          console.warn("[Google Places API Warning] Falló búsqueda directa con Google Places, intentando fallbacks:", gmpErr.message || gmpErr);
        }
      }
      
      const apifyToken = process.env.APIFY_API_TOKEN;
      if (apifyToken && apifyToken !== "MY_APIFY_API_TOKEN" && apifyToken.trim() !== "") {
        try {
          const prospects = await fetchApifyGooglePlaces(city, industry);
          console.log(`[Apify Success] Se recuperaron con éxito ${prospects.length} prospectos reales de Google Maps.`);
          return res.json({ result: { prospects }, isRealScraped: true });
        } catch (apifyErr: any) {
          console.warn("[Apify Interceptor] Falló scraping con Apify, procediendo con Gemini Search Grounding:", apifyErr.message || apifyErr);
        }
      }

      const prompt = `Actúa como un agente experto de ventas y prospección de datos reales (sales intelligence / research) de la patagonia argentina.
Usa tu herramienta de Google Search para buscar negocios, comercios, locales o empresas REALES que estén registradas o figuren en la prestigiosa guía de comercios de la Patagonia "Guía Cores" (https://www.guiacores.com.ar/) o que estén activas físicamente en la ciudad de "${city}" (provincia de Río Negro o Neuquén) para el rubro "${industry}".
Investiga, prioriza y encuentra 20 empresas u organizaciones locales verdaderas que aparezcan en Guía Cores o existan en "${city}" correspondientes con el rubro.

Para cada negocio real encontrado:
1. Obtén el nombre exacto de la empresa o local comercial ("company").
2. Obtén su dirección real aproximada en la ciudad ("address").
3. Obtén su teléfono real o formato local de contacto real ("phone").
4. Deduce o asocia un dolor digital realista ("painPoint"), por ejemplo: procesos analógicos de reserva, falta de automatización, nula presencia web o problemas respondiendo consultas rápido en WhatsApp.
5. Estima un monto mensual razonable de contrato en pesos ARS para la implementación del CRM ("amount") entre 120000 y 480000.
6. Proporciona o construye el enlace URL real o de búsqueda en Guía Cores para este comercio ("guiacoresUrl"). Si no se encuentra el enlace exacto, genera una URL de búsqueda en Google restringida al sitio como "https://www.google.com/search?q=site:guiacores.com.ar+" seguido del nombre del negocio codificado.

Debes devolver un objeto JSON con la siguiente estructura de datos:
{
  "prospects": [
    {
      "company": "Nombre del negocio REAL (ej. Ferretería El Candado, Sanatorio Río Negro, etc.)",
      "industry": "${industry}",
      "amount": 180000, 
      "city": "${city}",
      "address": "Calle y número real de la ciudad de ${city}",
      "phone": "Teléfono real o prefijo local (ej. +54 298 4423456 o +54 299 4782345)",
      "contact": "Dueño/Gerente/Contacto estimado o real (ej. Sr. Martinez, Luciana S.)",
      "painPoint": "Dolor específico e inteligente adaptado al negocio real encontrado.",
      "score": 8,
      "guiacoresUrl": "https://www.google.com/search?q=site:guiacores.com.ar+Nombre+Del+Negocio"
    }
  ]
}

IMPORTANTE: Devuelve exclusivamente el objeto JSON sin markdown.`;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }],
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                prospects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      company: { type: Type.STRING },
                      industry: { type: Type.STRING },
                      amount: { type: Type.INTEGER },
                      city: { type: Type.STRING },
                      address: { type: Type.STRING },
                      phone: { type: Type.STRING },
                      contact: { type: Type.STRING },
                      painPoint: { type: Type.STRING },
                      score: { type: Type.INTEGER },
                      guiacoresUrl: { type: Type.STRING }
                    },
                    required: [
                      "company",
                      "industry",
                      "amount",
                      "city",
                      "address",
                      "phone",
                      "contact",
                      "painPoint",
                      "score",
                      "guiacoresUrl"
                    ]
                  }
                }
              },
              required: ["prospects"]
            }
          }
        });

        return res.json({ result: JSON.parse(response.text || "{}") });
      } catch (geminiError: any) {
        console.warn("[Gemini Fallback] Quota exhaustion / error in prospectLeads. Generating highly realistic Patagonia prospects.");
        const fallbackAnswer = getMockProspects(city, industry);
        return res.json({ result: fallbackAnswer, isFallback: true });
      }
    }

    if (action === "buildICP") {
      const { industry, acv } = payload;
      const prompt = `Actúa como un estratega comercial sénior especialista en B2B. Genera un Perfil de Cliente Ideal (ICP) exhaustivo y optimizado para el rubro '${industry}' con un valor promedio de contrato de '${acv || "$180.000 ARS/mes"}'. El formato de respuesta debe ser un JSON plano que siga exactamente esta estructura:
      {
        "industry": "Rubro o segmento de mercado",
        "arrRange": "Rango de ARR estimado",
        "employeeCount": "Tamaño de la empresa en empleados",
        "stage": "Etapa empresarial idónea",
        "growthRate": "Tasa de crecimiento YoY",
        "decisionMakerRole": "Puesto del tomador de decisión clave",
        "decisionMakerSeniority": "Seniority requerida",
        "painPoints": ["Dolor 1", "Dolor 2", "Dolor 3"],
        "budgetAuthority": "Nivel de autoridad de presupuesto",
        "avgContractValue": "Valor de contrato estimado",
        "salesCycle": "Duración del ciclo de ventas",
        "winRatePotential": "Tasa de conversión potencial",
        "ltvToCac": "Relación LTV:CAC esperada",
        "regions": "Regiones geográficas foco",
        "timeZones": "Zonas horarias de operación",
        "meddicMetrics": "Métricas de valor comercial cuantificables",
        "meddicEconomicBuyer": "Comprador económico clave",
        "meddicDecisionCriteria": "Criterios de selección",
        "meddicDecisionProcess": "Proceso de toma de decisiones del cliente",
        "meddicIdentifyPain": "Dolor principal detectado y preguntas de descubrimiento",
        "meddicChampion": "Quién actúa como campeón interno"
      }
      Usa voseo argentino / español rioplatense sutil en los dolores y descripciones. IMPORTANTE: Devuelve exclusivamente el objeto JSON sin markdown.`;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                industry: { type: Type.STRING },
                arrRange: { type: Type.STRING },
                employeeCount: { type: Type.STRING },
                stage: { type: Type.STRING },
                growthRate: { type: Type.STRING },
                decisionMakerRole: { type: Type.STRING },
                decisionMakerSeniority: { type: Type.STRING },
                painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                budgetAuthority: { type: Type.STRING },
                avgContractValue: { type: Type.STRING },
                salesCycle: { type: Type.STRING },
                winRatePotential: { type: Type.STRING },
                ltvToCac: { type: Type.STRING },
                regions: { type: Type.STRING },
                timeZones: { type: Type.STRING },
                meddicMetrics: { type: Type.STRING },
                meddicEconomicBuyer: { type: Type.STRING },
                meddicDecisionCriteria: { type: Type.STRING },
                meddicDecisionProcess: { type: Type.STRING },
                meddicIdentifyPain: { type: Type.STRING },
                meddicChampion: { type: Type.STRING }
              },
              required: [
                "industry", "arrRange", "employeeCount", "stage", "growthRate",
                "decisionMakerRole", "decisionMakerSeniority", "painPoints",
                "budgetAuthority", "avgContractValue", "salesCycle", "winRatePotential",
                "ltvToCac", "regions", "timeZones", "meddicMetrics", "meddicEconomicBuyer",
                "meddicDecisionCriteria", "meddicDecisionProcess", "meddicIdentifyPain", "meddicChampion"
              ]
            }
          }
        });

        return res.json({ result: JSON.parse(response.text || "{}") });
      } catch (geminiError: any) {
        console.warn("[Gemini Fallback] Quota exhaustion / error in buildICP. Generating local mock ICP.");
        const fallbackAnswer = getMockICP(industry, acv);
        return res.json({ result: fallbackAnswer, isFallback: true });
      }
    }

    if (action === "researchProspect") {
      const { company, industry, city } = payload;
      const prompt = `Actúa como un especialista en investigación de prospectos y ventas B2B en la Patagonia. Investiga a fondo a la empresa '${company}' que opera en el rubro '${industry}' y en la ciudad '${city || "General Roca"}'. Genera un informe detallado con firmográficos, señales de compra detectadas, contactos clave con influencia de decisión, urgencia y hooks de personalización. Devuelve exclusivamente un objeto JSON que siga esta estructura:
      {
        "company": "Nombre exacto de la empresa",
        "industry": "Rubro principal",
        "revenue": "Rango de facturación estimado",
        "founded": "Año de fundación",
        "employees": "Rango de empleados",
        "funding": "Origen de fondos",
        "recentNews": "Novedades o expansión reciente de la firma",
        "buyingSignals": ["Señal 1", "Señal 2", "Señal 3"],
        "keyContacts": [
          { "name": "Nombre contacto", "title": "Cargo", "email": "correo@empresa.com", "linkedin": "linkedin.com/in/perfil", "influence": "Alta/Media/Baja" }
        ],
        "urgencyPainLevel": 5,
        "urgencyTimeline": "Plazo estimado de compra",
        "urgencyBudgetStatus": "Estado de aprobación de presupuesto",
        "personalizationHooks": ["Gancho de venta 1", "Gancho de venta 2", "Gancho de venta 3"],
        "fitScore": 9,
        "fitReasoning": "Razonamiento detallado del puntaje de encaje comercial"
      }
      IMPORTANTE: Devuelve exclusivamente el objeto JSON sin markdown.`;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                industry: { type: Type.STRING },
                revenue: { type: Type.STRING },
                founded: { type: Type.STRING },
                employees: { type: Type.STRING },
                funding: { type: Type.STRING },
                recentNews: { type: Type.STRING },
                buyingSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyContacts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      title: { type: Type.STRING },
                      email: { type: Type.STRING },
                      linkedin: { type: Type.STRING },
                      influence: { type: Type.STRING }
                    },
                    required: ["name", "title", "email", "linkedin", "influence"]
                  }
                },
                urgencyPainLevel: { type: Type.INTEGER },
                urgencyTimeline: { type: Type.STRING },
                urgencyBudgetStatus: { type: Type.STRING },
                personalizationHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                fitScore: { type: Type.INTEGER },
                fitReasoning: { type: Type.STRING }
              },
              required: [
                "company", "industry", "revenue", "founded", "employees", "funding",
                "recentNews", "buyingSignals", "keyContacts", "urgencyPainLevel",
                "urgencyTimeline", "urgencyBudgetStatus", "personalizationHooks", "fitScore", "fitReasoning"
              ]
            }
          }
        });

        return res.json({ result: JSON.parse(response.text || "{}") });
      } catch (geminiError: any) {
        console.warn("[Gemini Fallback] Quota exhaustion / error in researchProspect. Generating local mock research report.");
        const fallbackAnswer = getMockResearch(company, industry);
        return res.json({ result: fallbackAnswer, isFallback: true });
      }
    }

    if (action === "generateOutreach") {
      const { company, contact, title, industry, painPoint } = payload;
      const prompt = `Actúa como un redactor comercial estrella (sales copywriter) experto en prospección multicanal B2B para PyMEs argentinas. Genera una campaña de outreach altamente persuasiva para el prospecto '${contact}' (${title || "Gerente"}) de la empresa '${company}' del rubro '${industry}', quien padece el dolor: '${painPoint}'. Genera 3 correos electrónicos con voseo argentino natural, una secuencia de 4 pasos de LinkedIn y un guion telefónico/SMS de 10 segundos. Devuelve exclusivamente un objeto JSON con la estructura:
      {
        "prospect": "Nombre del prospecto",
        "company": "Empresa",
        "title": "Cargo",
        "goal": "Objetivo de la campaña",
        "email1Subject": "Asunto de correo 1",
        "email1Body": "Cuerpo del correo 1",
        "email2Subject": "Asunto de correo 2",
        "email2Body": "Cuerpo del correo 2",
        "email3Subject": "Asunto de correo 3",
        "email3Body": "Cuerpo del correo 3",
        "linkedinSequence": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"],
        "phoneScript": "Guion telefónico o SMS de contacto inicial"
      }
      IMPORTANTE: Devuelve exclusivamente el objeto JSON sin markdown.`;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                prospect: { type: Type.STRING },
                company: { type: Type.STRING },
                title: { type: Type.STRING },
                goal: { type: Type.STRING },
                email1Subject: { type: Type.STRING },
                email1Body: { type: Type.STRING },
                email2Subject: { type: Type.STRING },
                email2Body: { type: Type.STRING },
                email3Subject: { type: Type.STRING },
                email3Body: { type: Type.STRING },
                linkedinSequence: { type: Type.ARRAY, items: { type: Type.STRING } },
                phoneScript: { type: Type.STRING }
              },
              required: [
                "prospect", "company", "title", "goal",
                "email1Subject", "email1Body",
                "email2Subject", "email2Body",
                "email3Subject", "email3Body",
                "linkedinSequence", "phoneScript"
              ]
            }
          }
        });

        return res.json({ result: JSON.parse(response.text || "{}") });
      } catch (geminiError: any) {
        console.warn("[Gemini Fallback] Quota exhaustion / error in generateOutreach. Generating local mock outreach sequence.");
        const fallbackAnswer = getMockOutreach(company, contact, title, industry, painPoint);
        return res.json({ result: fallbackAnswer, isFallback: true });
      }
    }

    if (action === "salesAdvisorAnswer") {
      const { industry, brochureData, message, history } = payload;
      const prompt = `Actúas como el Asesor de Ventas, Estrategia Comercial y Conversión oficial de Clientum. Tu misión es asesorar y guiar al usuario para mejorar el contenido, la estructura y la efectividad persuasiva de su brochure comercial actual, con el objetivo de optimizar la conversión de prospectos a clientes.

Rubro del brochure activo: "${industry || "General / Pymes"}"
Contenido del brochure actual:
- Lema de Portada: "${brochureData?.cover?.slogan || ""}"
- Subtítulo: "${brochureData?.cover?.sub || ""}"
- Chatbot de WhatsApp: "${brochureData?.chatbot?.title || ""}"
- CRM de Clientum: "${brochureData?.crm?.title || ""}"
- Testimonio: "${brochureData?.testimonial?.text || ""}" de ${brochureData?.testimonial?.author || ""} (${brochureData?.testimonial?.company || ""})
- Servicios Principales: ${JSON.stringify(brochureData?.services?.map((s: any) => s.title) || [])}

Pregunta del usuario sobre conversión, qué secciones incluir, sugerencias de copia o mejoras: "${message}"

Historial de conversación previa: ${JSON.stringify(history || [])}

Proporciona consejos estratégicos, creativos y prácticos. Usa el voseo argentino (español rioplatense) con un tono comercial persuasivo, amigable y empático. Da respuestas que incluyan tips prácticos de conversión (ej. llamados a la acción urgentes, colocación de testimonios estratégicos, cómo organizar mejor los servicios en el brochure). Limita tu respuesta a un máximo de 3 párrafos cortos o listas estructuradas fáciles de escanear.`;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt
        });

        return res.json({ result: response.text?.trim() });
      } catch (geminiError: any) {
        console.warn("[Gemini Fallback] Quota exhaustion or error in salesAdvisorAnswer. Running local advisory fallback.");
        const fallbackAdvice = `¡Hola! Como tu consultor de ventas en Clientum para el rubro de "${industry || "tu negocio"}", te recomiendo asegurarte de que cada página tenga un solo objetivo de conversión. Por ejemplo, en la sección de chatbot destaca que 'responde consultas automáticas en 10 segundos'. ¡Eso acelera un 70% el interés inicial!`;
        return res.json({ result: fallbackAdvice, isFallback: true });
      }
    }

    if (action === "generateImage") {
      const { industry, pageNumber, customPrompt } = payload;
      
      const INDUSTRY_IMAGES_DICTIONARY: Record<string, Record<number, string>> = {
        agro: {
          1: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
          2: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
          4: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
          6: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
        },
        inmobiliaria: {
          1: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
          2: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
          4: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
          6: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
        },
        distribuidora: {
          1: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
          2: "https://images.unsplash.com/photo-1553413719-87e8e3908c13?auto=format&fit=crop&w=800&q=80",
          4: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
          6: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80"
        },
        gastronomia: {
          1: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
          2: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
          4: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
          6: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80"
        },
        salud: {
          1: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
          2: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
          4: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
          6: "https://images.unsplash.com/photo-1504813184591-01552ff317ff?auto=format&fit=crop&w=800&q=80"
        },
        construccion: {
          1: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
          2: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
          4: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=800&q=80",
          6: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80"
        },
        profesionales: {
          1: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
          2: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
          4: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
          6: "https://images.unsplash.com/photo-1427751840561-985246c99687?auto=format&fit=crop&w=800&q=80"
        },
        educacion: {
          1: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
          2: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
          4: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
          6: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"
        },
        default: {
          1: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
          2: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
          4: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
          6: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
        }
      };

      let aspectRatio = "1:1";
      if (pageNumber === 1) aspectRatio = "16:9";
      else if (pageNumber === 2 || pageNumber === 4) aspectRatio = "4:3";

      const pageTerms: Record<number, string> = {
        1: `A high-quality minimalist corporate hero cover banner background for the industry of "${industry || "business"}", elegant colors, space for overlay text, cinematic lighting, photorealistic, 16:9`,
        2: `A modern professional workplace or collaboration environment for the industry of "${industry || "business"}", warm natural lighting, shallow depth of field, photorealistic, 4:3`,
        4: `A high-end smartphone screen showcasing an elegant digital dashboard or mobile chat interface for "${industry || "business"}" industry, blurred modern office background, photorealistic, 4:3`,
        6: `Sleek high-quality concept for professional services and consultation in the "${industry || "business"}" sector, soft lighting, professional corporate aesthetic, photorealistic, 1:1`
      };

      const promptText = customPrompt || pageTerms[pageNumber] || `High quality professional corporate concept representing the industry of "${industry || "business"}", clean design, photorealistic`;

      try {
        if (!ai) {
          throw new Error("Cliente de IA no inicializado o clave de API faltante.");
        }
        console.log(`[Gemini Image] Generando imagen con prompt: "${promptText}"`);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: promptText,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });

        let generatedUrl = "";
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64EncodeString: string = part.inlineData.data;
            generatedUrl = `data:image/png;base64,${base64EncodeString}`;
            break;
          }
        }

        if (generatedUrl) {
          return res.json({ result: { imageUrl: generatedUrl, isAI: true } });
        } else {
          throw new Error("No inline data returned from Gemini Image model.");
        }
      } catch (geminiError: any) {
        console.warn("[Gemini Image Fallback] Error generating image, falling back to curated Unsplash:", geminiError.message || geminiError);
        const norm = (industry || "").toLowerCase().trim();
        let matchedKey = "default";
        if (norm.includes("agro") || norm.includes("camp") || norm.includes("logis")) matchedKey = "agro";
        else if (norm.includes("inmobil") || norm.includes("casa") || norm.includes("propi")) matchedKey = "inmobiliaria";
        else if (norm.includes("distrib") || norm.includes("mayor") || norm.includes("depo")) matchedKey = "distribuidora";
        else if (norm.includes("gastron") || norm.includes("resto") || norm.includes("comid") || norm.includes("cafe")) matchedKey = "gastronomia";
        else if (norm.includes("salud") || norm.includes("medic") || norm.includes("estet") || norm.includes("clinic") || norm.includes("odont")) matchedKey = "salud";
        else if (norm.includes("constru") || norm.includes("corra") || norm.includes("obra")) matchedKey = "construccion";
        else if (norm.includes("profes") || norm.includes("estud") || norm.includes("conta") || norm.includes("jurid") || norm.includes("abog")) matchedKey = "profesionales";
        else if (norm.includes("educa") || norm.includes("escuel") || norm.includes("coleg") || norm.includes("acad")) matchedKey = "educacion";

        const fallbackMap = INDUSTRY_IMAGES_DICTIONARY[matchedKey] || INDUSTRY_IMAGES_DICTIONARY["default"];
        const fallbackUrl = fallbackMap[pageNumber] || fallbackMap[1] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80";

        return res.json({ result: { imageUrl: fallbackUrl, isAI: false, isFallback: true } });
      }
    }

    return res.status(400).json({ error: "Acción no válida." });
  } catch (error: any) {
    console.error("Error en Gemini API proxy server:", error);
    return res.status(500).json({ error: error.message || "Ocurrió un error al procesar la solicitud con Gemini." });
  }
});

// Configure Vite or Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Clientum Server] Servidor corriendo en http://localhost:${PORT}`);
  });
}

setupServer();
