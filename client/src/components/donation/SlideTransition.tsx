import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideTransitionProps {
  children: ReactNode;
  slideKey: number | string;
  direction?: "forward" | "backward";
}

/**
 * SlideTransition Component
 * 
 * Provides animated transitions between slides, with forward and backward
 * animation support. This enhances the user experience when navigating
 * through the donation impact visualization journey.
 */
export default function SlideTransition({ children, slideKey, direction = "forward" }: SlideTransitionProps) {
  // Store previous direction to handle direction changes
  const [prevDirection, setPrevDirection] = useState(direction);
  const [isChangingDirection, setIsChangingDirection] = useState(false);
  
  // Handle direction changes to prevent jarring animation reversals
  useEffect(() => {
    if (direction !== prevDirection) {
      setIsChangingDirection(true);
      const timer = setTimeout(() => {
        setPrevDirection(direction);
        setIsChangingDirection(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [direction, prevDirection]);
  
  const slideVariants = {
    // Initial state when slide enters
    enter: (direction: string) => ({
      x: direction === "forward" ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    // Animated state when slide is visible
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    // Exit state when slide leaves
    exit: (direction: string) => ({
      x: direction === "forward" ? -300 : 300,
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    })
  };
  
  // If we're changing direction, briefly use a fade transition instead
  const fadeVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slideKey}
          custom={prevDirection}
          variants={isChangingDirection ? fadeVariants : slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}