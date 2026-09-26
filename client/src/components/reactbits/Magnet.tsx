/* RELIVO — Magnet (React Bits), adapted to Tailwind 4 + React 19
 * Used sparingly: only on landing page CTAs per the usage map. */
import { useRef, useState } from "react";

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  className?: string;
}

export default function Magnet({ children, padding = 50, disabled = false, magnetStrength = 50, className = "" }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: disabled ? undefined : `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.25s cubic-bezier(0.23,1,0.32,1)",
      }}
      onMouseMove={(e) => {
        if (disabled) return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const inRange = Math.abs(e.clientX - cx) < padding && Math.abs(e.clientY - cy) < padding;
        if (inRange) {
          setPos({
            x: ((e.clientX - cx) / padding) * magnetStrength,
            y: ((e.clientY - cy) / padding) * magnetStrength,
          });
        } else {
          setPos({ x: 0, y: 0 });
        }
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
    >
      {children}
    </div>
  );
}
