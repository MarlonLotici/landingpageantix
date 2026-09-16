/* ============================================================================
 * ANTIX — Widget de chat do site (fala com a IA Kauana via /api/web-chat).
 * Self-contained: cria botão flutuante + painel + estilos, sem dependências.
 * ⚙️  CONFIGURE as 2 constantes abaixo antes de publicar.
 * ==========================================================================*/
(function () {
  // 🔧 URL do backend (Railway) que expõe POST /api/web-chat.
  const ANTIX_API = 'https://enerzee-sdr-automation-production.up.railway.app';
  // 🔧 WhatsApp da Kauana (só dígitos, com DDI 55). Se o chat não abrir certo, pode ser o 9º
  // dígito — nesse caso troque por 5548998204961.
  const ANTIX_WHATSAPP = '554898204961';

  // sessão persistente por visitante (mantém o histórico entre mensagens)
  let sessionId = localStorage.getItem('antix_chat_sid');
  if (!sessionId) {
    sessionId = 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('antix_chat_sid', sessionId);
  }

  const AMBAR = '#F59E0B';
  const css = `
  #antix-chat-btn{position:fixed;right:20px;bottom:20px;z-index:99998;width:60px;height:60px;border-radius:50%;
    background:linear-gradient(135deg,#D97706,${AMBAR});border:none;cursor:pointer;box-shadow:0 8px 24px rgba(245,158,11,.35);
    display:flex;align-items:center;justify-content:center;font-size:26px;transition:transform .15s}
  #antix-chat-btn:hover{transform:scale(1.08)}
  #antix-chat-panel{position:fixed;right:20px;bottom:92px;z-index:99999;width:360px;max-width:calc(100vw - 32px);
    height:520px;max-height:calc(100vh - 120px);background:#0d0d0f;border:1px solid rgba(255,255,255,.1);
    border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden;
    font-family:'DM Sans',system-ui,sans-serif}
  #antix-chat-panel.open{display:flex}
  .acp-head{padding:14px 16px;background:linear-gradient(135deg,#1a1305,#0d0d0f);border-bottom:1px solid rgba(255,255,255,.06);
    display:flex;align-items:center;gap:10px}
  .acp-ava{width:36px;height:36px;border-radius:50%;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);
    display:flex;align-items:center;justify-content:center;font-weight:900;color:${AMBAR};font-size:15px}
  .acp-title{font-size:14px;font-weight:800;color:#fff;line-height:1.1}
  .acp-sub{font-size:10px;color:#10B981;font-weight:700;display:flex;align-items:center;gap:4px}
  .acp-sub::before{content:'';width:6px;height:6px;border-radius:50%;background:#10B981;box-shadow:0 0 6px #10B981}
  .acp-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.4);font-size:20px;cursor:pointer;line-height:1}
  .acp-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#0a0a0b}
  .acp-msg{max-width:80%;padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.4;white-space:pre-wrap;word-wrap:break-word}
  .acp-ia{align-self:flex-start;background:#1c1c20;color:#eaeaea;border-bottom-left-radius:4px}
  .acp-user{align-self:flex-end;background:linear-gradient(135deg,#D97706,${AMBAR});color:#111;border-bottom-right-radius:4px;font-weight:600}
  .acp-typing{align-self:flex-start;color:rgba(255,255,255,.4);font-size:12px;font-style:italic}
  .acp-wa{margin:0 14px 10px;display:none;text-align:center}
  .acp-wa.show{display:block}
  .acp-wa a{display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#062e12;font-weight:800;font-size:13px;
    text-decoration:none;padding:10px 16px;border-radius:12px;box-shadow:0 6px 18px rgba(37,211,102,.35)}
  .acp-foot{padding:10px 12px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:8px;background:#0d0d0f}
  .acp-foot input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;
    padding:10px 12px;color:#fff;font-size:13px;outline:none;font-family:inherit}
  .acp-foot input:focus{border-color:${AMBAR}}
  .acp-send{background:${AMBAR};border:none;border-radius:12px;width:42px;cursor:pointer;font-size:18px;color:#111;font-weight:900}
  .acp-send:disabled{opacity:.5;cursor:default}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'antix-chat-btn'; btn.innerHTML = '💬'; btn.setAttribute('aria-label', 'Falar com a IA');
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = 'antix-chat-panel';
  panel.innerHTML = `
    <div class="acp-head">
      <div class="acp-ava">K</div>
      <div><div class="acp-title">Kauana · Antix IA</div><div class="acp-sub">online agora</div></div>
      <button class="acp-close" aria-label="Fechar">×</button>
    </div>
    <div class="acp-body" id="acp-body"></div>
    <div class="acp-wa" id="acp-wa">
      <a href="#" target="_blank" rel="noopener">💚 Continuar no WhatsApp</a>
    </div>
    <div class="acp-foot">
      <input id="acp-input" type="text" placeholder="Escreva sua mensagem..." maxlength="800" autocomplete="off" />
      <button class="acp-send" id="acp-send">➤</button>
    </div>`;
  document.body.appendChild(panel);

  const body = panel.querySelector('#acp-body');
  const input = panel.querySelector('#acp-input');
  const sendBtn = panel.querySelector('#acp-send');
  const waBox = panel.querySelector('#acp-wa');
  const waLink = waBox.querySelector('a');
  // 🌉 PONTE: leva o código da sessão pro WhatsApp. O backend detecta o código e transfere
  // TODO o histórico do site pra o WhatsApp — a Kauana continua de onde parou (sem recomeçar).
  const msgHandoff = `Oi! Continuando nossa conversa do site 🐜 (cód: ANTIX-${sessionId})`;
  waLink.href = `https://wa.me/${ANTIX_WHATSAPP}?text=${encodeURIComponent(msgHandoff)}`;

  let aberto = false, enviando = false, saudou = false;

  function addMsg(txt, who) {
    const el = document.createElement('div');
    el.className = 'acp-msg ' + (who === 'user' ? 'acp-user' : 'acp-ia');
    el.textContent = txt;
    body.appendChild(el); body.scrollTop = body.scrollHeight;
    return el;
  }
  function typing(on) {
    let t = body.querySelector('.acp-typing');
    if (on) { if (!t) { t = document.createElement('div'); t.className = 'acp-typing'; t.textContent = 'Kauana está digitando...'; body.appendChild(t); body.scrollTop = body.scrollHeight; } }
    else if (t) t.remove();
  }

  function toggle() {
    aberto = !aberto;
    panel.classList.toggle('open', aberto);
    btn.innerHTML = aberto ? '×' : '💬';
    if (aberto && !saudou) {
      saudou = true;
      addMsg('Oi! Eu sou a Kauana, a IA da Antix 🙂 O que te trouxe até aqui hoje?', 'ia');
      setTimeout(() => input.focus(), 100);
    }
  }
  btn.addEventListener('click', toggle);
  panel.querySelector('.acp-close').addEventListener('click', toggle);

  async function enviar() {
    const texto = input.value.trim();
    if (!texto || enviando) return;
    enviando = true; sendBtn.disabled = true;
    addMsg(texto, 'user'); input.value = ''; typing(true);
    try {
      const resp = await fetch(ANTIX_API + '/api/web-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: texto }),
      });
      const data = await resp.json().catch(() => ({}));
      typing(false);
      if (data.reply) addMsg(data.reply, 'ia');
      else addMsg('Opa, tive uma instabilidade aqui — pode tentar de novo? Ou fala comigo no WhatsApp 👇', 'ia');
      if (data.handoff) waBox.classList.add('show');
    } catch (e) {
      typing(false);
      addMsg('Não consegui responder agora 😕 Me chama no WhatsApp aqui embaixo que eu te atendo!', 'ia');
      waBox.classList.add('show');
    } finally {
      enviando = false; sendBtn.disabled = false; input.focus();
    }
  }
  sendBtn.addEventListener('click', enviar);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') enviar(); });
})();
