import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface CountUpAnimationProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  isCurrency?: boolean;
  decimals?: number;
}

export default function CountUpAnimation({
  value,
  duration = 1.0, // Reduced default duration from 1.5 to 1.0 seconds for faster animations
  delay = 0,
  className = "",
  isCurrency = false,
  decimals
}: CountUpAnimationProps) {
  const [count, setCount] = useState(0);

  const decimalPlaces = useMemo(() => {
    if (decimals !== undefined) {
      return decimals;
    }

    if (!Number.isFinite(value)) {
      return 0;
    }

    const valueString = value.toString();
    if (!valueString.includes(".")) {
      return 0;
    }

    const fractionalLength = valueString.split(".")[1]?.length ?? 0;
    return Math.min(2, fractionalLength);
  }, [value, decimals]);

  useEffect(() => {
    // Guard against undefined or NaN values
    if (value === undefined || isNaN(value)) {
      setCount(0);
      return;
    }

    let startTime: number;
    let animationFrameId: number;
    
    // Only start the animation after the specified delay
    const timeoutId = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

        // Use easeOutExpo for a nice effect when approaching the target value
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        const easedValue = easeOutExpo * value;
        const nextValue = parseFloat(easedValue.toFixed(decimalPlaces));
        setCount(nextValue);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          // Ensure we end at exactly the target value
          setCount(parseFloat(value.toFixed(decimalPlaces)));
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration, delay, decimalPlaces]);

  // Use motion.span instead of motion.div to avoid nesting issues in paragraph elements
  return (
    <motion.span
      className={className}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 3,
      }}
    >
      {count !== undefined && count !== null
        ? (isCurrency
            ? formatCurrency(count)
            : count.toLocaleString(undefined, {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
              }))
        : '0'}
    </motion.span>
  );
}