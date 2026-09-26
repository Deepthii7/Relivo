/* RELIVO — SplitText (React Bits), adapted to Tailwind 4 + React 19 */
import { useEffect, useRef, useState } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  splitType?: "chars" | "words" | "lines";
  from?: Record<string, number>;
  to?: Record<string, number>;
  threshold?: number;
  rootMargin?: string;
  onLetterAnimationComplete?: () => void;
  textAlign?: "left" | "center" | "right";
}

export default function SplitText({
  text,
  className = "",
  delay = 60,
  duration = 0.6,
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-50px",
  onLetterAnimationComplete,
  textAlign = "left",
}: SplitTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const units =
    splitType === "words"
      ? text.split(" ").map((w, i) => ({ content: w, id: i }))
      : splitType === "lines"
        ? text.split("\n").map((l, i) => ({ content: l, id: i }))
        : text.split("").map((c, i) => ({ content: c, id: i }));

  useEffect(() => {
    if (visible && onLetterAnimationComplete) {
      const t = setTimeout(onLetterAnimationComplete, units.length * delay + duration * 1000);
      return () => clearTimeout(t);
    }
  }, [visible, units.length, delay, duration, onLetterAnimationComplete]);

  return (
    <p className={`flex flex-wrap ${splitType === "lines" ? "flex-col" : ""}`} style={{ textAlign, display: "block" }} ref={containerRef}>
      {units.map((u) => (
        <span
          key={u.id}
          className="inline-block"
          style={{
            opacity: visible ? to.opacity ?? 1 : from.opacity ?? 0,
            transform: `translateY(${visible ? (to.y ?? 0) : (from.y ?? 40)}px)`,
            transition: `opacity ${duration}s cubic-bezier(0.23,1,0.32,1) ${u.id * delay}ms, transform ${duration}s cubic-bezier(0.23,1,0.32,1) ${u.id * delay}ms`,
            ...(splitType === "words" ? { marginRight: "0.3em" } : {}),
            ...(splitType === "chars" && u.content === " " ? { width: "0.3em" } : {}),
          }}
        >
          {u.content === " " ? "\u00A0" : u.content}
        </span>
      ))}
    </p>
  );
}
