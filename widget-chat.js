/* ============================================================================
 * ANTIX — Widget de chat do site (fala com a IA Sofia via /api/web-chat).
 * Self-contained: cria botão flutuante + painel + estilos, sem dependências.
 * Expõe window.antixAbrirChat() — os CTAs do site chamam pra abrir o teste com a IA.
 * ==========================================================================*/
(function () {
  // 🔧 URL do backend (Railway) que expõe POST /api/web-chat.
  const ANTIX_API = 'https://antix.up.railway.app';
  // 🔧 WhatsApp da Sofia (só dígitos, com DDI 55). Se o chat não abrir certo, pode ser o 9º
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
  #antix-chat-btn{position:fixed;right:20px;bottom:20px;z-index:99998;height:56px;padding:0 20px;border-radius:999px;
    background:linear-gradient(135deg,#D97706,${AMBAR});border:none;cursor:pointer;box-shadow:0 8px 28px rgba(245,158,11,.45);
    display:flex;align-items:center;gap:9px;font-size:14px;font-weight:900;color:#111;font-family:'DM Sans',system-ui,sans-serif;
    text-transform:uppercase;letter-spacing:.03em;transition:transform .15s;animation:antixPulse 2.6s infinite}
  #antix-chat-btn:hover{transform:scale(1.05)}
  #antix-chat-btn.aberto{width:56px;padding:0;justify-content:center;animation:none}
  #antix-chat-btn .acp-btn-label{white-space:nowrap}
  #antix-chat-btn.aberto .acp-btn-label{display:none}
  @keyframes antixPulse{0%,100%{box-shadow:0 8px 28px rgba(245,158,11,.45)}50%{box-shadow:0 8px 34px rgba(245,158,11,.75)}}
  #antix-chat-panel{position:fixed;right:20px;bottom:88px;z-index:99999;width:370px;max-width:calc(100vw - 32px);
    height:540px;max-height:calc(100vh - 120px);background:#0d0d0f;border:1px solid rgba(255,255,255,.1);
    border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden;
    font-family:'DM Sans',system-ui,sans-serif}
  #antix-chat-panel.open{display:flex}
  .acp-head{padding:14px 16px;background:linear-gradient(135deg,#1a1305,#0d0d0f);border-bottom:1px solid rgba(255,255,255,.06);
    display:flex;align-items:center;gap:10px;flex-shrink:0}
  .acp-ava{width:36px;height:36px;border-radius:50%;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);
    display:flex;align-items:center;justify-content:center;font-weight:900;color:${AMBAR};font-size:15px;flex-shrink:0}
  .acp-title{font-size:14px;font-weight:800;color:#fff;line-height:1.1}
  .acp-sub{font-size:10px;color:#10B981;font-weight:700;display:flex;align-items:center;gap:4px}
  .acp-sub::before{content:'';width:6px;height:6px;border-radius:50%;background:#10B981;box-shadow:0 0 6px #10B981}
  .acp-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.4);font-size:24px;cursor:pointer;line-height:1;padding:0 4px}
  .acp-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#0a0a0b;min-height:0}
  .acp-msg{max-width:82%;padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.4;white-space:pre-wrap;word-wrap:break-word}
  .acp-ia{align-self:flex-start;background:#1c1c20;color:#eaeaea;border-bottom-left-radius:4px}
  .acp-user{align-self:flex-end;background:linear-gradient(135deg,#D97706,${AMBAR});color:#111;border-bottom-right-radius:4px;font-weight:600}
  .acp-typing{align-self:flex-start;color:rgba(255,255,255,.4);font-size:12px;font-style:italic}
  .acp-wa{margin:0 14px 10px;display:none;text-align:center;flex-shrink:0}
  .acp-wa.show{display:block}
  .acp-wa a{display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#062e12;font-weight:800;font-size:13px;
    text-decoration:none;padding:10px 16px;border-radius:12px;box-shadow:0 6px 18px rgba(37,211,102,.35)}
  .acp-foot{padding:10px 12px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:8px;background:#0d0d0f;flex-shrink:0}
  .acp-foot input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;
    padding:11px 12px;color:#fff;font-size:16px;outline:none;font-family:inherit}
  .acp-foot input:focus{border-color:${AMBAR}}
  .acp-send{background:${AMBAR};border:none;border-radius:12px;width:44px;cursor:pointer;font-size:18px;color:#111;font-weight:900;flex-shrink:0}
  .acp-send:disabled{opacity:.5;cursor:default}
  .acp-privacy{padding:6px 12px 10px;text-align:center;font-size:10px;color:rgba(255,255,255,.3);flex-shrink:0;background:#0d0d0f}
  .acp-privacy a{color:rgba(255,255,255,.45);text-decoration:underline}
  /* 🔴 Badge "1" de notificação no launcher (some quando o chat abre) */
  #antix-chat-btn .acp-badge{position:absolute;top:-5px;right:-3px;min-width:19px;height:19px;padding:0 5px;border-radius:999px;
    background:#25D366;color:#fff;font-size:11px;font-weight:900;display:none;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,.45);border:2px solid #0a0a0b}
  #antix-chat-btn.tem-badge .acp-badge{display:flex}
  #antix-chat-btn.aberto .acp-badge{display:none}
  /* 💬 Teaser proativo (notificação da Sofia) */
  #antix-teaser{position:fixed;right:20px;bottom:88px;z-index:99997;width:272px;max-width:calc(100vw - 40px);
    background:#0d0d0f;border:1px solid rgba(255,255,255,.1);border-radius:16px 16px 4px 16px;
    box-shadow:0 14px 42px rgba(0,0,0,.55);display:none;overflow:hidden;cursor:pointer;
    font-family:'DM Sans',system-ui,sans-serif}
  #antix-teaser.show{display:block;animation:antixTeaserIn .45s cubic-bezier(.16,1,.3,1)}
  @keyframes antixTeaserIn{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}
  #antix-teaser .act-top{display:flex;align-items:center;gap:8px;padding:10px 12px;
    background:linear-gradient(135deg,#1a1305,#0d0d0f);border-bottom:1px solid rgba(255,255,255,.06)}
  #antix-teaser .act-ava{width:30px;height:30px;border-radius:50%;background:rgba(245,158,11,.15);
    border:1px solid rgba(245,158,11,.3);display:flex;align-items:center;justify-content:center;font-weight:900;color:${AMBAR};font-size:13px;flex-shrink:0}
  #antix-teaser .act-name{font-size:12px;font-weight:800;color:#fff;line-height:1.15}
  #antix-teaser .act-on{font-size:9px;color:#25D366;font-weight:700}
  #antix-teaser .act-x{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.35);font-size:18px;line-height:1;cursor:pointer;padding:2px 6px}
  #antix-teaser .act-body{padding:11px 13px;font-size:13px;line-height:1.45;color:#eaeaea}
  #antix-teaser .act-body b{color:#fff}
  #antix-teaser .act-cta{margin:0 13px 12px;text-align:center;background:#25D366;color:#062e12;font-weight:800;font-size:12px;padding:9px;border-radius:10px}
  /* 📱 Mobile: tela cheia + acompanha o teclado (visualViewport) pra o input nunca ficar escondido */
  @media (max-width:480px){
    #antix-chat-panel{right:0;left:0;top:0;bottom:auto;width:100%;max-width:100%;height:100dvh;max-height:none;border-radius:0}
    #antix-chat-btn{right:14px;bottom:14px;height:50px;padding:0 16px;font-size:13px}
    #antix-teaser{right:14px;bottom:74px;width:248px}
  }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'antix-chat-btn';
  btn.innerHTML = '<span>💬</span><span class="acp-btn-label">Falar com a Sofia</span><span class="acp-badge" id="acp-badge">1</span>';
  btn.setAttribute('aria-label', 'Falar com a Sofia');
  document.body.appendChild(btn);

  // 💬 Teaser proativo: aparece sozinho poucos segundos após a carga pra CONVIDAR a conversa.
  // É a diferença entre "visitante passa batido" e "visitante começa a falar com a Sofia".
  // Cara de notificação de WhatsApp (verde, "online agora") pra dar familiaridade/confiança.
  const teaser = document.createElement('div');
  teaser.id = 'antix-teaser';
  teaser.innerHTML = `
    <div class="act-top">
      <div class="act-ava">S</div>
      <div><div class="act-name">Sofia · Antix</div><div class="act-on">● online agora</div></div>
      <button class="act-x" aria-label="Fechar">×</button>
    </div>
    <div class="act-body">Oi! 👋 Posso te mostrar como funciona ou já te ajudar a <b>agendar</b> — leva 1 minutinho 😊</div>
    <div class="act-cta">💬 Conversar agora</div>`;
  document.body.appendChild(teaser);

  const panel = document.createElement('div');
  panel.id = 'antix-chat-panel';
  panel.innerHTML = `
    <div class="acp-head">
      <div class="acp-ava">S</div>
      <div><div class="acp-title">Sofia · IA da Antix</div><div class="acp-sub">online agora</div></div>
      <button class="acp-close" aria-label="Fechar">×</button>
    </div>
    <div class="acp-body" id="acp-body"></div>
    <div class="acp-wa" id="acp-wa">
      <a href="#" target="_blank" rel="noopener">💚 Continuar no WhatsApp</a>
    </div>
    <div class="acp-foot">
      <input id="acp-input" type="text" placeholder="Escreva sua mensagem..." maxlength="800" autocomplete="off" />
      <button class="acp-send" id="acp-send">➤</button>
    </div>
    <div class="acp-privacy">Você está conversando com uma IA. <a href="privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a></div>`;
  document.body.appendChild(panel);

  const body = panel.querySelector('#acp-body');
  const input = panel.querySelector('#acp-input');
  const sendBtn = panel.querySelector('#acp-send');
  const waBox = panel.querySelector('#acp-wa');
  const waLink = waBox.querySelector('a');
  // 🌉 PONTE: leva o código da sessão pro WhatsApp. O backend detecta o código e transfere
  // TODO o histórico do site pra o WhatsApp — a Sofia continua de onde parou (sem recomeçar).
  const msgHandoff = `Oi! Continuando nossa conversa do site 🐜 (cód: ANTIX-${sessionId})`;
  waLink.href = `https://wa.me/${ANTIX_WHATSAPP}?text=${encodeURIComponent(msgHandoff)}`;

  let aberto = false, enviando = false, saudou = false, scrollLockY = 0, vpInterval = null, _lastVpH = -1;

  // 📱 Mantém o painel do tamanho da área VISÍVEL (acima do teclado) no mobile — assim a
  // linha de digitar nunca fica escondida atrás do teclado.
  const ehMobile = () => window.matchMedia('(max-width: 480px)').matches;
  // Ancora o painel na área REALMENTE visível (acima do teclado). Só escreve quando a altura muda,
  // pra o polling (ver abrir()) não causar flicker.
  function ajustarViewport() {
    const vv = window.visualViewport;
    if (aberto && vv && ehMobile()) {
      const h = Math.round(vv.height);
      if (h === _lastVpH) return;
      _lastVpH = h;
      panel.style.height = h + 'px';
      panel.style.width  = Math.round(vv.width) + 'px';
      panel.style.top    = (vv.offsetTop || 0) + 'px';
      panel.style.left   = (vv.offsetLeft || 0) + 'px';
      panel.style.right  = 'auto';
      panel.style.bottom = 'auto';
      body.scrollTop = body.scrollHeight;
    } else {
      _lastVpH = -1;
      panel.style.height = ''; panel.style.width = ''; panel.style.top = ''; panel.style.left = ''; panel.style.right = ''; panel.style.bottom = '';
    }
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', ajustarViewport);
    window.visualViewport.addEventListener('scroll', ajustarViewport);
  }
  window.addEventListener('resize', ajustarViewport);
  window.addEventListener('orientationchange', () => setTimeout(ajustarViewport, 300));
  // iOS às vezes só reporta o teclado alguns ms depois do focus — reajusta em rajada.
  input.addEventListener('focus', () => [0, 120, 320, 650, 1000].forEach(ms => setTimeout(ajustarViewport, ms)));
  input.addEventListener('blur', () => setTimeout(ajustarViewport, 120));

  function addMsg(txt, who) {
    const el = document.createElement('div');
    el.className = 'acp-msg ' + (who === 'user' ? 'acp-user' : 'acp-ia');
    el.textContent = txt;
    body.appendChild(el); body.scrollTop = body.scrollHeight;
    return el;
  }
  function typing(on) {
    let t = body.querySelector('.acp-typing');
    if (on) { if (!t) { t = document.createElement('div'); t.className = 'acp-typing'; t.textContent = 'Sofia está digitando...'; body.appendChild(t); body.scrollTop = body.scrollHeight; } }
    else if (t) t.remove();
  }

  function abrir() {
    if (aberto) return;
    aberto = true;
    esconderTeaser(true); // abriu o chat → tira o teaser e marca como visto
    // 📊 Conversão: registra a abertura do chat (o CTA-chave "Testar a IA") no GA4/Pixel, se ativos.
    try {
      if (typeof window.gtag === 'function') window.gtag('event', 'testar_ia_aberto', { event_category: 'engajamento' });
      if (typeof window.fbq === 'function') window.fbq('trackCustom', 'TestarIA');
    } catch (e) {}
    // 🔒 Scroll-lock REAL no mobile: overflow:hidden não impede o iOS de rolar a página quando o
    // input recebe foco (é isso que empurra a barra pra trás do teclado). Travar o body com
    // position:fixed impede esse scroll — o painel fica colado na área visível acima do teclado.
    if (ehMobile()) {
      scrollLockY = window.scrollY || window.pageYOffset || 0;
      const b = document.body;
      b.style.position = 'fixed'; b.style.top = -scrollLockY + 'px';
      b.style.left = '0'; b.style.right = '0'; b.style.width = '100%'; b.style.overflow = 'hidden';
      // 🔁 À prova de evento: reancora em loop curto enquanto o chat está aberto — cobre navegadores
      // que não disparam o resize do visualViewport de forma confiável quando o teclado sobe.
      if (!vpInterval) vpInterval = setInterval(ajustarViewport, 250);
    }
    panel.classList.add('open'); btn.classList.add('aberto'); btn.querySelector('span').textContent = '×';
    ajustarViewport();
    if (!saudou) {
      saudou = true;
      addMsg('Oi! Eu sou a Sofia, a IA da Antix 🤖 Pode testar comigo à vontade — inclusive é ela que agenda sua conversa com o time. O que você quer resolver hoje?', 'ia');
    }
    setTimeout(() => { input.focus(); body.scrollTop = body.scrollHeight; }, 120);
  }
  function fechar() {
    aberto = false;
    if (vpInterval) { clearInterval(vpInterval); vpInterval = null; }
    _lastVpH = -1;
    panel.classList.remove('open'); btn.classList.remove('aberto'); btn.querySelector('span').textContent = '💬';
    panel.style.height = ''; panel.style.width = ''; panel.style.top = ''; panel.style.left = ''; panel.style.right = ''; panel.style.bottom = '';
    // Destrava o body e devolve o scroll pra onde estava.
    const b = document.body;
    b.style.position = ''; b.style.top = ''; b.style.left = ''; b.style.right = ''; b.style.width = ''; b.style.overflow = '';
    document.documentElement.style.overflow = '';
    if (scrollLockY) { window.scrollTo(0, scrollLockY); scrollLockY = 0; }
  }
  function toggle() { aberto ? fechar() : abrir(); }

  btn.addEventListener('click', toggle);
  panel.querySelector('.acp-close').addEventListener('click', fechar);
  // 🔗 CTAs do site abrem o teste com a IA: <a onclick="antixAbrirChat();return false;">
  window.antixAbrirChat = abrir;

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

  // ── 🔔 SOM DE NOTIFICAÇÃO (WebAudio, sem arquivo externo) ──────────────────────────────
  // ⚠️ IMPORTANTE: navegadores BLOQUEIAM áudio automático até o visitante interagir com a página
  // (política de autoplay — vale pra quase todo mobile). Por isso só "armamos" o som depois do
  // 1º gesto (toque/scroll/clique). Em alguns celulares ele ainda não toca — por isso o BADGE e a
  // animação do teaser são o convite principal; o som é um reforço, não a aposta.
  let _audioArmado = false, _ac = null;
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, () => { _audioArmado = true; }, { once: true, passive: true }));
  function tocarPop() {
    if (!_audioArmado) return;
    try {
      _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
      if (_ac.state === 'suspended') _ac.resume();
      [880, 1245].forEach((f, i) => {
        const o = _ac.createOscillator(), g = _ac.createGain();
        o.type = 'sine'; o.frequency.value = f;
        o.connect(g); g.connect(_ac.destination);
        const t = _ac.currentTime + i * 0.12;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.17, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.start(t); o.stop(t + 0.22);
      });
    } catch (e) { /* som é opcional — nunca pode quebrar o widget */ }
  }

  // ── 💬 TEASER PROATIVO ─────────────────────────────────────────────────────────────────
  // Aparece 1x por sessão, alguns segundos depois da carga. É o maior gatilho de conversão:
  // convida sem sequestrar (não abre o chat inteiro à força, que no mobile afugenta).
  function mostrarTeaser() {
    if (aberto || sessionStorage.getItem('antix_teaser_visto')) return;
    teaser.classList.add('show');
    btn.classList.add('tem-badge');
    tocarPop();
  }
  function esconderTeaser(marcar) {
    teaser.classList.remove('show');
    btn.classList.remove('tem-badge');
    if (marcar) { try { sessionStorage.setItem('antix_teaser_visto', '1'); } catch (e) {} }
  }
  teaser.addEventListener('click', (e) => {
    if (e.target.closest('.act-x')) { e.stopPropagation(); esconderTeaser(true); return; }
    esconderTeaser(true); abrir();
  });
  // Dispara o teaser ~7s após carregar (tempo de ler o hero), só se ainda não viu nesta sessão.
  if (!sessionStorage.getItem('antix_teaser_visto')) {
    setTimeout(mostrarTeaser, 7000);
  }
})();
