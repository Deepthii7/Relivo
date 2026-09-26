/* RELIVO — BlurText (React Bits), adapted to Tailwind 4 + React 19 */
import { useEffect, useRef, useState } from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  className?: string;
  onAnimationComplete?: () => void;
}

export default function BlurText({ text, delay = 80, animateBy = "words", direction = "top", className = "", onAnimationComplete }: BlurTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
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
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visible && onAnimationComplete) {
      const units = animateBy === "words" ? text.split(" ") : text.split("");
      const t = setTimeout(onAnimationComplete, units.length * delay + 900);
      return () => clearTimeout(t);
    }
  }, [visible, animateBy, delay, text, onAnimationComplete]);

  const units = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <p ref={ref} className={`flex flex-wrap items-center ${className}`}>
      {units.map((u, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0px)" : "blur(12px)",
            transform: visible
              ? "translateY(0)"
              : `translateY(${direction === "top" ? "-14px" : "14px"})`,
            transition: `opacity 0.5s cubic-bezier(0.23,1,0.32,1) ${i * delay}ms, filter 0.5s cubic-bezier(0.23,1,0.32,1) ${i * delay}ms, transform 0.5s cubic-bezier(0.23,1,0.32,1) ${i * delay}ms`,
            ...(animateBy === "words" ? { marginRight: "0.3em" } : {}),
          }}
        >
          {u === " " ? "\u00A0" : u}
        </span>
      ))}
    </p>
  );
}
