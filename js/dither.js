/**
 * dither.js — Pixel-art dithering engine using Bayer ordered dithering
 * Renders canvas-based dot-matrix pixel art with mouse parallax
 */

// ============================================================
// BAYER 4x4 MATRIX
// ============================================================
const BAYER_4x4 = [
  [ 0, 8, 2,10],
  [12, 4,14, 6],
  [ 3,11, 1, 9],
  [15, 7,13, 5]
];

// ============================================================
// SKULL SHAPE DATA (32x40 grid, 1=dot, 0=empty)
// ============================================================
const SKULL_MAP = [
  [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],
  [1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1],
  [1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1],
  [1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1],
  [1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ============================================================
// HERO CANVAS — Dithered skull with mouse parallax
// ============================================================
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLS = 32;
  const ROWS = 40;
  let cellSize = 16;
  let mouseX = 0.5, mouseY = 0.5;
  let time = 0;

  function resize() {
    const w = canvas.parentElement.clientWidth;
    cellSize = Math.floor(Math.min(w, 560) / COLS);
    canvas.width = cellSize * COLS;
    canvas.height = cellSize * ROWS;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const parallaxX = (mouseX - 0.5) * cellSize * 1.5;
    const parallaxY = (mouseY - 0.5) * cellSize * 1.5;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const val = SKULL_MAP[row] ? (SKULL_MAP[row][col] || 0) : 0;
        if (val === 0) continue;

        // Bayer dithering threshold for size variation
        const bayer = BAYER_4x4[row % 4][col % 4] / 16;
        const pulse = Math.sin(time * 0.8 + col * 0.4 + row * 0.3) * 0.08;
        const sz = (0.5 + bayer * 0.4 + pulse) * cellSize * 0.82;
        const r = sz / 2;

        const x = col * cellSize + cellSize / 2 + parallaxX * (1 - row / ROWS * 0.5);
        const y = row * cellSize + cellSize / 2 + parallaxY * (1 - col / COLS * 0.5);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        const isSquare = bayer > 0.5;
        if (isSquare) {
          ctx.fillRect(x - r * 0.82, y - r * 0.82, r * 1.64, r * 1.64);
        } else {
          ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (isSquare) {} // already filled above
      }
    }
    time += 0.012;
  }

  function animate() {
    draw();
    requestAnimationFrame(animate);
  }

  // Mouse tracking
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  window.addEventListener('resize', resize);
  resize();
  animate();
}

// ============================================================
// BANNER CANVAS — Dithered horizontal banner (Who We Are)
// Renders the "Creation of Adam hands" silhouette style
// ============================================================
function initBannerCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let time = 0;
  let mouseX = 0.5;

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }

  function draw() {
    const W = canvas.width;
    const H = canvas.height;
    const CELL = Math.max(6, Math.floor(W / 160));

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const cols = Math.ceil(W / CELL);
    const rows = Math.ceil(H / CELL);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const nx = col / cols;
        const ny = row / rows;

        // Generate silhouette brightness using wave pattern
        // Creates an organic landscape-like silhouette
        const wave1 = Math.sin(nx * Math.PI * 2.5 + time * 0.3) * 0.15;
        const wave2 = Math.cos(nx * Math.PI * 4 + time * 0.2) * 0.08;
        const horizon = 0.55 + wave1 + wave2;

        // Two "peaks" for hands reaching toward center
        const distCenter = Math.abs(nx - 0.5);
        const handShape = nx < 0.45
          ? Math.max(0, 1 - Math.pow((nx - 0.35) / 0.15, 2)) * 0.25
          : Math.max(0, 1 - Math.pow((nx - 0.65) / 0.15, 2)) * 0.25;

        const silhouette = horizon - handShape;
        const brightness = ny > silhouette ? 1.0 : 0.0;

        if (brightness < 0.05) continue;

        const bayer = BAYER_4x4[row % 4][col % 4] / 16;
        const noise = Math.random() * 0.05;
        const finalBright = Math.min(1, brightness + noise);

        if (finalBright < bayer * 0.4) continue;

        const sz = (0.45 + bayer * 0.5) * CELL * 0.85;

        const x = col * CELL + CELL / 2 + (mouseX - 0.5) * CELL * 0.5;
        const y = row * CELL + CELL / 2;

        ctx.fillStyle = `rgba(255,255,255,${0.7 + bayer * 0.3})`;
        if (bayer > 0.5) {
          ctx.fillRect(x - sz/2, y - sz/2, sz, sz);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, sz * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    time += 0.008;
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
  });

  let frame;
  function animate() {
    draw();
    frame = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => { resize(); });
  resize();
  animate();
}

