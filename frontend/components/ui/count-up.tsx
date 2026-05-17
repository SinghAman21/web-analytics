'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  delay?: number;
  format?: 'number' | 'percent';
  className?: string;
}

export function CountUp({
  value,
  duration = 0.8,
  delay = 0,
  format = 'number',
  className = '',
}: CountUpProps) {
  const displayValueRef = useRef(0);
  //@ts-ignore
  const frameRef = useRef<number>();

  useEffect(() => {
    const startTime = Date.now() + delay * 1000;
    const durationMs = duration * 1000;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < 0) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      if (elapsed >= durationMs) {
        displayValueRef.current = value;
      } else {
        // Easing function (easeOutQuad)
        const progress = elapsed / durationMs;
        const eased = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
        displayValueRef.current = Math.floor(eased * value);
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration, delay]);

  const displayValue =
    format === 'percent'
      ? `${Math.round(displayValueRef.current)}%`
      : displayValueRef.current.toLocaleString();

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className={className}
    >
      {displayValue}
    </motion.span>
  );
}
