/**
 * KANINO — Animated Background (v2 — Navy/Gold/Green palette)
 */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, animId;

  // New palette colors for canvas
  const GOLD  = 'rgba(245,183,0,';
  const NAVY  = 'rgba(13,53,87,';
  const GREEN = 'rgba(74,93,35,';
  const WHITE = 'rgba(242,242,242,';

  const cfg = {
    particleCount: 85,
    maxDist: 145,
    speed: 0.32,
    dotRadius: 1.6,
    gridOpacity: 0.04,
    gridSize: 72,
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
    this.r = Math.random() * cfg.dotRadius + 0.9;
    const rnd = Math.random();
    this.type = rnd > 0.8 ? 'gold' : rnd > 0.6 ? 'green' : 'white';
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
  const RADAR_X = () => W * 0.80;
  const RADAR_Y = () => H * 0.36;
  const RADAR_R = () => Math.min(W, H) * 0.21;

  function drawRadar() {
    const cx = RADAR_X(), cy = RADAR_Y(), r = RADAR_R();

    // Outer ring (gold)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = GOLD + '0.12)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Mid ring (green)
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.66, 0, Math.PI * 2);
    ctx.strokeStyle = GREEN + '0.10)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.33, 0, Math.PI * 2);
    ctx.strokeStyle = GOLD + '0.07)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Cross hairs
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.strokeStyle = NAVY + '0.6)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Sweep fill
    const sweepLen = Math.PI * 0.55;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, GOLD + '0.14)');
    grad.addColorStop(0.6, GREEN + '0.06)');
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

    // Sweep line (gold)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(radarAngle) * r, cy + Math.sin(radarAngle) * r);
    ctx.strokeStyle = GOLD + '0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    radarAngle += 0.007;
  }

  function drawGrid() {
    // Vertical lines in navy tone
    ctx.strokeStyle = NAVY + '0.35)';
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

      // Dot color by type
      let dotColor;
      if (p.type === 'gold') dotColor = GOLD + '0.75)';
      else if (p.type === 'green') dotColor = GREEN + '0.65)';
      else dotColor = WHITE + '0.18)';

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();

      // Connecting lines
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cfg.maxDist) {
          const alpha = (1 - dist / cfg.maxDist) * 0.10;
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

  // Corner bracket decoration
  function drawBrackets() {
    const size = 44, gap = 28;
    ctx.strokeStyle = GOLD + '0.18)';
    ctx.lineWidth = 1;
    [[gap, gap, 1, 1], [W-gap, gap, -1, 1], [gap, H-gap, 1, -1], [W-gap, H-gap, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + sy * size); ctx.lineTo(x, y); ctx.lineTo(x + sx * size, y);
      ctx.stroke();
    });
  }

  // Small green military dots at grid intersections (sample)
  function drawGreenAccents() {
    ctx.fillStyle = GREEN + '0.22)';
    for (let x = cfg.gridSize; x < W; x += cfg.gridSize * 3) {
      for (let y = cfg.gridSize; y < H; y += cfg.gridSize * 3) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawGreenAccents();
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
