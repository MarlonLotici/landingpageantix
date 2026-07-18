/**
 * PULSE IA — script.js
 * Silicon Valley-grade JS for the new futuristic landing page
 *
 * Modules:
 *  1. Utils
 *  2. Canvas Particle Network (hero)
 *  3. Mini Particle Canvas (CTA section)
 *  4. Custom Cursor (touch-aware)
 *  5. Nav — Progress Bar + Active Section
 *  6. Smooth Scroll with nav offset
 *  7. Scroll Reveal with stagger
 *  8. Scramble Counters (hero stats + metrics)
 *  9. Terminal Widget (live data simulation)
 * 10. WhatsApp Chat Loop with Typing Indicator
 * 11. Magnetic Buttons
 * 12. Exit Intent Toast
 * 13. DC Fill bar observer
 */

'use strict';

// ─── 1. UTILS ────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

// ─── 2. HERO CANVAS — PARTICLE NEURAL NETWORK ────────────────

// ─── 2. HERO CANVAS — ENXAME NEURAL (ANTix) ────────────────

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const parent = canvas.parentElement;
    W = canvas.width  = parent.clientWidth;
    H = canvas.height = parent.clientHeight;
  }
  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  }, { passive: true });

  // Paleta de Cores Laranja/Âmbar da Antix
  const C = {
    orange: [255, 69, 0],  // Laranja Agressivo
    amber:  [245, 158, 11] // Âmbar Premium
  };

  class Ant {
    constructor() { this.reset(true); }

    reset(initial) {
      this.x = rand(0, W);
      this.y = initial ? rand(0, H) : rand(0, H);
      this.angle = rand(0, Math.PI * 2);
      this.speed = rand(0.5, 1.0); // Passeio calmo
      this.wander = 0;
      this.type = Math.random() > 0.7 ? 'amber' : 'orange';
    }

    update(mx, my) {
      this.wander += rand(-0.15, 0.15); // Viradas suaves
      this.angle += this.wander * 0.05;
      this.wander *= 0.92;

      const dx = mx - this.x;
      const dy = my - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Curiosidade tecnológica (interação mais calma)
      if(dist < 180 && dist > 0) {
        const targetAngle = Math.atan2(dy, dx);
        const diff = targetAngle - this.angle;
        this.angle += Math.sin(diff) * 0.02; // Virada elegante
        this.speed = lerp(this.speed, 1.4, 0.015); // Aceleração suave
      } else {
        this.speed = lerp(this.speed, 0.7, 0.015); // Velocidade de cruzeiro
      }

      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      if(this.x < -20) this.x = W+20;
      if(this.x > W+20) this.x = -20;
      if(this.y < -20) this.y = H+20;
      if(this.y > H+20) this.y = -20;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      
      const [r, g, b] = this.type === 'orange' ? C.orange : C.amber;
      const alpha = this.speed > 1.0 ? 0.9 : 0.5;

      ctx.fillStyle = `rgba(${r},${g},${b}, ${alpha})`;
      ctx.strokeStyle = `rgba(${r},${g},${b}, ${alpha * 0.7})`;
      ctx.lineWidth = 1.2; // Pernas mais grossas e visíveis
      
      // 1. Abdômen (segmento traseiro maior)
      ctx.beginPath(); ctx.ellipse(-9, 0, 7.5, 5.7, 0, 0, Math.PI*2); ctx.fill(); 

      // 2. Tórax (segmento central onde saem as patas)
      ctx.beginPath(); ctx.ellipse(0, 0, 4.5, 3.7, 0, 0, Math.PI*2); ctx.fill();

      // 3. Cabeça (segmento dianteiro)
      ctx.beginPath(); ctx.ellipse(7.5, 0, 4.5, 4.8, 0, 0, Math.PI*2); ctx.fill(); 

      // 4. As Pernas Táticas (6 patas articuladas)
      ctx.beginPath();
      // Patas direitas
      ctx.moveTo(0, 0); ctx.lineTo(-6, 9);  ctx.lineTo(-9, 13.5);
      ctx.moveTo(0, 0); ctx.lineTo(0, 10.5); ctx.lineTo(-1.5, 15);
      ctx.moveTo(0, 0); ctx.lineTo(6, 9);   ctx.lineTo(9, 12);
      // Patas esquerdas
      ctx.moveTo(0, 0); ctx.lineTo(-6, -9); ctx.lineTo(-9, -13.5);
      ctx.moveTo(0, 0); ctx.lineTo(0, -10.5); ctx.lineTo(-1.5, -15);
      ctx.moveTo(0, 0); ctx.lineTo(6, -9);  ctx.lineTo(9, -12);
      ctx.stroke();

      // 5. As Antenas (visíveis e imponentes)
      ctx.beginPath();
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = `rgba(${r},${g},${b}, ${alpha * 0.9})`;
      // Esquerda
      ctx.moveTo(9, -2.2); ctx.quadraticCurveTo(16.5, -7.5, 24, -4.5);
      // Direita
      ctx.moveTo(9, 2.2);  ctx.quadraticCurveTo(16.5, 7.5, 24, 4.5);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Quantidade de formigas proporcional à tela
  const COUNT = Math.min(100, Math.floor((W * H) / 9000));
  const ants = Array.from({ length: COUNT }, () => new Ant());
  let mx = -999, my = -999;

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  });

  let raf;
  let paused = false;
  function frame() {
    if (paused) return;
    ctx.clearRect(0, 0, W, H);
    ants.forEach(a => {
      a.update(mx, my);
      a.draw(ctx);
    });
    raf = requestAnimationFrame(frame);
  }
  frame();

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) frame();
  });
}

