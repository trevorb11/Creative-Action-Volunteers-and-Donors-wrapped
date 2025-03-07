import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 1.5,
  formatter = (v) => v.toLocaleString(),
  className = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const totalFrames = Math.round(duration * 60);
    const increment = end / totalFrames;
    
    let currentFrame = 0;
    
    const counter = setInterval(() => {
      currentFrame++;
      start += increment;
      
      if (currentFrame === totalFrames) {
        clearInterval(counter);
        setDisplayValue(end);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, duration * 1000 / totalFrames);
    
    return () => clearInterval(counter);
  }, [value, duration]);
  
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {formatter(displayValue)}
    </motion.span>
  );
}