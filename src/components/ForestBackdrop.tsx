import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ForestBackdrop({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "deep";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        variant === "deep" ? "forest-bg-deep" : "forest-bg",
        className,
      )}
    >
      {/* soft drifting ambient orbs — light through leaves */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.13 75 / 0.18), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.6 0.08 60 / 0.15), transparent 70%)" }}
      />
      {/* subtle grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
