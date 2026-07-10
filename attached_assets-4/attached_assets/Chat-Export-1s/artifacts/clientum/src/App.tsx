import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PortalProvider, usePortal } from "@/contexts/PortalContext";
import { AiAssistant } from "@/components/AiAssistant";

import { AppLayout } from "@/components/layout/AppLayout";

// CRM app pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Contacts from "@/pages/Contacts";
import ContactDetail from "@/pages/ContactDetail";
import Companies from "@/pages/Companies";
import Leads from "@/pages/Leads";
import Deals from "@/pages/Deals";
import Activities from "@/pages/Activities";
import Invoices from "@/pages/Invoices";
import Products from "@/pages/Products";
import Quotes from "@/pages/Quotes";
import QuoteDetail from "@/pages/QuoteDetail";
import AiChat from "@/pages/AiChat";
import WhatsApp from "@/pages/WhatsApp";
import Settings from "@/pages/Settings";
import Appointments from "@/pages/Appointments";
import Orders from "@/pages/Orders";
import Broadcast from "@/pages/Broadcast";
import Prospector from "@/pages/Prospector";
import Analytics from "@/pages/Analytics";
import Services from "@/pages/Services";
import Payments from "@/pages/Payments";
import CopilotHistory from "@/pages/CopilotHistory";

// Marketing website pages
import Inicio from "@/pages/web/Inicio";
import Servicios from "@/pages/web/Servicios";
import ConsultoriaEmpresarial from "@/pages/web/ConsultoriaEmpresarial";
import ErpPersonalizado from "@/pages/web/ErpPersonalizado";
import ImplementacionSoporte from "@/pages/web/ImplementacionSoporte";
import MarketingDigital from "@/pages/web/MarketingDigital";
import IntegracionTecnologia from "@/pages/web/IntegracionTecnologia";
import DesarrolloWeb from "@/pages/web/DesarrolloWeb";
import Precios from "@/pages/web/Precios";
import CasosDeExito from "@/pages/web/CasosDeExito";
import Faq from "@/pages/web/Faq";
import Contacto from "@/pages/web/Contacto";
import Recursos from "@/pages/web/Recursos";
import Academia from "@/pages/web/Academia";
import ProgramaSocios from "@/pages/web/ProgramaSocios";
import Blog from "@/pages/web/Blog";
import SobreNosotros from "@/pages/web/SobreNosotros";
import Privacidad from "@/pages/web/Privacidad";
import Comparativa from "@/pages/web/Comparativa";

// Funciones pages
import WhatsAppPage from "@/pages/web/funciones/WhatsAppPage";
import CrmPage from "@/pages/web/funciones/CrmPage";
import IaPage from "@/pages/web/funciones/IaPage";
import ReportesPage from "@/pages/web/funciones/ReportesPage";
import AutomatizacionPage from "@/pages/web/funciones/AutomatizacionPage";
import PortalPage from "@/pages/web/funciones/PortalPage";

// Portal de clientes
import PortalLogin from "@/pages/portal/PortalLogin";
import PortalDashboard from "@/pages/portal/PortalDashboard";
import PortalInvoices from "@/pages/portal/PortalInvoices";
import PortalDeals from "@/pages/portal/PortalDeals";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, err: any) => {
        if (err?.status === 401) return false;
        return count < 2;
      },
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <>{children}</>;
}

function PortalProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = usePortal();
  if (!isAuthenticated) return <Redirect to="/portal/login" />;
  return <>{children}</>;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Marketing website */}
      <Route path="/" component={Inicio} />
      <Route path="/servicios" component={Servicios} />
      <Route path="/servicios/consultoria" component={ConsultoriaEmpresarial} />
      <Route path="/servicios/erp" component={ErpPersonalizado} />
      <Route path="/servicios/implementacion" component={ImplementacionSoporte} />
      <Route path="/servicios/marketing" component={MarketingDigital} />
      <Route path="/servicios/integracion" component={IntegracionTecnologia} />
      <Route path="/servicios/desarrollo-web" component={DesarrolloWeb} />
      <Route path="/precios" component={Precios} />
      <Route path="/casos-de-exito" component={CasosDeExito} />
      <Route path="/faq" component={Faq} />
      <Route path="/contacto" component={Contacto} />
      <Route path="/recursos" component={Recursos} />
      <Route path="/academia" component={Academia} />
      <Route path="/programa-socios" component={ProgramaSocios} />
      <Route path="/blog" component={Blog} />
      <Route path="/sobre-nosotros" component={SobreNosotros} />
      <Route path="/privacidad" component={Privacidad} />
      <Route path="/comparativa" component={Comparativa} />

      {/* Funciones */}
      <Route path="/funciones/whatsapp" component={WhatsAppPage} />
      <Route path="/funciones/crm" component={CrmPage} />
      <Route path="/funciones/ia" component={IaPage} />
      <Route path="/funciones/reportes" component={ReportesPage} />
      <Route path="/funciones/automatizacion" component={AutomatizacionPage} />
      <Route path="/funciones/portal" component={PortalPage} />

      {/* Auth */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/app/dashboard" /> : <Login />}
      </Route>
      <Route path="/register">
        {isAuthenticated ? <Redirect to="/app/dashboard" /> : <Register />}
      </Route>
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Portal de clientes */}
      <Route path="/portal/login" component={PortalLogin} />
      <Route path="/portal/dashboard">
        <PortalProtectedRoute><PortalDashboard /></PortalProtectedRoute>
      </Route>
      <Route path="/portal/invoices">
        <PortalProtectedRoute><PortalInvoices /></PortalProtectedRoute>
      </Route>
      <Route path="/portal/deals">
        <PortalProtectedRoute><PortalDeals /></PortalProtectedRoute>
      </Route>
      <Route path="/portal">
        <Redirect to="/portal/login" />
      </Route>

      {/* Protected CRM App Routes */}
      <Route path="/app/*">
        <ProtectedRoute>
          <AppLayout>
            <Switch>
              <Route path="/app/dashboard" component={Dashboard} />
              <Route path="/app/contacts" component={Contacts} />
              <Route path="/app/contacts/:id" component={ContactDetail} />
              <Route path="/app/companies" component={Companies} />
              <Route path="/app/leads" component={Leads} />
              <Route path="/app/deals" component={Deals} />
              <Route path="/app/activities" component={Activities} />
              <Route path="/app/invoices" component={Invoices} />
              <Route path="/app/products" component={Products} />
              <Route path="/app/quotes" component={Quotes} />
              <Route path="/app/quotes/:id" component={QuoteDetail} />
              <Route path="/app/ai-chat" component={AiChat} />
              <Route path="/app/whatsapp" component={WhatsApp} />
              <Route path="/app/appointments" component={Appointments} />
              <Route path="/app/orders" component={Orders} />
              <Route path="/app/broadcast" component={Broadcast} />
              <Route path="/app/prospector" component={Prospector} />
              <Route path="/app/analytics" component={Analytics} />
              <Route path="/app/services" component={Services} />
              <Route path="/app/payments" component={Payments} />
              <Route path="/app/copilot-history" component={CopilotHistory} />
              <Route path="/app/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
          <AiAssistant />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PortalProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </PortalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
