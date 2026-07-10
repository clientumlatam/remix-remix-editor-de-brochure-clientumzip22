import { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Mail, MapPin, Phone, MessageCircle, Instagram, Linkedin, Facebook } from "lucide-react";

const BRAND_BLUE = "#2467a2";

export default function Contacto() {
  const [form, setForm] = useState({ nombre: "", email: "", empresa: "", rubro: "", mensaje: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: "linear-gradient(135deg, #0f2952 0%, #2467a2 100%)" }}
      >
        <div className="max-w-2xl mx-auto space-y-4 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold">Hablemos</h1>
          <p className="text-blue-100 leading-relaxed text-lg">
            Contamos con un equipo listo para ayudarte a automatizar tu PyME. Sin vueltas.
          </p>
        </div>
      </section>

      {/* Offices */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {[
            {
              tag: "Casa Central",
              city: "General Roca, Río Negro",
              address: "Av. Julio A. Roca 1250\nGeneral Roca, Río Negro\nArgentina",
              link: "https://maps.google.com/?q=General+Roca+Rio+Negro+Argentina",
            },
            {
              tag: "Oficina Buenos Aires",
              city: "Buenos Aires, AMBA",
              address: "Av. Corrientes 1234, piso 8\nCiudad Autónoma de Buenos Aires\nArgentina",
              link: "https://maps.google.com/?q=Av+Corrientes+Buenos+Aires",
            },
          ].map((office) => (
            <a
              key={office.tag}
              href={office.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f7f5f4] rounded-xl p-6 space-y-3 hover:shadow-md transition-all block"
            >
              <div className="w-full aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-10 h-10" style={{ color: BRAND_BLUE }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{office.tag}</p>
              <h3 className="text-xl font-bold text-gray-900">{office.city}</h3>
              <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{office.address}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-20 px-6 bg-[#f7f5f4]">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8">
            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "#25d366" }}>
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">¡Mensaje enviado!</h3>
                <p className="text-gray-600">Nos pondremos en contacto dentro de las próximas 24 horas hábiles.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Envianos un mensaje</h3>
                  <p className="text-gray-500 text-sm mt-1">Respondemos en menos de 24 horas hábiles.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre *</label>
                    <input
                      required
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2467a2] transition-colors"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2467a2] transition-colors"
                      placeholder="tu@empresa.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Empresa</label>
                    <input
                      value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2467a2] transition-colors"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Rubro</label>
                    <select
                      value={form.rubro}
                      onChange={(e) => setForm({ ...form, rubro: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2467a2] transition-colors bg-white text-gray-700"
                    >
                      <option value="">Seleccioná tu rubro</option>
                      <option>Comercio / Retail</option>
                      <option>Servicios profesionales</option>
                      <option>Gastronomía / Hotelería</option>
                      <option>Salud / Estética</option>
                      <option>Distribución / Logística</option>
                      <option>Manufactura / Industria</option>
                      <option>Agroindustria</option>
                      <option>Otro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">¿En qué podemos ayudarte? *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2467a2] transition-colors resize-none"
                    placeholder="Contanos brevemente tu situación y qué querés automatizar..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: BRAND_BLUE }}
                >
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-7">
            <div>
              <h6 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Contacto directo</h6>
              <div className="space-y-3 text-sm">
                <a href="mailto:hola@clientum.com.ar" className="flex items-center gap-3 text-gray-600 hover:text-[#2467a2] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" style={{ color: BRAND_BLUE }} />
                  </div>
                  hola@clientum.com.ar
                </a>
                <a href="tel:+5402984000000" className="flex items-center gap-3 text-gray-600 hover:text-[#2467a2] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" style={{ color: BRAND_BLUE }} />
                  </div>
                  +54 (0298) 400-0000
                </a>
                <a href="https://wa.me/5492984000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-[#25d366] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#25d366" }}>
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  WhatsApp directo
                </a>
              </div>
            </div>

            <div>
              <h6 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Datos fiscales</h6>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">Clientum S.R.L.</p>
                <p>CUIT: 30-71234567-8</p>
                <p>IVA Responsable Inscripto</p>
                <p className="flex items-start gap-2 mt-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: BRAND_BLUE }} />
                  <span>Av. Julio A. Roca 1250<br />General Roca, Río Negro<br />Argentina (8332)</span>
                </p>
              </div>
            </div>

            <div>
              <h6 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Seguinos</h6>
              <div className="flex gap-3">
                {[
                  { icon: <Instagram className="w-4 h-4" />, href: "https://instagram.com/clientum.ar", label: "Instagram" },
                  { icon: <Facebook className="w-4 h-4" />, href: "https://facebook.com/clientum", label: "Facebook" },
                  { icon: <Linkedin className="w-4 h-4" />, href: "https://linkedin.com/company/clientum", label: "LinkedIn" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-80"
                    style={{ background: BRAND_BLUE }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-[#2467a2] font-semibold uppercase tracking-wide mb-1">¿Querés una demo rápida?</p>
              <p className="text-sm text-gray-700">Agendamos una videollamada de 30 minutos y te mostramos Clientum en acción con tu caso de uso.</p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