// ─── 3. CTA MINI CANVAS ──────────────────────────────────────

function initCtaCanvas() {
  const canvas = document.getElementById('cta-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const parent = canvas.parentElement;
    W = canvas.width  = parent.clientWidth;
    H = canvas.height = parent.clientHeight;
  }
  resize();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  }, { passive: true });

  const particles = Array.from({ length: 40 }, () => ({
    x: rand(0, W), y: rand(0, H),
    vx: rand(-.2, .2), vy: rand(-.15, .15),
    r: rand(.8, 2),
    t: rand(0, Math.PI * 2),
    ts: rand(.01, .025),
  }));

  function frame() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      p.t += p.ts;
      const a = (.3 + (Math.sin(p.t) + 1) / 2 * .5);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${a})`;
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
}

// ─── 4. CUSTOM CURSOR ────────────────────────────────────────

function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Disable on touch devices
  if (window.matchMedia('(hover: none)').matches) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mx = 0, my = 0, rx = 0, ry = 0;
  let visible = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left    = (mx - 5) + 'px';
    dot.style.top     = (my - 5) + 'px';
    if (!visible) {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
      visible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
    visible = false;
  });

  function animateRing() {
    rx = lerp(rx, mx - 17, 0.13);
    ry = lerp(ry, my - 17, 0.13);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform         = 'scale(0)';
      ring.style.width            = '52px';
      ring.style.height           = '52px';
      ring.style.borderColor      = 'rgba(34,211,238,0.7)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform         = 'scale(1)';
      ring.style.width            = '34px';
      ring.style.height           = '34px';
      ring.style.borderColor      = 'rgba(167,139,250,0.45)';
    });
  });
}

// ─── 5. NAV — PROGRESS + ACTIVE SECTION ──────────────────────

function initNav() {
  const nav  = document.querySelector('nav');
  const prog = document.getElementById('nav-progress');
  if (!nav) return;

  let ticking = false;

  function update() {
    const scrollTop = window.scrollY;
    const docH      = document.documentElement.scrollHeight - window.innerHeight;
    const pct       = docH > 0 ? (scrollTop / docH) * 100 : 0;

    if (prog) prog.style.width = pct + '%';

    nav.style.boxShadow = scrollTop > 30
      ? '0 4px 40px rgba(0,0,0,0.5)'
      : 'none';

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (scrollTop >= s.offsetTop - 100) current = s.id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      const active = a.getAttribute('href') === `#${current}`;
      a.style.color = active ? 'var(--vl)' : '';
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

// ─── 6. SMOOTH SCROLL ────────────────────────────────────────

function initSmoothScroll() {
  const OFFSET = 72;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return; // skip empty anchors
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: Math.max(0, target.offsetTop - OFFSET), behavior: 'smooth' });
    });
  });
}

// ─── 7. SCROLL REVEAL WITH STAGGER ───────────────────────────

