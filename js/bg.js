/**
 * FORCE DOGS — Animated Background (Military Olive + Tan palette)
 */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, animId;

  const OLIVE  = 'rgba(92,107,46,';
  const TAN    = 'rgba(196,169,107,';
  const DARK   = 'rgba(28,30,20,';

  const cfg = {
    particleCount: 65,
    maxDist: 135,
    speed: 0.30,
    dotRadius: 1.4,
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
    const rnd = Math.random();
    this.type = rnd > 0.7 ? 'olive' : rnd > 0.45 ? 'tan' : 'dark';
  }

  Particle.prototype.update = function () {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  function initParticles() {
    particles = Array.from({ length: cfg.particleCount }, () => new Particle());
  }

  let radarAngle = 0;
  const RADAR_X = () => W * 0.82;
  const RADAR_Y = () => H * 0.34;
  const RADAR_R = () => Math.min(W, H) * 0.19;

  function drawRadar() {
    const cx = RADAR_X(), cy = RADAR_Y(), r = RADAR_R();

    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = OLIVE + '0.12)'; ctx.lineWidth = 0.8; ctx.stroke();

    ctx.beginPath(); ctx.arc(cx, cy, r * 0.66, 0, Math.PI * 2);
    ctx.strokeStyle = TAN + '0.12)'; ctx.lineWidth = 0.5; ctx.stroke();

    ctx.beginPath(); ctx.arc(cx, cy, r * 0.33, 0, Math.PI * 2);
    ctx.strokeStyle = OLIVE + '0.08)'; ctx.lineWidth = 0.5; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.strokeStyle = DARK + '0.06)'; ctx.lineWidth = 0.5; ctx.stroke();

    const sweepLen = Math.PI * 0.55;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, TAN + '0.10)');
    grad.addColorStop(0.6, OLIVE + '0.05)');
    grad.addColorStop(1, TAN + '0)');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(radarAngle);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, -sweepLen, 0); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(radarAngle) * r, cy + Math.sin(radarAngle) * r);
    ctx.strokeStyle = OLIVE + '0.40)'; ctx.lineWidth = 1.1; ctx.stroke();

    radarAngle += 0.007;
  }

  function drawGrid() {
    ctx.strokeStyle = OLIVE + '0.06)'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += cfg.gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += cfg.gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]; p.update();
      let dotColor;
      if (p.type === 'olive') dotColor = OLIVE + '0.35)';
      else if (p.type === 'tan') dotColor = TAN + '0.45)';
      else dotColor = DARK + '0.15)';

      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor; ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cfg.maxDist) {
          const alpha = (1 - dist / cfg.maxDist) * 0.08;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = OLIVE + alpha + ')'; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
  }

  function drawBrackets() {
    const size = 44, gap = 28;
    ctx.strokeStyle = TAN + '0.22)'; ctx.lineWidth = 1;
    [[gap, gap, 1, 1], [W-gap, gap, -1, 1], [gap, H-gap, 1, -1], [W-gap, H-gap, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + sy * size); ctx.lineTo(x, y); ctx.lineTo(x + sx * size, y);
      ctx.stroke();
    });
  }

  function drawAccents() {
    ctx.fillStyle = TAN + '0.28)';
    for (let x = cfg.gridSize; x < W; x += cfg.gridSize * 3) {
      for (let y = cfg.gridSize; y < H; y += cfg.gridSize * 3) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid(); drawAccents(); drawBrackets(); drawRadar(); drawParticles();
    animId = requestAnimationFrame(draw);
  }

  function init() { resize(); initParticles(); cancelAnimationFrame(animId); draw(); }
  window.addEventListener('resize', () => { resize(); initParticles(); });
  init();
})();
