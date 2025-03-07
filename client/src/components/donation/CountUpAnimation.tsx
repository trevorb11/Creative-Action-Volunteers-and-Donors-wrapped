import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface CountUpAnimationProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  isCurrency?: boolean;
}

export default function CountUpAnimation({ 
  value,
  duration = 1.5,
  delay = 0,
  className = "",
  isCurrency = false
}: CountUpAnimationProps) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;
    
    // Only start the animation after the specified delay
    const timeoutId = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        // Use easeOutExpo for a nice effect when approaching the target value
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(easeOutExpo * value));
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          // Ensure we end at exactly the target value
          setCount(value);
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
  }, [value, duration, delay]);
  
  return (
    <motion.div
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
      {isCurrency ? formatCurrency(count) : count.toLocaleString()}
    </motion.div>
  );
}