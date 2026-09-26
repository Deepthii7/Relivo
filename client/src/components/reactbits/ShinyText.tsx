/* RELIVO — ShinyText (React Bits), adapted to Tailwind 4 + React 19
 * Used as the landing eyebrow badge. */
interface ShinyTextProps {
  text: string;
  speed?: number;
  delay?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: "left" | "right";
  yoyo?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

export default function ShinyText({
  text,
  speed = 3,
  delay = 0,
  color = "#37433d",
  shineColor = "#ffffff",
  spread = 120,
  direction = "left",
  yoyo = false,
  pauseOnHover = false,
  className = "",
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(100deg, ${color} 0%, ${color} 30%, ${shineColor} 50%, ${color} 70%, ${color} 100%)`,
        backgroundSize: `${spread}% 100%`,
        backgroundRepeat: "no-repeat",
        color: color,
        WebkitTextFillColor: "transparent",
        animation: `shiny ${speed}s linear ${delay}s infinite${yoyo ? " alternate" : ""}${pauseOnHover ? " paused" : ""}`,
      }}
    >
      {text}
      <style>{`
        @keyframes shiny {
          0% { background-position: ${direction === "left" ? "200%" : "-200%"} center; }
          100% { background-position: ${direction === "left" ? "-200%" : "200%"} center; }
        }
      `}</style>
    </span>
  );
}
