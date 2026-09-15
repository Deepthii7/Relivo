/* RELIVO — ScrollReveal (React Bits), adapted to Tailwind 4 + React 19 */
import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  baseOpacity?: number;
  enableBlur?: boolean;
  baseRotation?: number;
  blurStrength?: number;
  className?: string;
  distance?: number;
}

export default function ScrollReveal({
  children,
  baseOpacity = 0,
  enableBlur = false,
  baseRotation = 0,
  blurStrength = 0,
  className = "",
  distance = 24,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : baseOpacity,
        filter: enableBlur ? `blur(${visible ? 0 : blurStrength}px)` : undefined,
        transform: visible ? "rotate(0deg) translateY(0)" : `rotate(${baseRotation}deg) translateY(${distance}px)`,
        transition: "opacity 0.7s cubic-bezier(0.23,1,0.32,1), transform 0.7s cubic-bezier(0.23,1,0.32,1), filter 0.7s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {children}
    </div>
  );
}
