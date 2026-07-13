"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PrintCube = dynamic(() => import("./print-cube").then((m) => m.PrintCube), { ssr: false });

/**
 * Only mounts (and therefore only downloads/runs) the Three.js cube once the
 * viewport is actually wide enough to show it — on narrower screens the JS
 * chunk is never fetched at all, instead of being shipped and CSS-hidden.
 */
export function PrintCubeGate({ minWidth, size, className }: { minWidth: number; size: number; className?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    setShow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setShow(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [minWidth]);

  if (!show) return null;
  return <PrintCube size={size} className={className} />;
}
