// V1.7.44 (pedido de Darío, 20/11/2026): la app se actualiza SOLA. Cada 5 minutos revisa version.json;
// si hay versión nueva y la persona está trabajando, no la interrumpe: se pone sola cuando sale (cierra sesión,
// se cierra por inactividad) o cuando está en la pantalla de entrada. «Forzar versión nueva» (DC Soporte)
// recarga en 3 segundos sin cerrar la sesión.
(function () {
  const A = (window.DC_ACT = { nueva: null, enEntrada: false, avisado: false });
  const actual = () => { const m = /(\d+\.\d+\.\d+)/.exec((window.DC_DIAG && window.DC_DIAG.version) || ""); return m ? m[1] : null; };
  const mayor = (a, b) => { const x = a.split(".").map(Number), y = b.split(".").map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
  function recargar() {
    const u = location.pathname + "?r=" + Date.now() + location.hash;
    try { location.replace(u); } catch (e) { location.reload(); }
  }
  function banda(texto, conRueda) {
    let b = document.getElementById("dc-act");
    if (!b) {
      b = document.createElement("div"); b.id = "dc-act";
      b.style.cssText = "position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:99999;max-width:min(92vw,640px);background:#0f1e3d;color:#fff;" +
        "border:1px solid rgba(231,185,74,.6);border-radius:12px;padding:11px 16px;font:600 13.5px/1.4 Figtree,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);display:flex;gap:12px;align-items:center";
      document.body.appendChild(b);
    }
    b.innerHTML = "";
    const t = document.createElement("span"); t.style.flex = "1"; t.innerHTML = texto; b.appendChild(t);
    if (!conRueda) {
      const x = document.createElement("button"); x.textContent = "Entendido";
      x.style.cssText = "background:transparent;border:0;color:#e7b94a;font:700 13px Figtree,system-ui,sans-serif;cursor:pointer;padding:4px 6px";
      x.onclick = () => b.remove(); b.appendChild(x);
    }
  }
  async function revisar() {
    const v = actual(); if (!v) return;
    try {
      const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      if (j && j.version && mayor(String(j.version), v)) {
        A.nueva = String(j.version);
        if (A.enEntrada) return recargar();
        if (!A.avisado) { A.avisado = true; banda("Hay una versión nueva (<b style='color:#e7b94a'>" + A.nueva + "</b>). Se pondrá sola cuando salga de la app; no tiene que hacer nada."); }
      }
    } catch (e) {}
  }
  /** La app avisa si está en la pantalla de entrada (al cerrar sesión también llega aquí). */
  A.pantallaEntrada = function (si) { A.enEntrada = !!si; if (si && A.nueva) recargar(); else if (si) revisar(); };
  /** «Forzar versión nueva» desde DC Soporte. */
  A.forzar = function () { banda("Actualizando a la versión nueva…", true); setTimeout(recargar, 3000); };
  setTimeout(revisar, 60000);
  setInterval(revisar, 300000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) revisar(); });
})();
