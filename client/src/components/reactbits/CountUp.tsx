/* RELIVO — CountUp (React Bits), adapted to Tailwind 4 + React 19
 * Counts numbers when scrolled into view; used on landing stats, dashboards,
 * AI recommendation scores, and analytics KPIs. */
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  from: number;
  to: number;
  separator?: string;
  direction?: "up" | "down";
  duration?: number;
  className?: string;
  decimals?: number;
  suffix?: string;
}

export default function CountUp({ from, to, separator = ",", direction = "up", duration = 1.2, className = "", decimals = 0, suffix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(direction === "down" ? to : from);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const current = from + (to - from) * (direction === "up" ? eased : 1 - eased);
            setValue(current);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [from, to, direction, duration]);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).split(",")
    .join(separator === "," ? "," : separator);

  return <span ref={ref} className={className}>{formatted}{suffix}</span>;
}