function initReveal() {
  const items = document.querySelectorAll('.reveal');

  // Stagger siblings
  const parentMap = new Map();
  items.forEach(el => {
    const p = el.parentElement;
    if (!parentMap.has(p)) parentMap.set(p, []);
    parentMap.get(p).push(el);
  });
  parentMap.forEach(children => {
    if (children.length > 1) {
      children.forEach((el, i) => { el.style.transitionDelay = (i * 100) + 'ms'; });
    }
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });

  items.forEach(r => obs.observe(r));
  return obs;
}

// ─── 8. SCRAMBLE COUNTERS ────────────────────────────────────
// Numbers scramble with random chars before revealing the real value

const CHARS = '0123456789';

function scrambleCounter(el, target, prefix, suffix, duration = 1600) {
  if (el._scrambeling) return;
  el._scrambeling = true;

  const startTime = performance.now();

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutQuart(progress);

    if (progress < 0.7) {
      // Scramble phase — random digits
      const scrambled = Array.from({ length: String(Math.floor(target)).length }, () =>
        CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join('');
      el.textContent = prefix + scrambled + suffix;
    } else {
      // Settle phase — count up to target
      const val = Math.floor(eased * target);
      el.textContent = prefix + val.toLocaleString('pt-BR') + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = prefix + target.toLocaleString('pt-BR') + suffix;
      el._scrambeling = false;
    }
  }

  requestAnimationFrame(tick);
}

function initCounters() {
  // Hero stats
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    let done = false;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || done) return;
        done = true;
        document.querySelectorAll('.hero-stats .stat-n').forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          if (!isNaN(target)) scrambleCounter(el, target, prefix, suffix);
        });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    obs.observe(heroStats);
  }

  // Metric section
  const metricas = document.querySelector('.metricas');
  if (metricas) {
    let done = false;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || done) return;
        done = true;
        document.querySelectorAll('.m-n').forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          if (!isNaN(target)) scrambleCounter(el, target, prefix, suffix);
        });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    obs.observe(metricas);
  }
}

// ─── 9. TERMINAL WIDGET ──────────────────────────────────────

