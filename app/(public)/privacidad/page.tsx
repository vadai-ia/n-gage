import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLandingUserContext } from "@/lib/landing/get-user-context";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aviso de privacidad · N'GAGE",
  description: "Aviso de privacidad de N'GAGE. Cómo tratamos tus datos personales.",
  robots: { index: true, follow: false },
};

export default async function PrivacidadPage() {
  const user = await getLandingUserContext();
  return (
    <>
      <Navbar user={user} />
      <main className="relative pt-32 lg:pt-40 pb-24">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono mb-8" style={{ color: "#8585A8" }}>
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
          <h1 className="font-display font-bold mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#F0F0FF" }}>
            Aviso de privacidad
          </h1>
          <p className="text-sm font-mono mb-10" style={{ color: "#44445A" }}>
            Última actualización: mayo 2026 · Vigente conforme a la LFPDPPP (México)
          </p>

          <article className="prose prose-invert max-w-none space-y-5 text-base leading-relaxed" style={{ color: "#8585A8" }}>
            <p>
              <strong style={{ color: "#F0F0FF" }}>Identidad del responsable.</strong> N&apos;GAGE (en adelante, &quot;N&apos;GAGE&quot;, &quot;nosotros&quot;) es responsable del tratamiento de tus datos personales, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Domicilio para efectos del aviso: Ciudad de México, México. Contacto: <a href="mailto:hola@ngage.com.mx" style={{ color: "#FF2D78" }}>hola@ngage.com.mx</a>.
            </p>

            <h2 className="font-display font-bold text-xl pt-4" style={{ color: "#F0F0FF" }}>Datos que recabamos</h2>
            <p>
              Cuando llenas nuestro formulario de contacto en la página oficial, recabamos: nombre completo, email, teléfono, empresa u organización, tipo y tamaño de evento, fecha y ubicación tentativa, mensaje libre, fuente de origen y, opcionalmente, autorización para recibir comunicaciones comerciales. Adicionalmente, capturamos parámetros UTM, user-agent y país de origen IP con fines analíticos.
            </p>

            <h2 className="font-display font-bold text-xl pt-4" style={{ color: "#F0F0FF" }}>Finalidades</h2>
            <p>
              Tus datos se utilizan para: (i) responder tu solicitud y elaborar una propuesta comercial; (ii) agendar demos en vivo; (iii) gestionar la relación comercial si decides contratar; (iv) si lo aceptaste expresamente, enviarte novedades de N&apos;GAGE. No vendemos ni cedemos tus datos a terceros para fines comerciales propios de éstos.
            </p>

            <h2 className="font-display font-bold text-xl pt-4" style={{ color: "#F0F0FF" }}>Encargados del tratamiento</h2>
            <p>
              Para operar la plataforma, transferimos datos estrictamente operacionales a: Supabase (almacenamiento), Resend (correo transaccional), Vercel (hosting), Cloudinary (medios). Todos cuentan con cláusulas contractuales que les obligan a cumplir con estándares equivalentes de protección.
            </p>

            <h2 className="font-display font-bold text-xl pt-4" style={{ color: "#F0F0FF" }}>Derechos ARCO</h2>
            <p>
              Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación u Oposición (ARCO), así como revocar tu consentimiento, escribiendo a <a href="mailto:hola@ngage.com.mx" style={{ color: "#FF2D78" }}>hola@ngage.com.mx</a> con tu nombre completo, copia simple de identificación oficial y descripción clara del derecho que deseas ejercer. Respondemos en un plazo máximo de 20 días hábiles.
            </p>

            <h2 className="font-display font-bold text-xl pt-4" style={{ color: "#F0F0FF" }}>Conservación</h2>
            <p>
              Conservamos los datos del formulario por el tiempo necesario para gestionar la oportunidad comercial (máximo 24 meses). Pasado ese plazo, anonimizamos los registros para análisis estadístico agregado, sin posibilidad de identificarte.
            </p>

            <h2 id="cookies" className="font-display font-bold text-xl pt-4 scroll-mt-24" style={{ color: "#F0F0FF" }}>Cookies</h2>
            <p>
              Utilizamos cookies esenciales para mantener sesión y preferencias, y cookies analíticas (con tu consentimiento) para entender el uso del sitio y mejorar la experiencia. Puedes administrar tu preferencia desde el banner de cookies que mostramos en tu primera visita.
            </p>

            <h2 className="font-display font-bold text-xl pt-4" style={{ color: "#F0F0FF" }}>Modificaciones</h2>
            <p>
              Podemos actualizar este aviso para reflejar cambios legales o de servicio. Cualquier modificación material se notificará por email a quienes hayan dado de alta su correo, y se publicará la versión vigente en esta misma URL.
            </p>

            <p className="pt-6 text-xs" style={{ color: "#44445A" }}>
              {/* TODO: Validar este aviso con asesor legal antes de tránsito a producción comercial. */}
              Este texto es una primera redacción operativa. Para tránsito a operación comercial recurrente, se recomienda revisión legal especializada.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
