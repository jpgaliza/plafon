"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Spotlight({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // All mouse state in refs — read in real-time by the animation loop without re-renders
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = 0;
    let H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      // Set actual pixel buffer size
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      // Reset transform and scale once for DPR
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const onMouseOut = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseout", onMouseOut);
    resize();

    // Grid config — tighter spacing for a dense mesh look
    const SPACING = 12;
    const BASE_R = 1.0;
    const MAX_DIST = 280;

    const draw = () => {
      // Instant follow: no lerp, sticks directly to cursor
      animRef.current.x = mouseRef.current.x;
      animRef.current.y = mouseRef.current.y;

      ctx.clearRect(0, 0, W, H);

      const cols = Math.ceil(W / SPACING) + 1;
      const rows = Math.ceil(H / SPACING) + 1;
      const mx = animRef.current.x;
      const my = animRef.current.y;
      const active = mouseRef.current.active;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const px = i * SPACING;
          const py = j * SPACING;

          let r = BASE_R;
          let alpha = 0.1; // Base dot opacity
          let cr = 255, cg = 255, cb = 255;

          if (active) {
            const dx = px - mx;
            const dy = py - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MAX_DIST) {
              const t = 1 - dist / MAX_DIST;
              // Shrink to at most 40% of base radius (doesn't disappear completely)
              r = BASE_R * (1 - t * 0.6);
              
              // Alpha interpolates from 0.1 at the edge to 0.03 at the center
              const baseAlpha = 0.1 * (1 - t) + 0.03 * t;
              // Add a glow ring around the edge. Squaring the sine wave makes the edge fade completely seamless
              const edgeGlow = Math.pow(Math.sin(t * Math.PI), 2);
              alpha = baseAlpha + edgeGlow * 0.35;
              
              // Blue tint near the center
              cr = Math.round(255 - t * 100);
              cg = Math.round(255 - t * 100);
              cb = 255;
            }
          }

          ctx.beginPath();
          ctx.arc(px, py, Math.max(r, 0.01), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseOut);
    };
  }, []); // Empty deps — runs once, reads mouse via ref in real-time

  return (
    <div className={cn("fixed inset-0 z-0 pointer-events-none overflow-hidden", className)}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
