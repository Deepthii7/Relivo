/* RELIVO — Aurora (React Bits), adapted to Tailwind 4 + React 19 */
import { useEffect, useRef } from "react";

interface AuroraProps {
  colorStops?: string[];
  blend?: number;
  amplitude?: number;
  speed?: number;
}

export default function Aurora({ colorStops = ["#047857", "#10B981", "#6EE7B7"], blend = 0.5, amplitude = 1.0, speed = 0.5 }: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const auroras = colorStops.map((color, i) => ({
      color,
      offset: (i / colorStops.length) * Math.PI * 2,
      speed: speed * (0.6 + i * 0.25),
    }));

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      auroras.forEach((a) => {
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.5, a.color);
        gradient.addColorStop(1, "transparent");
        ctx.save();
        ctx.globalAlpha = 0.35 * blend;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) {
          const y = h * 0.55 + Math.sin(x * 0.0025 + time * a.speed + a.offset) * (60 * amplitude)
            + Math.sin(x * 0.006 + time * a.speed * 1.5 + a.offset * 2) * (30 * amplitude);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      time += 0.008;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [colorStops, blend, amplitude, speed]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}
