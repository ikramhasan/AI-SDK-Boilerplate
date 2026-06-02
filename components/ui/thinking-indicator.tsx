"use client";

import { AnimatePresence, motion } from "motion/react";
import { forwardRef, useEffect, useState, type HTMLAttributes } from "react";

import { fontWeights } from "@/lib/font-weight";
import { cn } from "@/lib/utils";

const circleA =
  "M 12 8 C 14.21 8 16 9.79 16 12 C 16 14.21 14.21 16 12 16 C 9.79 16 8 14.21 8 12 C 8 9.79 9.79 8 12 8 Z";

const infinity =
  "M 12 12 C 14 8.5 19 8.5 19 12 C 19 15.5 14 15.5 12 12 C 10 8.5 5 8.5 5 12 C 5 15.5 10 15.5 12 12 Z";

const circleB =
  "M 12 16 C 14.21 16 16 14.21 16 12 C 16 9.79 14.21 8 12 8 C 9.79 8 8 9.79 8 12 C 8 14.21 9.79 16 12 16 Z";

const words = ["Thinking", "Moonwalking", "Planning", "Refining"];
const longestWord = words.reduce((a, b) => (a.length >= b.length ? a : b));

const ThinkingIndicator = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % words.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <span
      ref={ref}
      role="status"
      className={cn(
        "inline-flex items-center gap-2 text-muted-foreground",
        className
      )}
      {...props}
    >
      <motion.svg
        aria-hidden="true"
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0"
      >
        <motion.path
          animate={{
            d: [circleA, infinity, circleB, infinity, circleA],
          }}
          transition={{
            d: {
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
              times: [0, 0.25, 0.5, 0.75, 1],
            },
          }}
        />
      </motion.svg>
      <span
        className="inline-grid overflow-hidden text-[13px]"
        style={{ fontVariationSettings: fontWeights.medium }}
      >
        <span
          aria-hidden="true"
          className="thinking-indicator-shimmer-text invisible col-start-1 row-start-1"
        >
          {longestWord}
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={words[index]}
            className="thinking-indicator-shimmer-text col-start-1 row-start-1"
            initial={{ y: "80%", opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
            }}
            exit={{
              y: "-80%",
              opacity: 0,
              transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
});

ThinkingIndicator.displayName = "ThinkingIndicator";

export { ThinkingIndicator };
export default ThinkingIndicator;
