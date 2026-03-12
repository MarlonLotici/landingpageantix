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

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  // Palette
  const C = {
    violet: [124, 58, 237],
    cyan:   [34, 211, 238],
    white:  [238, 242, 255],
  };

  class Node {
    constructor() { this.reset(true); }

    reset(initial) {
      this.x  = rand(0, W);
      this.y  = initial ? rand(0, H) : rand(0, H);
      this.vx = rand(-0.25, 0.25);
      this.vy = rand(-0.18, 0.18);
      this.r  = rand(1, 2.2);
      this.pulse = rand(0, Math.PI * 2);
      this.pulseSpeed = rand(0.012, 0.028);
      this.type = Math.random() > 0.8 ? 'cyan' : 'violet';
    }

    update(mx, my) {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += this.pulseSpeed;

      // Wrap around edges
      if (this.x < -50) this.x = W + 50;
      if (this.x > W + 50) this.x = -50;
      if (this.y < -50) this.y = H + 50;
      if (this.y > H + 50) this.y = -50;

      // Soft mouse repulsion
      const dx   = this.x - mx;
      const dy   = this.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        const force = (1 - dist / 120) * 0.6;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      // Speed cap + drag
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 1.2) { this.vx *= 0.96; this.vy *= 0.96; }
    }

    draw(ctx) {
      const energy = (Math.sin(this.pulse) + 1) / 2;
      const [r, g, b] = this.type === 'cyan' ? C.cyan : C.violet;
      const alpha = 0.3 + energy * 0.55;
      const radius = this.r * (1 + energy * 0.4);

      // Glow halo when energized
      if (energy > 0.65) {
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius * 8);
        grd.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.25})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 8, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }
  }

  const COUNT = Math.min(70, Math.floor((W * H) / 14000));
  const nodes = Array.from({ length: COUNT }, () => new Node());
  let mx = -999, my = -999;

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  });

  function drawEdges() {
    const MAX = 170;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX) {
          const t      = 1 - dist / MAX;
          const energy = (nodes[i].pulse + nodes[j].pulse) / 2;
          const bright = Math.sin(energy) > 0.6;
          const alpha  = t * (bright ? 0.35 : 0.12);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = bright
            ? `rgba(167,139,250,${alpha})`
            : `rgba(124,58,237,${alpha})`;
          ctx.lineWidth = bright ? 0.8 : 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Pause when tab not visible (saves CPU)
  let raf;
  let paused = false;
  function frame() {
    if (paused) return;
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => n.update(mx, my));
    drawEdges();
    nodes.forEach(n => n.draw(ctx));
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
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

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

  // Activity feed
  const activities = [
    ['Bar do Gugu',        'respondeu ↩',   'c'],
    ['Auto Peças Lima',    'novo lead ◎',   'v'],
    ['Padaria Bela Vista', 'agendou ✓',     'g'],
    ['Clínica São Luís',   'sem resposta —','x'],
    ['Academia FitBody',   'agendou ✓',     'g'],
    ['Restaurante Dom',    'respondeu ↩',   'c'],
    ['Farmácia Saúde+',    'novo lead ◎',   'v'],
    ['Supermercado Rex',   'respondeu ↩',   'c'],
    ['Loja Roupas M',      'sem resposta —','x'],
    ['Oficina Master',     'agendou ✓',     'g'],
    ['Açaí Tropical',      'novo lead ◎',   'v'],
    ['Pet Shop Amigo',     'respondeu ↩',   'c'],
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

  function showEl(el) {
    requestAnimationFrame(() => {
      el.style.transition = 'opacity .35s ease, transform .35s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    });
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

    messages.forEach(msg => {
      if (msg.type === 'out') {
        const b = document.createElement('div');
        b.className = 'bubble bubble-out';
        b.style.cssText = 'opacity:0;transform:translateY(8px);';
        b.innerHTML = msg.text;
        chatArea.appendChild(b);
        addTimeout(() => showEl(b), msg.delay);
      } else {
        const typing = makeTyping();
        const bubble = document.createElement('div');
        bubble.className = 'bubble bubble-in';
        bubble.style.cssText = 'opacity:0;transform:translateY(8px);';
        bubble.innerHTML = msg.text;
        chatArea.appendChild(typing);
        chatArea.appendChild(bubble);

        addTimeout(() => showEl(typing), msg.delay);
        addTimeout(() => {
          typing.style.transition = 'opacity .25s';
          typing.style.opacity    = '0';
          setTimeout(() => { typing.remove(); showEl(bubble); }, 280);
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
  let shown = false;

  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:28px; left:50%; z-index:600;
    transform:translateX(-50%) translateY(100px);
    background:#0D0D28; border:1px solid rgba(124,58,237,.4);
    border-radius:12px; padding:18px 24px;
    display:flex; align-items:center; gap:18px;
    transition:transform .5s cubic-bezier(.16,1,.3,1), opacity .5s;
    opacity:0; box-shadow:0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(124,58,237,.1);
    max-width:460px; width:92%;
  `;
  toast.innerHTML = `
    <span style="font-size:26px">⚡</span>
    <div style="flex:1">
      <div style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:13px;margin-bottom:3px">
        Antes de sair — 20 min podem mudar sua operação
      </div>
      <div style="font-size:12px;color:#6B7280;line-height:1.5">
        Consultoria gratuita. Sem compromisso.
      </div>
    </div>
    <a href="https://calendly.com/marlonlotici6/30min" target="_blank"
       style="background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#EEF2FF;
              font-family:'Unbounded',sans-serif;font-weight:700;font-size:11px;
              padding:10px 16px;border-radius:6px;text-decoration:none;
              white-space:nowrap;flex-shrink:0;letter-spacing:.5px;">
      Agendar →
    </a>
    <button id="toast-x" style="background:none;border:none;color:#6B7280;font-size:16px;
      cursor:none;padding:0 2px;line-height:1;flex-shrink:0;">✕</button>
  `;
  document.body.appendChild(toast);

  const show = () => {
    if (shown) return;
    shown = true;
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(hide, 9000);
  };

  const hide = () => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(100px)';
  };

  document.getElementById('toast-x')?.addEventListener('click', hide);
  toast.querySelector('a')?.addEventListener('click', hide);

  document.addEventListener('mouseleave', e => {
    if (e.clientY < 8) setTimeout(show, 250);
  });

  let idle = setTimeout(show, 50000);
  ['mousemove','keydown','scroll','click'].forEach(ev => {
    document.addEventListener(ev, () => {
      clearTimeout(idle);
      idle = setTimeout(show, 50000);
    }, { passive: true });
  });
}

// ─── INIT ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Prevent browser from restoring scroll position (causes jump on load)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  initHeroCanvas();
  initCtaCanvas();
  initCursor();
  initNav();
  initSmoothScroll();
  initReveal();
  initCounters();
  initTerminal();
  initChat();
  initMagnetic();
  initDcFill();
  initExitToast();
});