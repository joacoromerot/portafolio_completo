// ── CURSOR ──────────────────────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * .12;
  ry += (my - ry) * .12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, input, textarea, .skill-card, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width='48px'; ring.style.height='48px'; ring.style.borderColor='rgba(0,245,255,.6)'; });
  el.addEventListener('mouseleave', () => { ring.style.width='32px'; ring.style.height='32px'; ring.style.borderColor='rgba(0,245,255,.35)'; });
});

// ── STARS CANVAS ────────────────────────────────────────
const canvas = document.getElementById('starsCanvas');
const ctx    = canvas.getContext('2d');
let stars    = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars() {
  stars = [];
  for (let i = 0; i < 180; i++) {
    stars.push({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.2 + .2,
      a:  Math.random(),
      sp: Math.random() * .004 + .001,
      dir: Math.random() > .5 ? 1 : -1
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    s.a += s.sp * s.dir;
    if (s.a >= 1 || s.a <= 0) s.dir *= -1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,245,255,${s.a})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}

resizeCanvas(); initStars(); drawStars();
window.addEventListener('resize', () => { resizeCanvas(); initStars(); });

// ── NAVBAR ACTIVE ON SCROLL ─────────────────────────────
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute('id');
  });
  navLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
});

// ── SCROLL REVEAL ───────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const observer  = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: .12 });
revealEls.forEach(el => observer.observe(el));

// ── COUNTERS ────────────────────────────────────────────
function animateCounter(el) {
  const target = +el.dataset.target;
  const dur    = 1600;
  const step   = dur / target;
  let current  = 0;
  const t = setInterval(() => {
    current++;
    el.textContent = current + (target >= 10 ? '+' : '');
    if (current >= target) clearInterval(t);
  }, step);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: .5 });
document.querySelectorAll('.num[data-target]').forEach(el => counterObs.observe(el));

// ── CARRUSEL BÁSQUET ────────────────────────────────────
(function initCarousel() {
  const track  = document.getElementById('carouselTrack');
  const dots   = document.querySelectorAll('.cdot');
  const prev   = document.getElementById('carouselPrev');
  const next   = document.getElementById('carouselNext');
  if (!track) return;

  let current = 0;
  const total = track.children.length;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  // Auto-play cada 4s
  let timer = setInterval(() => goTo(current + 1), 4000);
  track.parentElement.addEventListener('mouseenter', () => clearInterval(timer));
  track.parentElement.addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo(current + 1), 4000);
  });

  // Swipe touch
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  });
})();

// ── PROGRESS BARS ───────────────────────────────────────
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const pct = e.target.dataset.pct;
      e.target.style.width = pct + '%';
      barObserver.unobserve(e.target);
    }
  });
}, { threshold: .3 });
document.querySelectorAll('.bar-fill').forEach(b => barObserver.observe(b));

// ── TYPEWRITER ──────────────────────────────────────────
(function typewriter() {
  const el = document.getElementById('typewriterEl');
  if (!el) return;
  const lines = [
    '> Programador Frontend especializado',
    '> en interfaces modernas, rápidas',
    '> y con atención al detalle.'
  ];
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  let lineIdx = 0, charIdx = 0, typing = true, pauseTicks = 0;
  const PAUSE = 38; // frames de pausa entre líneas

  function tick() {
    const line = lines[lineIdx];
    if (typing) {
      charIdx++;
      // Reconstruye el contenido con las líneas ya escritas + la actual parcial
      let html = lines.slice(0, lineIdx).join('<br>');
      if (html) html += '<br>';
      html += line.slice(0, charIdx);
      el.innerHTML = html;
      el.appendChild(cursor);
      if (charIdx >= line.length) {
        typing = false;
        pauseTicks = PAUSE;
      }
    } else {
      if (pauseTicks > 0) { pauseTicks--; }
      else {
        lineIdx++;
        if (lineIdx < lines.length) { charIdx = 0; typing = true; }
        else {
          // Terminó — quita cursor parpadeante
          cursor.style.animation = 'none';
          cursor.style.opacity = '1';
          return;
        }
      }
    }
    setTimeout(tick, typing ? 38 : 16);
  }
  // Pequeño delay inicial para que cargue el hero primero
  setTimeout(tick, 600);
})();

// ── MAGNETIC BUTTONS ────────────────────────────────────
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  const STRENGTH = 0.32;
  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const dx = (e.clientX - cx) * STRENGTH;
    const dy = (e.clientY - cy) * STRENGTH;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
  });
});

// ── PARTICLE CARDS ──────────────────────────────────────
document.querySelectorAll('.particle-card').forEach(card => {
  const canvas = card.querySelector('.particle-canvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];
  let raf       = null;
  let active    = false;

  function resize() {
    canvas.width  = card.offsetWidth;
    canvas.height = card.offsetHeight;
  }

  function spawnBurst(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.8;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: Math.random() * 0.025 + 0.012,
        r: Math.random() * 2.5 + 1,
        hue: Math.random() > .5 ? '0,245,255' : '123,97,255'
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.06; // gravedad suave
      p.life -= p.decay;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.life})`;
      ctx.shadowBlur   = 8;
      ctx.shadowColor  = `rgba(${p.hue},${p.life * .8})`;
      ctx.fill();
    });
    if (active || particles.length) raf = requestAnimationFrame(draw);
    else raf = null;
  }

  card.addEventListener('mouseenter', () => {
    resize();
    active = true;
    if (!raf) draw();
  });

  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    if (Math.random() < .35)
      spawnBurst(e.clientX - r.left, e.clientY - r.top, 4);
  });

  card.addEventListener('mouseleave', () => {
    active = false;
  });
});

// ── CONTACT FORM ────────────────────────────────────────
function handleSend() {
  const btn = document.getElementById('sendBtn');
  const msg = document.getElementById('successMsg');

  // Activa loader (oculta texto, muestra dots)
  btn.classList.add('loading');

  setTimeout(() => {
    btn.classList.remove('loading');
    // Reemplaza texto del nodo de texto (último child de texto)
    btn.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = ' Mensaje enviado ✓'; });
    btn.style.background = 'rgba(0,245,255,.15)';
    btn.style.color = 'var(--accent)';
    btn.style.border = '1px solid rgba(0,245,255,.4)';
    btn.style.pointerEvents = 'none';
    msg.style.display = 'block';
  }, 1600);
}