function initTerminal() {
  const timerEl   = document.getElementById('term-timer');
  const dispEl    = document.getElementById('term-dispatches');
  const respEl    = document.getElementById('term-resp');
  const schedEl   = document.getElementById('term-sched');
  const feedEl    = document.getElementById('term-feed');
  if (!timerEl) return;

  // Countdown timer loops 0–179 (3 min max)
  let secs = 134;
  const timerInterval = setInterval(() => {
    if (document.hidden) return;
    secs = (secs - 1 + 180) % 180;
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);

  // Gently increment dispatch counter
  let dispatches = 94, resp = 17, sched = 4;
  const incInterval = setInterval(() => {
    if (document.hidden) return;
    if (dispatches < 114) {
      dispatches++;
      dispEl.textContent = dispatches;
    }
    if (Math.random() > 0.7 && resp < 22) {
      resp++;
      if (respEl) respEl.textContent = resp;
    }
    if (Math.random() > 0.92 && sched < 7) {
      sched++;
      if (schedEl) schedEl.textContent = sched;
    }
    if (dispatches >= 114) clearInterval(incInterval);
  }, 800);

  
  // Activity feed - Linguagem de Operação Antix
  const activities = [
    ['Bar do Gugu',        'alvo localizado ◎', 'v'],
    ['Auto Peças Lima',    'incursão enviada ↗', 'c'],
    ['Padaria Bela Vista', 'agendamento ✓',   'g'],
    ['Clínica São Luís',   'sem resposta —',  'x'],
    ['Academia FitBody',   'SPIN ativado ⚡', 'am'], // Nova cor (ambar)
    ['Restaurante Dom',    'objeção superada ↩', 'c'],
    ['Farmácia Saúde+',    'alvo localizado ◎', 'v'],
    ['Supermercado Rex',   'incursão enviada ↗', 'c'],
    ['Loja Roupas M',      'lead descartado —', 'x'],
    ['Oficina Master',     'agendamento ✓',   'g'],
  ];
  let feedIdx = activities.length; // Start at end so we don't repeat initial items

  function addFeedItem() {
    const [name, status, cls] = activities[feedIdx % activities.length];
    feedIdx++;

    // Remove excess BEFORE adding (synchronous — no setTimeout race)
    while (feedEl.children.length >= 4) {
      feedEl.removeChild(feedEl.lastChild);
    }

    const item = document.createElement('div');
    item.className = 'feed-item';
    item.style.cssText = 'opacity:0; transform:translateX(-6px); transition:all .3s ease;';
    item.innerHTML = `<span class="feed-name">${name}</span><span class="feed-status ${cls}">${status}</span>`;
    feedEl.insertBefore(item, feedEl.firstChild);

    requestAnimationFrame(() => {
      item.style.opacity   = '1';
      item.style.transform = 'translateX(0)';
    });
  }

  setInterval(() => {
    if (document.hidden) return;
    addFeedItem();
  }, 3200);
}

// ─── 10. WHATSAPP CHAT LOOP ───────────────────────────────────

function initChat() {
  const demoSection = document.getElementById('demo');
  const chatArea    = document.getElementById('chat-area');
  if (!demoSection || !chatArea) return;

  const TYPING_MS = 1100;
  const LOOP_PAUSE = 3800;

  const messages = [
    { text: 'Opa João! Sou o Marlon, consultor de energia. Pergunta direta: o <b>Bar do João</b> já tem algum desconto fixo na conta de luz todo mês?', type: 'in',  delay: 400  },
    { text: 'Não, pago normal pela Energisa mesmo',                                                                                                     type: 'out', delay: 2100 },
    { text: 'É exatamente esse caso que a gente resolve. Até 25% de desconto fixo todo mês — zero obra, zero investimento.',                            type: 'in',  delay: 3600 },
    { text: 'Quanto sai a conta de luz aí por mês em média?',                                                                                           type: 'in',  delay: 5300 },
    { text: 'uns R$ 1.200',                                                                                                                              type: 'out', delay: 6700 },
    { text: 'São R$300 que poderiam ficar no caixa todo mês. Em um ano, quase R$3.600 — sem mudar nada na operação.',                                   type: 'in',  delay: 8200 },
    { text: 'São só 20 min de consultoria pra mostrar o gráfico exato com os dados do Bar do João. Fica melhor amanhã de manhã ou à tarde? ☀️',         type: 'in',  delay: 10400 },
  ];

  let timeouts = [];
  const addTimeout = (fn, ms) => timeouts.push(setTimeout(fn, ms));
  const clearAll   = ()       => { timeouts.forEach(clearTimeout); timeouts = []; };

  // Scroll suave DENTRO do chat — só quando o conteúdo transbordar
  function scrollChat(delay = 0) {
    setTimeout(() => {
      // Só rola se houver conteúdo além da altura visível
      if (chatArea.scrollHeight > chatArea.clientHeight + 10) {
        chatArea.scrollTo({
          top: chatArea.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, delay);
  }

  // Tempo de leitura estimado: ~150 palavras/min, mínimo 800ms
  function readTime(text) {
    const words = text.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return Math.max(800, Math.round((words / 150) * 60000));
  }

  function showEl(el) {
    requestAnimationFrame(() => {
      el.style.transition = 'opacity .35s ease, transform .35s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    });
    // Scroll após a transição de entrada terminar (350ms)
    scrollChat(400);
  }

  function makeTyping() {
    const el = document.createElement('div');
    el.className = 'bubble bubble-in';
    el.style.cssText = 'opacity:0;transform:translateY(8px);display:flex;gap:4px;align-items:center;padding:11px 14px;';
    el.innerHTML = `
      <span style="width:6px;height:6px;border-radius:50%;background:var(--gray);animation:tDot 1.1s ease-in-out infinite;"></span>
      <span style="width:6px;height:6px;border-radius:50%;background:var(--gray);animation:tDot 1.1s ease-in-out .18s infinite;"></span>
      <span style="width:6px;height:6px;border-radius:50%;background:var(--gray);animation:tDot 1.1s ease-in-out .36s infinite;"></span>
    `;
    return el;
  }

  // Inject typing keyframe once
  if (!document.getElementById('tDot-style')) {
    const s = document.createElement('style');
    s.id = 'tDot-style';
    s.textContent = '@keyframes tDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}';
    document.head.appendChild(s);
  }

  function play() {
    chatArea.innerHTML = '';
    chatArea.scrollTop = 0;

    messages.forEach(msg => {
      if (msg.type === 'out') {
        addTimeout(() => {
          const b = document.createElement('div');
          b.className = 'bubble bubble-out';
          b.style.cssText = 'opacity:0;transform:translateY(8px);';
          b.innerHTML = msg.text;
          chatArea.appendChild(b);
          showEl(b);
        }, msg.delay);
      } else {
        let typingEl = null;

        addTimeout(() => {
          typingEl = makeTyping();
          chatArea.appendChild(typingEl);
          showEl(typingEl);
        }, msg.delay);

        addTimeout(() => {
          if (!typingEl) return;
          typingEl.style.transition = 'opacity .25s';
          typingEl.style.opacity    = '0';
          const bubble = document.createElement('div');
          bubble.className = 'bubble bubble-in';
          bubble.style.cssText = 'opacity:0;transform:translateY(8px);';
          bubble.innerHTML = msg.text;
          setTimeout(() => {
            if (typingEl && typingEl.parentNode) typingEl.remove();
            chatArea.appendChild(bubble);
            showEl(bubble);
          }, 280);
        }, msg.delay + TYPING_MS);
      }
    });

    const totalDur = messages[messages.length - 1].delay + TYPING_MS + LOOP_PAUSE;
    addTimeout(() => {
      chatArea.querySelectorAll('.bubble').forEach(b => {
        b.style.transition = 'opacity .5s';
        b.style.opacity    = '0';
      });
      setTimeout(() => play(), 600);
    }, totalDur);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        play();
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });

  obs.observe(demoSection);
}

// ─── 11. MAGNETIC BUTTONS ────────────────────────────────────

function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    let rect, animId;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    btn.addEventListener('mouseenter', () => {
      rect = btn.getBoundingClientRect();
      function animate() {
        cx = lerp(cx, tx, 0.14);
        cy = lerp(cy, ty, 0.14);
        btn.style.transform = `translate(${cx}px, ${cy}px)`;
        animId = requestAnimationFrame(animate);
      }
      animate();
    });

    btn.addEventListener('mousemove', e => {
      rect = btn.getBoundingClientRect();
      tx = (e.clientX - rect.left - rect.width  / 2) * 0.28;
      ty = (e.clientY - rect.top  - rect.height / 2) * 0.28;
    });

    btn.addEventListener('mouseleave', () => {
      cancelAnimationFrame(animId);
      function returnHome() {
        cx = lerp(cx, 0, 0.18);
        cy = lerp(cy, 0, 0.18);
        btn.style.transform = `translate(${cx}px, ${cy}px)`;
        if (Math.abs(cx) > 0.05 || Math.abs(cy) > 0.05) {
          animId = requestAnimationFrame(returnHome);
        } else {
          btn.style.transform = '';
        }
      }
      returnHome();
      tx = 0; ty = 0;
    });
  });
}

// ─── 12. DC FILL BAR ─────────────────────────────────────────

function initDcFill() {
  const fill = document.getElementById('dc-fill');
  if (!fill) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        fill.style.width = '82%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  obs.observe(fill.parentElement);
}

// ─── 13. EXIT INTENT TOAST ───────────────────────────────────

function initExitToast() {
  // Não incomoda de novo se a pessoa já fechou nesta sessão
  if (sessionStorage.getItem('antix-toast-dismissed')) return;

  let shown = false, dismissed = false;

  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:24px; left:50%; z-index:600;
    transform:translateX(-50%) translateY(140px);
    background:rgba(10,10,10,.92); backdrop-filter:blur(20px) saturate(140%);
    border:1px solid rgba(255,140,0,.28);
    border-radius:14px; padding:20px 22px;
    display:flex; align-items:center; gap:18px;
    transition:transform .55s cubic-bezier(.16,1,.3,1), opacity .45s;
    opacity:0; box-shadow:0 24px 70px rgba(0,0,0,.7), 0 0 0 1px rgba(255,69,0,.06);
    max-width:480px; width:92%; overflow:hidden;
  `;
  toast.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#FF4500,#F59E0B)"></div>
    <div style="width:40px;height:40px;min-width:40px;border-radius:10px;background:rgba(255,69,0,.12);border:1px solid rgba(255,140,0,.25);display:flex;align-items:center;justify-content:center;font-size:20px">🎯</div>
    <div style="flex:1">
      <div style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:13px;margin-bottom:4px;color:#fff;line-height:1.35">
        A colônia não para. E a sua operação?
      </div>
      <div style="font-size:12px;color:#9CA3AF;line-height:1.5">
        20 min: montamos o simulador com os números do seu negócio, ao vivo.
      </div>
    </div>
    <a href="https://calendly.com/marlonlotici6/30min" target="_blank"
       style="background:linear-gradient(135deg,#FF4500,#A32800);color:#fff;
              font-family:'Unbounded',sans-serif;font-weight:700;font-size:11px;
              padding:11px 18px;border-radius:7px;text-decoration:none;
              white-space:nowrap;flex-shrink:0;letter-spacing:.5px;transition:transform .2s;">
      Agendar →
    </a>
    <button id="toast-x" aria-label="Fechar" style="background:none;border:none;color:#6B7280;font-size:17px;
      cursor:pointer;padding:0 2px;line-height:1;flex-shrink:0;transition:color .2s;">✕</button>
  `;
  document.body.appendChild(toast);

  const btn = toast.querySelector('a');
  btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-2px)');
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
  const x = toast.querySelector('#toast-x');
  x.addEventListener('mouseenter', () => x.style.color = '#fff');
  x.addEventListener('mouseleave', () => x.style.color = '#6B7280');

  const show = () => {
    if (shown || dismissed) return;
    shown = true;
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    autoHide = setTimeout(() => hide(false), 11000);
  };

  let autoHide;
  const hide = (permanent) => {
    clearTimeout(autoHide);
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(140px)';
    if (permanent) {
      dismissed = true;
      sessionStorage.setItem('antix-toast-dismissed', '1');
    } else {
      // permite reaparecer se a pessoa tentar sair de novo
      shown = false;
    }
  };

  x.addEventListener('click', () => hide(true));
  btn.addEventListener('click', () => hide(true));

  // Exit-intent (desktop): mouse sobe pra fora do topo
  document.addEventListener('mouseleave', e => {
    if (e.clientY < 8) setTimeout(show, 200);
  });

  // Fallback por inatividade (cobre mobile, onde não há exit-intent)
  let idle = setTimeout(show, 45000);
  ['mousemove','keydown','scroll','click','touchstart'].forEach(ev => {
    document.addEventListener(ev, () => {
      clearTimeout(idle);
      if (!shown && !dismissed) idle = setTimeout(show, 45000);
    }, { passive: true });
  });
}

// ─── INIT ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Prevent browser from auto-restoring scroll position
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  initHeroCanvas();      // enxame de formigas — a animação que É a marca
  initNav();
  initSmoothScroll();
  initReveal();
  initCounters();
  initTerminal();
  initChat();
  initMagnetic();
  initDcFill();
  initChipScaler();
  initExitToast();
});

