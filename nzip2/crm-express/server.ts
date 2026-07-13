import express from 'express';
import path from 'path';
import { layout } from './views/layout';
import { homePage } from './views/home';
import { chatbotPage } from './views/chatbot';
import { crmPage } from './views/crm';
import { asistentePage } from './views/asistente-ia';
import { reportesPage } from './views/reportes';
import { automatizacionPage } from './views/automatizacion';
import { portalPage } from './views/portal';
import { serviciosPage } from './views/servicios';
import { preciosPage } from './views/precios';
import { loginPage } from './views/login';
import { registerPage } from './views/register';
import { forgotPage } from './views/forgot-password';
import { contactoPage } from './views/contacto';
import { academiaPage } from './views/academia';
import { recursosPage } from './views/recursos';
import { faqPage } from './views/faq';
import { casosPage } from './views/casos';
import { blogPage } from './views/blog';
import { comparativaPage } from './views/comparativa';
import { sociosPage } from './views/socios';
import { industriasPage } from './views/industrias';
import { nosotrosPage } from './views/nosotros';
import { consultoriaPage } from './views/consultoria';
import { erpPage } from './views/erp';
import { implementacionPage } from './views/implementacion';
import { marketingPage } from './views/marketing';
import { integracionPage } from './views/integracion';
import { desarrolloWebPage } from './views/desarrollo-web';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const send = (res: express.Response, content: string, title = 'Clientum CRM') =>
  res.send(layout(content, title));

// Main
app.get('/', (_, res) => send(res, homePage(), 'Clientum CRM — Tu PyME organizada y automatizada'));

// Funciones
app.get('/chatbot', (_, res) => send(res, chatbotPage(), 'Chatbot WhatsApp — Clientum'));
app.get('/crm', (_, res) => send(res, crmPage(), 'CRM Inteligente — Clientum'));
app.get('/asistente-ia', (_, res) => send(res, asistentePage(), 'Asistente IA — Clientum'));
app.get('/reportes', (_, res) => send(res, reportesPage(), 'Reportes Automáticos — Clientum'));
app.get('/automatizacion', (_, res) => send(res, automatizacionPage(), 'Automatización — Clientum'));
app.get('/portal', (_, res) => send(res, portalPage(), 'Portal del Cliente — Clientum'));

// Servicios
app.get('/servicios', (_, res) => send(res, serviciosPage(), 'Servicios — Clientum'));
app.get('/consultoria', (_, res) => send(res, consultoriaPage(), 'Consultoría Empresarial — Clientum'));
app.get('/erp', (_, res) => send(res, erpPage(), 'ERP Personalizado — Clientum'));
app.get('/implementacion', (_, res) => send(res, implementacionPage(), 'Implementación y Soporte — Clientum'));
app.get('/marketing', (_, res) => send(res, marketingPage(), 'Marketing Digital — Clientum'));
app.get('/integracion', (_, res) => send(res, integracionPage(), 'Integración de Tecnología — Clientum'));
app.get('/desarrollo-web', (_, res) => send(res, desarrolloWebPage(), 'Desarrollo Web — Clientum'));

// Empresa
app.get('/nosotros', (_, res) => send(res, nosotrosPage(), 'Sobre Nosotros — Clientum'));
app.get('/casos', (_, res) => send(res, casosPage(), 'Casos de Éxito — Clientum'));
app.get('/industrias', (_, res) => send(res, industriasPage(), 'Casos por Industria — Clientum'));
app.get('/blog', (_, res) => send(res, blogPage(), 'Blog — Clientum'));
app.get('/comparativa', (_, res) => send(res, comparativaPage(), 'Comparativa — Clientum'));
app.get('/socios', (_, res) => send(res, sociosPage(), 'Programa de Socios — Clientum'));

// Recursos
app.get('/academia', (_, res) => send(res, academiaPage(), 'Academia — Clientum'));
app.get('/recursos', (_, res) => send(res, recursosPage(), 'Centro de Recursos — Clientum'));
app.get('/faq', (_, res) => send(res, faqPage(), 'FAQ — Clientum'));
app.get('/precios', (_, res) => send(res, preciosPage(), 'Planes y Precios — Clientum'));
app.get('/contacto', (_, res) => send(res, contactoPage(), 'Contacto — Clientum'));

// Auth
app.get('/login', (_, res) => res.send(loginPage()));
app.get('/register', (_, res) => res.send(registerPage()));
app.get('/forgot-password', (_, res) => res.send(forgotPage()));

app.post('/login', (req, res) => res.redirect('/'));
app.post('/register', (req, res) => res.redirect('/login'));

app.listen(PORT, () => console.log(`Clientum CRM corriendo en http://localhost:${PORT}`));
