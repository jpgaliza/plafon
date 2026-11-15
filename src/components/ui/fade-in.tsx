"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  children: React.ReactNode;
}

export function FadeIn({
  delay = 0,
  direction = "up",
  className,
  children,
  ...props
}: FadeInProps) {
  const directions = {
    up: { y: 12, x: 0 },
    down: { y: -12, x: 0 },
    left: { x: 12, y: 0 },
    right: { x: -12, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        ease: [0.21, 0.47, 0.32, 0.98],
        delay: Math.min(delay, 0.25),
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
