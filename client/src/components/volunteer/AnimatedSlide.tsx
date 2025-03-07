import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSlideProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSlide({ 
  children, 
  className = '',
  delay = 0
}: AnimatedSlideProps) {
  const slideVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: delay,
        when: "beforeChildren",
        staggerChildren: 0.15
      }
    },
    exit: { 
      opacity: 0, 
      y: -50,
      transition: {
        duration: 0.5
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={slideVariants}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={childVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={childVariants}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}