'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [displayValue, setDisplayValue] = useState<number>(0);
  const frameRef = useRef<number | null>(null);

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
        setDisplayValue(value);
        frameRef.current = null;
        return;
      }

      // Easing function (easeOutQuad-like)
      const progress = Math.max(0, Math.min(1, elapsed / durationMs));
      const eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      setDisplayValue(Math.floor(eased * value));

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [value, duration, delay]);

  const formatted =
    format === 'percent'
      ? `${Math.round(displayValue)}%`
      : displayValue.toLocaleString();

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className={className}
    >
      {formatted}
    </motion.span>
  );
}
