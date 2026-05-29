/**
 * KANINO — Animated Background
 * Tactical radar/grid + particle network effect
 */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, animId;
  const GOLD = 'rgba(201,168,76,';
  const WHITE = 'rgba(242,240,234,';

  // Config
  const cfg = {
    particleCount: 80,
    maxDist: 140,
    speed: 0.35,
    dotRadius: 1.5,
    gridOpacity: 0.025,
    gridSize: 80,
  };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * cfg.speed;
    this.vy = (Math.random() - 0.5) * cfg.speed;
    this.r = Math.random() * cfg.dotRadius + 0.8;
    this.gold = Math.random() > 0.75;
  }

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  function initParticles() {
    particles = Array.from({ length: cfg.particleCount }, () => new Particle());
  }

  // Radar sweep
  let radarAngle = 0;
  const RADAR_X = () => W * 0.82;
  const RADAR_Y = () => H * 0.38;
  const RADAR_R = () => Math.min(W, H) * 0.22;

  function drawRadar() {
    const cx = RADAR_X(), cy = RADAR_Y(), r = RADAR_R();

    // Outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = GOLD + '0.09)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Inner circles
    [0.66, 0.33].forEach(f => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * f, 0, Math.PI * 2);
      ctx.strokeStyle = GOLD + '0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Cross hairs
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.strokeStyle = GOLD + '0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Sweep gradient
    const sweepGrad = ctx.createConicalGradient
      ? null // fallback below
      : null;

    // Sweep arc (manual)
    const sweepLen = Math.PI * 0.6;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, GOLD + '0.18)');
    grad.addColorStop(1, GOLD + '0)');

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(radarAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, -sweepLen, 0);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Sweep line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(radarAngle) * r,
      cy + Math.sin(radarAngle) * r
    );
    ctx.strokeStyle = GOLD + '0.55)';
    ctx.lineWidth = 1;
    ctx.stroke();

    radarAngle += 0.008;
  }

  function drawGrid() {
    ctx.strokeStyle = WHITE + cfg.gridOpacity + ')';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += cfg.gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += cfg.gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();

      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold ? GOLD + '0.7)' : WHITE + '0.25)';
      ctx.fill();

      // Lines to neighbors
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cfg.maxDist) {
          const alpha = (1 - dist / cfg.maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = WHITE + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Corner brackets decoration
  function drawBrackets() {
    const size = 40, gap = 24, lw = 1;
    ctx.strokeStyle = GOLD + '0.13)';
    ctx.lineWidth = lw;
    const corners = [
      [gap, gap, 1, 1],
      [W - gap, gap, -1, 1],
      [gap, H - gap, 1, -1],
      [W - gap, H - gap, -1, -1],
    ];
    corners.forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + sy * size);
      ctx.lineTo(x, y);
      ctx.lineTo(x + sx * size, y);
      ctx.stroke();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawBrackets();
    drawRadar();
    drawParticles();
    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    initParticles();
    cancelAnimationFrame(animId);
    draw();
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  init();
})();