// ─── 14. SIMULADOR DE FORÇA OPERACIONAL ──────────────────────
function initChipScaler() {
  const btnMinus = document.getElementById('chip-minus');
  const btnPlus = document.getElementById('chip-plus');
  const countEl = document.getElementById('chip-count');
  
  const dispDia = document.getElementById('sc-disparos');
  const dispMes = document.getElementById('sc-mes');
  const horasCont = document.getElementById('sc-horas'); // Novo ID que colocamos no HTML

  if (!btnMinus || !btnPlus) return;

  let chips = 2;
  const disparosPorChip = 80; // A sua meta de alta performance

  function update() {
    countEl.textContent = chips;
    dispDia.textContent = (chips * disparosPorChip) + '+';
    // 30 dias no mês
    dispMes.textContent = (chips * disparosPorChip * 30).toLocaleString('pt-BR') + '+';
    // Cada chip equivale a 17h de trabalho de um SDR humano (horas-chip)
    if(horasCont) horasCont.textContent = (chips * 17) + 'h';
  }

  btnMinus.addEventListener('click', () => {
    if (chips > 1) {
      chips--;
      update();
    }
  });

  btnPlus.addEventListener('click', () => {
    if (chips < 50) { // Limite de segurança do simulador
      chips++;
      update();
    }
  });
}