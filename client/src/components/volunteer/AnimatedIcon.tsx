import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedIconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  className?: string;
  animate?: boolean;
  delay?: number;
}

export default function AnimatedIcon({
  icon: Icon,
  size = 24,
  color = 'currentColor',
  className = '',
  animate = true,
  delay = 0
}: AnimatedIconProps) {
  const hiddenVariant = { 
    scale: 0,
    opacity: 0,
    rotate: -45
  };
  
  const visibleVariant = { 
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay
    }
  };

  // Only apply pulsing animation if animate is true
  const pulseAnimation = animate ? {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse" as "reverse"
    }
  } : {};

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: hiddenVariant,
        visible: visibleVariant
      }}
      {...(animate && {
        whileInView: pulseAnimation
      })}
    >
      <Icon size={size} color={color} />
    </motion.div>
  );
}