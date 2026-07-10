import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, BarChart3, Users, Zap, MessageCircle, Check, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PLANS = [
  {
    name: "Starter",
    price: "9.990",
    desc: "Para emprendedores y equipos chicos",
    highlight: false,
    features: [
      "Hasta 3 usuarios",
      "500 contactos",
      "Pipeline de leads y deals",
      "Facturación básica",
      "Soporte por email",
    ],
  },
  {
    name: "Pro",
    price: "24.990",
    desc: "El más popular para PyMEs en crecimiento",
    highlight: true,
    features: [
      "Hasta 10 usuarios",
      "Contactos ilimitados",
      "WhatsApp integrado",
      "Factura electrónica AFIP",
      "Asistente IA incluido",
      "Soporte prioritario",
    ],
  },
  {
    name: "Business",
    price: "59.990",
    desc: "Para empresas con operaciones complejas",
    highlight: false,
    features: [
      "Usuarios ilimitados",
      "Multi-sucursal",
      "API + integraciones",
      "Reportes avanzados",
      "SLA garantizado",
      "Onboarding dedicado",
    ],
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
              <span className="font-black text-lg">C</span>
            </div>
            Clientum
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/app/dashboard">
                <Button>Ir al dashboard <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:flex">Iniciar sesión</Button>
                </Link>
                <Link href="/register">
                  <Button>Comenzar gratis <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            El CRM hecho para <br />
            <span className="text-primary">PyMEs argentinas.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            No más planillas. No más herramientas caras en dólares. 
            Clientum es el CRM completo con AFIP, WhatsApp e IA que tu equipo de ventas necesita.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={isAuthenticated ? "/app/dashboard" : "/register"}>
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                {isAuthenticated ? "Ir al dashboard" : "Empezar gratis"} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto">
                Ver precios
              </Button>
            </a>
          </div>
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Sin tarjeta de crédito</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 14 días gratis</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Precios en pesos</div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto rounded-2xl border border-gray-200/60 shadow-2xl bg-white overflow-hidden">
          <div className="h-12 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50/50">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="p-8 bg-gray-50/30 flex gap-8">
            <div className="w-64 hidden md:block space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-8 bg-gray-100 rounded-md" style={{ width: `${60 + i * 8}%` }}></div>
              ))}
            </div>
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-32 bg-white border border-gray-100 rounded-xl shadow-sm"></div>
                ))}
              </div>
              <div className="h-64 bg-white border border-gray-100 rounded-xl shadow-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Todo lo que necesitás. Nada que no.</h2>
            <p className="mt-4 text-lg text-gray-600">Diseñado para la realidad del mercado argentino.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Pipeline de ventas"
              description="Seguí leads y deals en un Kanban visual. Sabé exactamente en qué etapa está cada oportunidad y qué hay que hacer."
            />
            <FeatureCard 
              icon={<MessageCircle className="w-6 h-6" />}
              title="WhatsApp integrado"
              description="Respondé mensajes de clientes desde el CRM. Todas las conversaciones quedan asociadas al contacto automáticamente."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Facturación con AFIP"
              description="Generá facturas A y B, completá CUIT, condición de IVA y CAE. Todo integrado con tu CRM."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Asistente IA"
              description="Preguntale al asistente sobre tu pipeline, clientes o actividades. Respuestas instantáneas sin salir del CRM."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Multi-empresa"
              description="Cada empresa tiene su propio espacio aislado. Perfecta para agencias o grupos empresariales."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Equipo ilimitado"
              description="Invitá a tu equipo de ventas, administración y soporte. Colaboración en tiempo real."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Precios simples, en pesos</h2>
            <p className="mt-4 text-lg text-gray-600">Sin costos ocultos. Sin sorpresas. Cancelá cuando quieras.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "rounded-2xl border p-8 space-y-6 relative",
                  plan.highlight
                    ? "border-primary shadow-xl shadow-primary/10 bg-primary text-white"
                    : "border-gray-200 bg-white"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Más popular
                    </span>
                  </div>
                )}
                <div>
                  <h3 className={cn("text-xl font-bold", plan.highlight ? "text-white" : "text-gray-900")}>{plan.name}</h3>
                  <p className={cn("text-sm mt-1", plan.highlight ? "text-white/70" : "text-gray-500")}>{plan.desc}</p>
                </div>
                <div>
                  <span className={cn("text-4xl font-black", plan.highlight ? "text-white" : "text-gray-900")}>
                    ${plan.price}
                  </span>
                  <span className={cn("text-sm ml-1", plan.highlight ? "text-white/70" : "text-gray-500")}>/mes + IVA</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={cn("w-4 h-4 flex-shrink-0", plan.highlight ? "text-white" : "text-green-500")} />
                      <span className={plan.highlight ? "text-white/90" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={isAuthenticated ? "/app/dashboard" : "/register"}>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "secondary" : "outline"}
                    size="lg"
                  >
                    {isAuthenticated ? "Ir al dashboard" : "Empezar gratis"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Necesitás algo personalizado?{" "}
            <a href="mailto:hola@clientum.ar" className="text-primary hover:underline">Contactanos</a>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary text-white text-center px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">¿Listo para potenciar tus ventas?</h2>
          <p className="text-xl text-primary-foreground/80">Sumáte a los cientos de PyMEs argentinas que ya crecen con Clientum.</p>
          <Link href={isAuthenticated ? "/app/dashboard" : "/register"}>
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg text-primary hover:text-primary">
              {isAuthenticated ? "Ir al dashboard" : "Crear cuenta gratis"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white">
              <span className="font-black text-xs">C</span>
            </div>
            Clientum
          </div>
          <p>© 2026 Clientum. Hecho con ♥ en Argentina.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="space-y-4">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
