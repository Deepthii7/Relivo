/* RELIVO — GlareHover (from user's snippet), adapted to Tailwind 4 + React 19
 * Subtle angled light sweep on hover; used on landing feature cards. */
import { useRef, useState } from "react";

interface GlareHoverProps {
  children: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
}

export default function GlareHover({
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.3,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 800,
  playOnce = false,
  className = "",
}: GlareHoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [played, setPlayed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const shouldPlay = !playOnce || !played;

  const active = hovering && shouldPlay;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-xl ${className}`}
      onMouseEnter={() => {
        setHovering(true);
        setPlayed(true);
      }}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          opacity: active ? glareOpacity : 0,
          transition: `opacity ${transitionDuration}ms cubic-bezier(0.23,1,0.32,1)`,
          background: `linear-gradient(${glareAngle}deg, transparent 30%, ${glareColor} 50%, transparent 70%)`,
          backgroundSize: `${glareSize}% 100%`,
          backgroundPosition: active ? "120% 0" : "-120% 0",
          transitionProperty: "opacity, background-position",
          transitionDuration: `${transitionDuration}ms, ${transitionDuration}ms`,
          transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
