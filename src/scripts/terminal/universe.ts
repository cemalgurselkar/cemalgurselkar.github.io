/**
 * `universe`: a tiny decorative star simulation drawn inside the terminal.
 * - Canvas 2D, DPR capped at 2, ≤ 90 particles, requestAnimationFrame.
 * - Runs for a few seconds, pauses while the tab is hidden, and always cleans up.
 * - With motion disabled it draws a single still frame.
 */

const COLORS = ["#f2f0fa", "#b4a4de", "#b4a4de", "#dca478", "#9698ae"];
const PARTICLES = 90;
const RUN_MS = 9000;
const PIXEL = 2; // CSS px per "pixel"

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  color: string;
  twinkle: number;
}

export interface Universe {
  stop: () => void;
}

export function startUniverse(
  host: HTMLElement,
  { animate }: { animate: boolean },
): Universe {
  const canvas = document.createElement("canvas");
  canvas.className = "term-universe";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "A small animated spiral of stars");
  host.append(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return { stop: () => canvas.remove() };

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(200, host.clientWidth - 4);
  const height = Math.min(180, Math.round(width * 0.38));
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);

  const maxRadius = Math.min(width, height * 2.4) / 2;
  const particles: Particle[] = Array.from({ length: PARTICLES }, (_, i) => {
    const arm = i % 2;
    const t = Math.random();
    return {
      // Two loose spiral arms.
      angle: arm * Math.PI + t * Math.PI * 2.4 + (Math.random() - 0.5) * 0.6,
      radius: 6 + t * maxRadius,
      speed: 0.25 + (1 - t) * 0.55, // inner stars orbit faster
      size: Math.random() < 0.15 ? PIXEL * 2 : PIXEL,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      twinkle: Math.random() * Math.PI * 2,
    };
  });

  const draw = (time: number) => {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    for (const p of particles) {
      const a = p.angle + (time / 1000) * p.speed * 0.6;
      // Flattened, tilted ellipse → looks like a galaxy seen at an angle.
      const x = cx + Math.cos(a) * p.radius;
      const y = cy + Math.sin(a) * p.radius * 0.38;
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(time / 400 + p.twinkle);
      ctx.fillStyle = p.color;
      // Snap to the pixel grid for the pixel-art look.
      ctx.fillRect(
        Math.round(x / PIXEL) * PIXEL,
        Math.round(y / PIXEL) * PIXEL,
        p.size,
        p.size,
      );
    }
    // Core
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f2f0fa";
    ctx.fillRect(
      Math.round(cx) - PIXEL,
      Math.round(cy) - PIXEL,
      PIXEL * 2,
      PIXEL * 2,
    );
  };

  if (!animate) {
    draw(0);
    return { stop: () => {} };
  }

  let frame = 0;
  let elapsed = 0;
  let last = performance.now();
  let stopped = false;

  const loop = (now: number) => {
    elapsed += Math.min(now - last, 100);
    last = now;
    draw(elapsed);
    if (elapsed < RUN_MS) frame = requestAnimationFrame(loop);
  };

  const onVisibility = () => {
    if (stopped) return;
    cancelAnimationFrame(frame);
    if (!document.hidden && elapsed < RUN_MS) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  };

  document.addEventListener("visibilitychange", onVisibility);
  frame = requestAnimationFrame(loop);

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
