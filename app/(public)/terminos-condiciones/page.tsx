import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminos y Condiciones — N'GAGE",
  description: "Terminos y condiciones de uso y aviso de privacidad de N'GAGE.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto" style={{ background: "#07070F", color: "#F0F0FF" }}>
      <a href="/" className="text-xs font-medium mb-6 inline-block" style={{ color: "#8585A8" }}>
        &larr; Volver
      </a>

      <h1 className="text-2xl font-black tracking-tight mb-2">
        Terminos y Condiciones de Uso y Aviso de Privacidad
      </h1>
      <p className="text-xs mb-8" style={{ color: "#44445A" }}>
        Ultima actualizacion: 20 de abril de 2026 — Version 1.0
      </p>

      <div className="prose-sm leading-relaxed flex flex-col gap-6" style={{ color: "#8585A8" }}>

        {/* Resumen */}
        <div className="rounded-xl p-4" style={{ background: "#0F0F1A", border: "1px solid rgba(255,45,120,0.15)" }}>
          <p className="text-xs font-bold mb-2" style={{ color: "#FF2D78" }}>RESUMEN (casilla de aceptacion)</p>
          <p className="text-xs leading-relaxed">
            Al marcar esta casilla confirmo que soy mayor de 18 anos; acepto los Terminos y Condiciones y el Aviso de Privacidad de N&apos;GAGE; autorizo el uso de mi selfie, foto de perfil, nombre, edad y datos del evento para participar en el servicio; entiendo que mi perfil y fotos seran visibles para otras personas en el mismo evento; y acepto que el contenido del evento (fotos y chats) caduca en el plazo que fije el organizador.
          </p>
        </div>

        {/* 1 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>1. ACEPTACION DE LOS TERMINOS</h2>
          <p className="text-xs">
            Bienvenido a N&apos;GAGE (en adelante, &ldquo;la Plataforma&rdquo;, &ldquo;la App&rdquo; o &ldquo;el Servicio&rdquo;), operada por VADAI, con domicilio en Ciudad de Mexico, Mexico (en adelante, &ldquo;N&apos;GAGE&rdquo;, &ldquo;nosotros&rdquo; o &ldquo;el Responsable&rdquo;).
          </p>
          <p className="text-xs mt-2">
            El presente documento constituye un contrato legalmente vinculante entre tu (en adelante, &ldquo;el Usuario&rdquo;) y N&apos;GAGE. Al crear una cuenta, iniciar sesion, escanear un codigo QR de un evento o utilizar cualquier funcionalidad del Servicio, manifiestas que has leido, entendido y aceptado integramente estos Terminos y Condiciones y el Aviso de Privacidad que forma parte integral de los mismos.
          </p>
          <p className="text-xs mt-2 font-bold" style={{ color: "#F0F0FF" }}>
            Si no estas de acuerdo con alguna disposicion, debes abstenerte de registrarte y dejar de usar el Servicio inmediatamente.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>2. DESCRIPCION DEL SERVICIO</h2>
          <p className="text-xs">
            N&apos;GAGE es una plataforma web mobile-first de conexion social efimera por evento, que permite a personas mayores de edad asistentes a un mismo evento conocerse entre si durante el tiempo que dure dicho evento mediante funcionalidades como: registro mediante codigo QR, perfil con selfie del dia, sistema de swipe (like / dislike / super like), creacion de matches, album fotografico colectivo del evento y notificaciones in-app.
          </p>
          <p className="text-xs mt-2 font-bold" style={{ color: "#F0F0FF" }}>
            La Plataforma NO es una aplicacion de citas permanentes. Todo el contenido generado dentro del evento tiene caducidad configurable por el organizador del evento, tipicamente entre 1 y 30 dias posteriores al mismo.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>3. ELEGIBILIDAD Y REQUISITOS PARA EL REGISTRO</h2>
          <p className="text-xs"><strong style={{ color: "#F0F0FF" }}>3.1 Edad minima:</strong> Para registrarte y utilizar N&apos;GAGE debes tener como minimo 18 anos cumplidos. La Plataforma no esta dirigida ni permite el uso a personas menores de edad. Si descubrimos que un usuario es menor de 18 anos, cancelaremos su cuenta de forma inmediata.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>3.2 Capacidad legal:</strong> Al registrarte manifiestas que cuentas con plena capacidad juridica para obligarte en terminos de la legislacion mexicana.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>3.3 Veracidad de la informacion:</strong> Te comprometes a proporcionar informacion verdadera, exacta, actual y completa. Esta prohibido registrarse usando la identidad de otra persona, crear perfiles falsos o utilizar fotos que no sean tuyas.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>3.4 Una sola cuenta por persona:</strong> Cada usuario podra mantener una unica cuenta activa en N&apos;GAGE.</p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>4. CUENTA DE USUARIO Y SEGURIDAD</h2>
          <p className="text-xs">Puedes registrarte mediante correo electronico y contrasena o tu cuenta de Google. Eres el unico responsable de mantener la confidencialidad de tus credenciales y de todas las actividades que se realicen desde tu cuenta. Nos reservamos el derecho de suspender, bloquear o eliminar tu cuenta cuando detectemos violaciones a estos Terminos.</p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>5. USO DE IMAGENES Y FOTOGRAFIAS</h2>
          <p className="text-xs"><strong style={{ color: "#F0F0FF" }}>5.1 Foto de perfil:</strong> Debe ser tuya y mostrar tu rostro claramente.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>5.2 Selfie del dia:</strong> Es obligatoria para participar en el swipe. Se toma desde la camara del dispositivo (no galeria). Tiene como finalidad reducir suplantaciones y asegurar que asistes al evento.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>5.3 Fotografias del evento:</strong> Podras tomar hasta 10 fotografias por evento. Cada foto queda marcada con tu identidad, fecha, hora y dispositivo. Los anfitriones pueden ver quien tomo cada foto. Es tu responsabilidad obtener el consentimiento de cualquier persona que aparezca en las fotos.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>5.4 Licencia:</strong> Al subir imagenes nos otorgas una licencia mundial, no exclusiva, libre de regalias para alojarlas, procesarlas y mostrarlas dentro del contexto del evento. No usaremos tus imagenes con fines publicitarios sin tu consentimiento expreso.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>5.5 Biometria:</strong> N&apos;GAGE no realiza reconocimiento facial biometrico automatizado, no crea plantillas biometricas y no utiliza las selfies para entrenamiento de modelos de inteligencia artificial.</p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>6. CONTENIDO GENERADO POR EL USUARIO</h2>
          <p className="text-xs">Eres responsable del contenido que publiques en tu perfil. Esta prohibido utilizar la Plataforma para acosar, amenazar, enviar contenido sexual explicito, spam, hacerse pasar por otra persona, promover violencia o utilizar bots o automatizaciones. El incumplimiento derivara en suspension inmediata.</p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>7. VISIBILIDAD DE TU INFORMACION DENTRO DEL EVENTO</h2>
          <p className="text-xs">Al registrarte en un evento aceptas que tu nombre, selfie, edad, relacion con el evento, mesa, intereses y bio seran visibles para otros asistentes. Los Event Hosts pueden ver matches y album con autor identificado. El organizador puede ver metricas agregadas pero no el contenido de chats privados.</p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>8. CADUCIDAD DEL CONTENIDO</h2>
          <p className="text-xs">El contenido generado dentro de cada evento tiene vigencia limitada (1 a 30 dias). Una vez vencido, el contenido deja de estar disponible y puede ser eliminado. Tu cuenta global y foto de perfil pueden persistir entre eventos.</p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>9. NOTIFICACIONES</h2>
          <p className="text-xs">Al registrarte autorizas a N&apos;GAGE a enviarte comunicaciones por correo electronico y notificaciones in-app. Puedes cancelar las notificaciones en cualquier momento desde tu perfil.</p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>10. PROPIEDAD INTELECTUAL</h2>
          <p className="text-xs">El software, diseno, marcas y logotipos de N&apos;GAGE son propiedad de N&apos;GAGE o se utilizan bajo licencia. Se te otorga una licencia limitada, personal, revocable y no transferible para usar la Plataforma. Tu conservas la titularidad de tus contenidos.</p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>11. SERVICIOS DE TERCEROS</h2>
          <p className="text-xs">La Plataforma se apoya en proveedores externos incluyendo Supabase, Cloudinary, Google y Vercel. Al usar N&apos;GAGE aceptas que parte de tus datos sean procesados por estos proveedores con medidas de seguridad razonables.</p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>12. AVISO DE PRIVACIDAD INTEGRAL</h2>
          <p className="text-xs"><strong style={{ color: "#F0F0FF" }}>12.1 Responsable:</strong> VADAI, Ciudad de Mexico, Mexico.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>12.2 Datos que recabamos:</strong> Nombre, edad, fotografias, correo electronico, genero, orientacion de busqueda, intereses, bio, contenido generado (fotos, likes), y datos tecnicos (IP, user agent, sesion).</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>12.3 Finalidades primarias:</strong> Crear tu cuenta, permitir tu participacion en eventos, mostrar tu perfil, enviarte notificaciones, operar albums, cumplir obligaciones legales y prevenir fraude.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>12.4 Finalidades secundarias:</strong> Comunicaciones promocionales, encuestas de satisfaccion y analisis estadistico agregado. Puedes negarte enviando correo a privacidad@ngage.com.mx.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>12.5 Transferencias:</strong> A organizadores del evento, Event Hosts, proveedores de infraestructura y autoridades competentes. No vendemos ni rentamos datos a terceros.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>12.6 Derechos ARCO:</strong> Puedes ejercer tus derechos de Acceso, Rectificacion, Cancelacion y Oposicion enviando solicitud a privacidad@ngage.com.mx. Responderemos en maximo 20 dias habiles.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>12.7 Conservacion:</strong> Datos del evento se conservan por el plazo fijado por el organizador. Datos de cuenta mientras permanezca activa. Copias de respaldo hasta 90 dias.</p>
          <p className="text-xs mt-2"><strong style={{ color: "#F0F0FF" }}>12.8 Seguridad:</strong> Cifrado en transito (HTTPS/TLS), cifrado en reposo, control de acceso por roles, hash de contrasenas y soft delete.</p>
        </section>

        {/* 13-18 */}
        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>13. SUSPENSION Y TERMINACION</h2>
          <p className="text-xs">Puedes eliminar tu cuenta en cualquier momento. N&apos;GAGE puede suspender o terminar tu acceso sin previo aviso ante violaciones a estos Terminos, riesgo para otros usuarios, actividad fraudulenta o requerimiento de autoridad.</p>
        </section>

        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>14. LIMITACION DE RESPONSABILIDAD</h2>
          <p className="text-xs">N&apos;GAGE facilita la conexion entre personas pero no es responsable del comportamiento de los usuarios ni de eventos fisicos fuera de la Plataforma. No realizamos verificacion exhaustiva de antecedentes. El Servicio se ofrece &ldquo;tal cual&rdquo; y &ldquo;segun disponibilidad&rdquo;.</p>
        </section>

        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>15. INDEMNIZACION</h2>
          <p className="text-xs">Te obligas a sacar en paz y a salvo a N&apos;GAGE de cualquier reclamacion, demanda, dano o costo que surja del uso que hagas del Servicio o de la violacion de estos Terminos.</p>
        </section>

        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>16. MODIFICACIONES</h2>
          <p className="text-xs">Podemos actualizar estos Terminos en cualquier momento. Los cambios se notificaran dentro de la Plataforma. El uso continuado implica aceptacion.</p>
        </section>

        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>17. LEY APLICABLE Y JURISDICCION</h2>
          <p className="text-xs">Estos Terminos se rigen por las leyes de los Estados Unidos Mexicanos. Las partes se someten a la jurisdiccion de los tribunales competentes de la Ciudad de Mexico.</p>
        </section>

        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>18. DISPOSICIONES GENERALES</h2>
          <p className="text-xs">Este documento y el Aviso de Privacidad constituyen el acuerdo completo entre las partes. Si alguna clausula es declarada nula, las demas permaneceran en vigor.</p>
        </section>

        <section>
          <h2 className="text-base font-black mb-2" style={{ color: "#F0F0FF" }}>19. CONTACTO</h2>
          <p className="text-xs">Correo general: soporte@ngage.com.mx</p>
          <p className="text-xs">Datos personales y derechos ARCO: privacidad@ngage.com.mx</p>
          <p className="text-xs">Reportes de abuso: abuso@ngage.com.mx</p>
        </section>

        <div className="rounded-xl p-4 mt-4" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs text-center" style={{ color: "#44445A" }}>
            Documento elaborado el 20 de abril de 2026 — Version 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
