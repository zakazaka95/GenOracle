import { useEffect, useRef } from "react";

/** Animated starfield + slow nebula on a canvas. Tinted by the active sign color. */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    let stars: { x: number; y: number; r: number; tw: number; sp: number }[] = [];
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor((w * h) / 5000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.2,
        tw: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.02 + 0.005,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      // stars
      for (const s of stars) {
        s.tw += s.sp;
        const a = 0.4 + Math.sin(s.tw) * 0.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, a)})`;
        ctx.fill();
      }

      // shooting star
      if (!shooting && Math.random() < 0.003) {
        shooting = {
          x: Math.random() * w * 0.6,
          y: Math.random() * h * 0.4,
          vx: 6 + Math.random() * 4,
          vy: 2 + Math.random() * 2,
          life: 1,
        };
      }
      if (shooting) {
        const tail = 80;
        const grad = ctx.createLinearGradient(
          shooting.x, shooting.y,
          shooting.x - shooting.vx * tail / 6, shooting.y - shooting.vy * tail / 6
        );
        grad.addColorStop(0, `rgba(255,255,255,${shooting.life})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(shooting.x - shooting.vx * tail / 6, shooting.y - shooting.vy * tail / 6);
        ctx.stroke();
        shooting.x += shooting.vx;
        shooting.y += shooting.vy;
        shooting.life -= 0.012;
        if (shooting.life <= 0 || shooting.x > w || shooting.y > h) shooting = null;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full"
      aria-hidden
    />
  );
}