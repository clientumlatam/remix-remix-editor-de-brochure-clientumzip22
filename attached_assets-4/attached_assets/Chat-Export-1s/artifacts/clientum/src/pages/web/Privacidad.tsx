import { SiteLayout } from "@/components/layout/SiteLayout";

const SECTIONS = [
  {
    title: "Quiénes somos",
    content: "La dirección de nuestra web es: https://web.clientum.net.ar. Clientum S.R.L. es una empresa dedicada a ofrecer soluciones tecnológicas para PyMEs.",
  },
  {
    title: "Comentarios",
    content: "Cuando los visitantes dejan comentarios en la web, recopilamos los datos que se muestran en el formulario de comentarios, así como la dirección IP del visitante y la cadena de agentes de usuario del navegador, para ayudar a la detección de spam. Una cadena anónima creada a partir de tu dirección de correo electrónico puede ser proporcionada al servicio de Gravatar para ver si la estás usando.",
  },
  {
    title: "Multimedia",
    content: "Si subís imágenes a la web deberías evitar subir imágenes con datos de ubicación (GPS EXIF) incluidos. Los visitantes de la web pueden descargar y extraer cualquier dato de localización de las imágenes de la web.",
  },
  {
    title: "Cookies",
    content: "Si dejás un comentario en nuestro sitio, podés optar por guardar tu nombre, dirección de correo electrónico y sitio web en las cookies. Estos son para tu conveniencia para que no tengas que volver a ingresar tus datos cuando dejés otro comentario. Las cookies tendrán una duración de un año. Si tenés una cuenta y accedés al sitio, se establecerá una cookie temporal para determinar si tu navegador acepta cookies.",
  },
  {
    title: "Contenido incrustado de otros sitios web",
    content: "Los artículos de este sitio pueden incluir contenido incrustado (por ejemplo, vídeos, imágenes, artículos, etc.). El contenido incrustado de otros sitios web se comporta exactamente de la misma manera que si el visitante hubiera visitado el otro sitio web. Estos sitios web pueden recopilar datos sobre vos, utilizar cookies, incrustar un seguimiento adicional de terceros, y supervisar tu interacción con ese contenido incrustado.",
  },
  {
    title: "Con quién compartimos tus datos",
    content: "Si solicitás un restablecimiento de contraseña, tu dirección IP será incluida en el correo electrónico de restablecimiento. No compartimos tus datos personales con terceros sin tu consentimiento expreso, excepto cuando sea requerido por ley.",
  },
  {
    title: "Durante cuánto tiempo conservamos tus datos",
    content: "Si dejas un comentario, el comentario y sus metadatos se conservan indefinidamente. Para los usuarios que se registran en nuestro sitio web, también almacenamos la información personal que proporcionan en su perfil de usuario. Todos los usuarios pueden ver, editar o eliminar su información personal en cualquier momento.",
  },
  {
    title: "Qué derechos tenés sobre tus datos",
    content: "Si tenés una cuenta en este sitio o has dejado comentarios, podés solicitar recibir un archivo de exportación de los datos personales que tenemos sobre vos, incluyendo cualquier dato que nos hayas proporcionado. También podés solicitar que eliminemos cualquier dato personal que tengamos sobre vos. Esto no incluye ningún dato que estemos obligados a conservar con fines administrativos, legales o de seguridad.",
  },
  {
    title: "Adónde enviamos tus datos",
    content: "Los comentarios de los visitantes pueden ser comprobados a través de un servicio de detección automática de spam. Nuestros servidores están ubicados en la Unión Europea y cumplen con las normativas GDPR aplicables.",
  },
];

export default function Privacidad() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-24 px-6 bg-[#f7f5f4] text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Política de Privacidad</h1>
          <p className="text-gray-600">Última actualización: enero de 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed text-base">
              En Clientum, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política describe qué datos recopilamos, cómo los usamos y cuáles son tus derechos al respecto.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{section.content}</p>
            </div>
          ))}

          <div className="bg-[#f7f5f4] rounded-xl p-6 space-y-2">
            <h3 className="font-bold text-gray-900">Contacto para cuestiones de privacidad</h3>
            <p className="text-gray-600 text-sm">Si tenés preguntas sobre esta política de privacidad, podés contactarnos en:</p>
            <a href="mailto:privacidad@clientum.net.ar" className="text-sm font-semibold" style={{ color: "#2467a2" }}>
              privacidad@clientum.net.ar
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
