"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground({ intensity = "subtle" }: { intensity?: "subtle" | "hero" }) {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;

    function onMove(e: PointerEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
    }

    function tick() {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      if (el) el.style.transform = `translate3d(${x - 320}px, ${y - 320}px, 0)`;
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="blob left-0 top-0 h-[36rem] w-[36rem]"
        style={{ background: "var(--blob-1)", animation: "float-a 22s ease-in-out infinite" }}
      />
      <div
        className="blob right-0 top-1/3 h-[30rem] w-[30rem]"
        style={{ background: "var(--blob-2)", animation: "float-b 26s ease-in-out infinite" }}
      />
      <div
        className="blob bottom-0 left-1/3 h-[26rem] w-[26rem]"
        style={{ background: "var(--blob-3)", animation: "float-c 20s ease-in-out infinite" }}
      />
      <div
        ref={glowRef}
        className="absolute h-[40rem] w-[40rem] rounded-full opacity-0 transition-opacity duration-700 md:opacity-100"
        style={{
          background:
            intensity === "hero"
              ? "radial-gradient(circle, var(--blob-1) 0%, transparent 70%)"
              : "radial-gradient(circle, var(--blob-1) 0%, transparent 65%)",
          filter: intensity === "hero" ? "blur(40px)" : "blur(90px)",
        }}
      />
    </div>
  );
}
