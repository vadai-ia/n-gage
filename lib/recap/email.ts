function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function renderRecapEmail(d: { eventName: string; url: string; directUrl: string; code: string }): string {
  const name = escapeHtml(d.eventName);
  return `<!doctype html><html><body style="margin:0;background:#07070F;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#F0F0FF;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:linear-gradient(135deg,#FF2D78,#7B2FBE,#1A6EFF);padding:1px;border-radius:20px;">
        <div style="background:#0F0F1A;border-radius:19px;padding:36px 32px;text-align:center;">
          <p style="margin:0 0 12px;color:#FF2D78;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.24em;">Recuerdos N'GAGE</p>
          <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#F0F0FF;">${name}</h1>
          <p style="margin:0 0 28px;color:#B8B8D0;font-size:15px;line-height:1.6;">
            La noche terminó, pero lo que pasó se queda. Entra a ver quién conectó con quién,
            los momentos más intensos y todas las fotos de tus invitados.
          </p>
          <a href="${d.directUrl}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:linear-gradient(135deg,#FF2D78,#7B2FBE);color:#fff;font-weight:700;font-size:15px;text-decoration:none;">
            Ver el resumen del evento
          </a>
          <div style="margin:32px auto 0;padding:20px;background:#161625;border-radius:14px;">
            <p style="margin:0 0 8px;color:#8585A8;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;">Tu código de acceso</p>
            <p style="margin:0;font-family:'JetBrains Mono',Menlo,monospace;font-size:30px;font-weight:700;letter-spacing:0.3em;color:#FF2D78;">${escapeHtml(d.code)}</p>
            <p style="margin:12px 0 0;color:#6F6F8C;font-size:12px;line-height:1.5;">
              Entra en <a href="${d.url}" style="color:#B8B8D0;">${escapeHtml(d.url.replace(/^https?:\/\//, ""))}</a> y escribe este código.
              El enlace no caduca.
            </p>
          </div>
          <p style="margin:28px 0 0;color:#44445A;font-size:11px;line-height:1.5;">
            Este resumen contiene nombres y fotos de tus invitados. Compártelo con cuidado.
          </p>
        </div>
      </div>
    </div>
  </body></html>`;
}