// ============================================================
// EYES CANVAS — Animated pixelated eyes pattern (Our Work)
// ============================================================
function initEyesCanvas() {
  const canvas = document.getElementById('eyes-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let time = 0;
  let mouseX = 0.5, mouseY = 0.5;

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }

  function drawEye(ctx, cx, cy, w, h, pupilOffX, pupilOffY, t) {
    // Outer eye oval (dithered dots)
    const rx = w / 2, ry = h / 2;
    const resolution = 6;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';

    for (let angle = 0; angle < Math.PI * 2; angle += 0.12) {
      const ex = cx + Math.cos(angle) * rx;
      const ey = cy + Math.sin(angle) * ry * 0.55;
      const dotSize = 2.5 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(ex, ey, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eye lid lines (dot rows along top/bottom arc)
    for (let i = -rx; i <= rx; i += resolution) {
      const yTop = cy - ry * Math.sqrt(1 - (i/rx)**2) * 0.5;
      const yBot = cy + ry * Math.sqrt(1 - (i/rx)**2) * 0.5;
      const dot = 2;
      ctx.beginPath(); ctx.arc(cx + i, yTop, dot, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + i, yBot, dot, 0, Math.PI*2); ctx.fill();
    }

    // Animated pupil (iris)
    const px = cx + pupilOffX * rx * 0.3;
    const py = cy + pupilOffY * ry * 0.3;
    const pr = Math.min(rx, ry) * 0.35;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
      const ex = px + Math.cos(angle) * pr;
      const ey = py + Math.sin(angle) * pr * 0.7;
      ctx.beginPath();
      ctx.arc(ex, ey, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Pupil ring fill
    for (let r2 = 2; r2 < pr; r2 += 4) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.4) {
        ctx.beginPath();
        ctx.arc(px + Math.cos(angle)*r2, py + Math.sin(angle)*r2*0.7, 1.5, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const eyeW = 100, eyeH = 50;
    const colCount = Math.ceil(W / (eyeW + 20));
    const rowCount = Math.ceil(H / (eyeH + 24));
    const gap_x = (W - colCount * eyeW) / (colCount + 1);
    const gap_y = (H - rowCount * eyeH) / (rowCount + 1);

    const pupilX = (mouseX - 0.5) * 2;
    const pupilY = (mouseY - 0.5) * 2;

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const cx = gap_x + col * (eyeW + gap_x) + eyeW / 2;
        const cy = gap_y + row * (eyeH + gap_y) + eyeH / 2;

        const blink = Math.sin(time * 1.5 + col * 0.8 + row * 1.2);
        if (blink > 0.92) continue; // blink effect

        const scaleY = Math.max(0.1, 1 - Math.max(0, blink - 0.7) * 5);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, scaleY);
        ctx.translate(-cx, -cy);
        drawEye(ctx, cx, cy, eyeW * 0.85, eyeH * 0.75, pupilX, pupilY, time);
        ctx.restore();
      }
    }
    time += 0.015;
    requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  window.addEventListener('resize', resize);
  resize();
  draw();
}

// Export
window.DitherEngine = { initHeroCanvas, initBannerCanvas, initEyesCanvas };
