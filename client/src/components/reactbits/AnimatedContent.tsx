/* RELIVO — AnimatedContent (React Bits), adapted to Tailwind 4 + React 19 */
import { useEffect, useRef, useState } from "react";

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  duration?: number;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
  className?: string;
}

export default function AnimatedContent({
  children,
  distance = 120,
  direction = "vertical",
  reverse = false,
  duration = 0.8,
  initialOpacity = 0.2,
  animateOpacity = true,
  scale = 1,
  threshold = 0.2,
  delay = 0,
  className = "",
}: AnimatedContentProps) {
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
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const dir = direction === "horizontal" ? "X" : "Y";
  const sign = reverse ? -1 : 1;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible || !animateOpacity ? 1 : initialOpacity,
        transform: visible
          ? "translate(0,0) scale(1)"
          : `translate(${dir === "X" ? sign * distance : 0}px, ${dir === "Y" ? sign * distance : 0}px) scale(${scale})`,
        transition: `opacity ${duration}s cubic-bezier(0.23,1,0.32,1) ${delay}s, transform ${duration}s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
