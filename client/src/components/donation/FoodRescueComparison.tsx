import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { Leaf, Scale, Dog, Cat, Baby, Fish, Truck, Apple, Banana, PawPrint, Beef, Milk, Coffee, Car, Citrus, CircleDot } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface FoodRescueComparisonProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

// Function to determine which comparison icon sets to use based on weight
function getComparisonIconSets(lbs: number): { 
  primary: JSX.Element,
  small: JSX.Element[],
  medium: JSX.Element[],
  large: JSX.Element[]
} {
  // Default icons for each size category  
  const smallIcons = [
    <Apple key="apple" className="h-10 w-10 text-[#8dc53e]" />,
    <Banana key="banana" className="h-10 w-10 text-[#e9c326]" />,
    <Citrus key="citrus" className="h-10 w-10 text-[#e97826]" />
  ];
  
  const mediumIcons = [
    <Cat key="cat" className="h-12 w-12 text-[#414042]" />,
    <PawPrint key="pawprint" className="h-12 w-12 text-[#665544]" />,
    <Baby key="baby" className="h-12 w-12 text-[#896645]" /> // Changed from Dog to Baby
  ];
  
  const largeIcons = [
    <Truck key="truck" className="h-14 w-14 text-[#227d7f]" />,
    <Car key="car" className="h-14 w-14 text-[#0c4428]" />,
    <Fish key="fish" className="h-14 w-14 text-[#284a75]" />
  ];
  
  // Primary icon based on weight
  let primaryIcon;
  
  if (lbs < 5) {
    primaryIcon = <Apple className="h-20 w-20 text-[#e97826]" />;
  } else if (lbs < 20) {
    primaryIcon = <Cat className="h-20 w-20 text-[#e97826]" />;
  } else if (lbs < 50) {
    primaryIcon = <Baby className="h-20 w-20 text-[#e97826]" />;
  } else if (lbs < 400) {
    primaryIcon = <Dog className="h-20 w-20 text-[#e97826]" />;
  } else if (lbs < 3000) {
    primaryIcon = <Truck className="h-20 w-20 text-[#e97826]" />;
  } else {
    primaryIcon = <Fish className="h-20 w-20 text-[#e97826]" />;
  }
  
  return {
    primary: primaryIcon,
    small: smallIcons,
    medium: mediumIcons,
    large: largeIcons
  };
}

function FoodTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "produce":
      return <Apple className="h-6 w-6 text-[#8dc53e]" />;
    case "dairy":
      return <Milk className="h-6 w-6 text-[#227d7f]" />;
    case "protein":
      return <Beef className="h-6 w-6 text-[#e97826]" />;
    default:
      return <Coffee className="h-6 w-6 text-[#414042]" />;
  }
}

export default function FoodRescueComparison({ 
  impact, 
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: FoodRescueComparisonProps) {
  // State for the current comparison icons
  const [iconSets, setIconSets] = useState<{
    primary: JSX.Element,
    small: JSX.Element[],
    medium: JSX.Element[],
    large: JSX.Element[]
  } | null>(null);
  
  // State for the active weight comparison tab
  const [activeTab, setActiveTab] = useState<'small' | 'medium' | 'large'>('medium');
  
  // State to track if more comparisons are shown
  const [showMoreComparisons, setShowMoreComparisons] = useState(false);
  
  // State to track which primary comparison to show
  const [primaryComparisonType, setPrimaryComparisonType] = useState<string>('');
  
  // Get the appropriate icon based on the amount of food rescued
  useEffect(() => {
    const lbs = impact.foodRescued;
    setIconSets(getComparisonIconSets(lbs));
    
    // Select the appropriate default tab based on weight
    if (lbs < 50) {
      setActiveTab('small');
    } else if (lbs < 500) {
      setActiveTab('medium');
    } else {
      setActiveTab('large');
    }
    
    // Determine which primary comparison to show based on the icon
    if (lbs < 5) {
      setPrimaryComparisonType('apple');
    } else if (lbs < 20) {
      setPrimaryComparisonType('cat');
    } else if (lbs < 50) {
      setPrimaryComparisonType('baby');
    } else if (lbs < 400) {
      setPrimaryComparisonType('dog');
    } else if (lbs < 3000) {
      setPrimaryComparisonType('truck');
    } else {
      setPrimaryComparisonType('fish');
    }
  }, [impact.foodRescued]);
  
  // Animation variants for the chart sections
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (custom: number) => ({
      opacity: 1,
      scale: 1,
      transition: { 
        delay: custom * 0.1 + 0.5,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    })
  };
  
  return (
    <SlideLayout
      title="Food Rescue Impact"
      variant="foodRescue"
      quote="Rescuing food reduces waste and provides nutritious meals to those in need."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Scale Icon */}
        <motion.div
          initial={{ scale: 0, y: 0 }}
          animate={{ 
            scale: 1,
            y: [0, -5, 0, -3, 0] 
          }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20, 
            delay: 0.3,
            y: {
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }
          }}
          className="mb-2 relative flex flex-col items-center"
        >
          {/* Scale with balancing animation */}
          <div className="relative h-24 w-24">
            {/* Scale base */}
            <motion.div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-6 w-14 bg-[#e97826] rounded-md" />
            
            {/* Scale pole */}
            <motion.div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-14 w-2 bg-[#e97826] rounded-t-sm" />
            
            {/* Scale beam */}
            <motion.div 
              className="absolute top-2 left-1/2 transform -translate-x-1/2 h-2 w-20 bg-[#e97826] rounded-md"
              animate={{ 
                rotate: [-10, 10, -5, 8, -10] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4, 
                ease: "easeInOut" 
              }}
            >
              {/* Left scale pan */}
              <motion.div 
                className="absolute left-0 top-1 h-8 w-8 rounded-full border-2 border-[#e97826] bg-white flex items-center justify-center"
                animate={{ 
                  y: [0, 8, 2, 6, 0] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: "easeInOut" 
                }}
              >
                <Leaf className="h-4 w-4 text-[#8dc53e]" />
              </motion.div>
              
              {/* Right scale pan */}
              <motion.div 
                className="absolute right-0 top-1 h-8 w-8 rounded-full border-2 border-[#e97826] bg-white flex items-center justify-center"
                animate={{ 
                  y: [8, 0, 6, 2, 8] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: "easeInOut" 
                }}
              >
                <Scale className="h-4 w-4 text-[#227d7f]" />
              </motion.div>
            </motion.div>
          </div>
          
          {/* Floating particles around the scale */}
          <motion.div 
            className="absolute -top-2 -right-2 h-4 w-4"
            animate={{ 
              y: [-5, 5, -3, 7, -5],
              x: [3, -3, 5, -5, 3],
              opacity: [0.7, 0.9, 0.7, 0.9, 0.7]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              ease: "easeInOut" 
            }}
          >
            <CircleDot className="text-[#8dc53e] h-full w-full" />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-0 -left-3 h-3 w-3"
            animate={{ 
              y: [3, -3, 5, -4, 3],
              x: [-3, 3, -5, 4, -3],
              opacity: [0.7, 0.9, 0.7, 0.9, 0.7]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3.5, 
              ease: "easeInOut" 
            }}
          >
            <CircleDot className="text-[#e97826] h-full w-full" />
          </motion.div>
        </motion.div>
        
        {/* Donation Impact Headline */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-lg font-semibold text-[#414042]">Your donation rescued</p>
          <div className="flex items-center justify-center">
            <motion.p 
              className="text-5xl font-bold text-[#e97826]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.7, 
                duration: 0.5,
                type: "spring",
                stiffness: 100 
              }}
            >
              <CountUpAnimation 
                value={impact.foodRescued} 
                duration={0.8} // Reduced from 2000 to 0.8 seconds for much faster animation
                className="text-5xl font-bold" 
              />
            </motion.p>
            <motion.p 
              className="ml-2 text-4xl font-bold text-[#e97826]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.3 }} // Reduced from 2.5s to 1.0s to match faster count animation
            >
              pounds
            </motion.p>
          </div>
          <p className="text-sm text-[#414042] mt-1">
            of fresh, nutritious food that would otherwise go to waste
          </p>
        </motion.div>
        
        {/* Weight Comparison Card */}
        <motion.div 
          className="bg-[#fef8f3] p-5 sm:p-6 rounded-lg border border-[#e97826]/20 shadow-sm hover:shadow-md transition-shadow w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex flex-col items-center text-center">
            <Scale className="h-10 w-10 text-[#e97826] mb-3" />
            <h3 className="text-lg font-bold text-[#414042] mb-3">Weight Comparison</h3>
            
            {/* Primary comparison (always shown) */}
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full mb-3"
              >
                {/* Display the primary comparison based on the primary icon type */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#e97826] mb-2">
                    {primaryComparisonType === 'apple' && 'Equivalent to several bags of apples'}
                    {primaryComparisonType === 'cat' && impact.houseCats}
                    {primaryComparisonType === 'baby' && impact.toddlers}
                    {primaryComparisonType === 'dog' && impact.goldenRetrievers}
                    {primaryComparisonType === 'truck' && impact.cars}
                    {primaryComparisonType === 'fish' && (impact.whaleSharkPups || impact.babyElephants)}
                  </p>
                  
                  <div className="flex justify-center space-x-3 mb-2">
                    {/* Display primary icon representation */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-center"
                    >
                      {iconSets?.primary}
                    </motion.div>
                  </div>
                  
                  <p className="text-sm text-[#414042] mt-1">
                    {primaryComparisonType === 'apple' && `About ${impact.breadLoaves}`}
                    {primaryComparisonType === 'cat' && `About ${impact.houseCats}`}
                    {primaryComparisonType === 'baby' && `That's ${impact.toddlers}`}
                    {primaryComparisonType === 'dog' && `Equals ${impact.goldenRetrievers} in weight`}
                    {primaryComparisonType === 'truck' && `Similar to ${impact.cars} in total weight`}
                    {primaryComparisonType === 'fish' && `Comparable to ${impact.blueWhaleCalf ? impact.blueWhaleCalf : impact.babyElephants}`}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* See More Comparisons button */}
            {!showMoreComparisons && (
              <motion.button
                className="mt-2 px-4 py-2 bg-[#e97826]/10 text-[#e97826] rounded-lg font-medium text-sm hover:bg-[#e97826]/20 transition-colors"
                onClick={() => setShowMoreComparisons(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                See More Comparisons
              </motion.button>
            )}
            
            {/* Additional comparisons - only shown after clicking "See More" */}
            {showMoreComparisons && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="w-full mt-4 border-t border-[#e97826]/20 pt-4"
              >
                <p className="text-sm font-medium text-[#414042] mb-3">Compare by size:</p>
                
                {/* Comparison tabs */}
                <div className="flex space-x-2 mb-4">
                  <button 
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      activeTab === 'small' 
                        ? 'bg-[#e97826] text-white font-medium' 
                        : 'bg-[#e97826]/10 text-[#414042] hover:bg-[#e97826]/20'
                    }`}
                    onClick={() => setActiveTab('small')}
                  >
                    Small
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      activeTab === 'medium' 
                        ? 'bg-[#e97826] text-white font-medium' 
                        : 'bg-[#e97826]/10 text-[#414042] hover:bg-[#e97826]/20'
                    }`}
                    onClick={() => setActiveTab('medium')}
                  >
                    Medium
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      activeTab === 'large' 
                        ? 'bg-[#e97826] text-white font-medium' 
                        : 'bg-[#e97826]/10 text-[#414042] hover:bg-[#e97826]/20'
                    }`}
                    onClick={() => setActiveTab('large')}
                  >
                    Large
                  </button>
                </div>
                
                {/* Tab content with animated transitions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    {activeTab === 'small' && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#e97826] mb-2">
                          {impact.breadLoaves}
                        </p>
                        <div className="flex justify-center space-x-2 mb-2">
                          {iconSets?.small.map((icon, i) => (
                            <motion.div 
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1, duration: 0.3 }}
                            >
                              {icon}
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-sm text-[#414042] mt-1">
                          Or about {impact.pineapples} or {impact.toddlers}
                        </p>
                      </div>
                    )}
                    
                    {activeTab === 'medium' && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#e97826] mb-2">
                          {impact.goldenRetrievers}
                        </p>
                        <div className="flex justify-center space-x-3 mb-2">
                          {iconSets?.medium.map((icon, i) => (
                            <motion.div 
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1, duration: 0.3 }}
                            >
                              {icon}
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-sm text-[#414042] mt-1">
                          Or about {impact.houseCats} or {impact.toddlers}
                        </p>
                      </div>
                    )}
                    
                    {activeTab === 'large' && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#e97826] mb-2">
                          {impact.babyElephants || "Baby Elephants"}
                        </p>
                        <div className="flex justify-center space-x-4 mb-2">
                          {iconSets?.large.map((icon, i) => (
                            <motion.div 
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1, duration: 0.3 }}
                            >
                              {icon}
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-sm text-[#414042] mt-1">
                          Or about {impact.babyElephants} or {impact.cars}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                
                {/* Button to collapse back to single view */}
                <motion.button
                  className="mt-3 px-4 py-2 bg-[#e97826]/10 text-[#e97826] rounded-lg font-medium text-sm hover:bg-[#e97826]/20 transition-colors"
                  onClick={() => setShowMoreComparisons(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Show Less
                </motion.button>
              </motion.div>
            )}
            
            <p className="text-sm text-[#414042] mt-4 italic">
              {impact.weightComparisonText || "Your donation makes a big impact."}
            </p>
          </div>
        </motion.div>
        
        {/* Food Type Distribution with Interactive Donut Chart */}
        <motion.div 
          className="bg-[#fef8f3] p-4 sm:p-5 rounded-lg border border-[#e97826]/10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <h3 className="text-center text-[#414042] font-bold mb-3">
            Food Rescued Includes
          </h3>
          
          {/* Interactive food distribution chart */}
          <div className="relative w-full h-32 mb-3">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-32 h-32">
                {/* Produce section */}
                <motion.div
                  className="absolute inset-0"
                  custom={0}
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <path
                      d={`M 50 50 L 50 0 A 50 50 0 0 1 ${50 + 50 * Math.sin((impact.producePercentage / 100) * Math.PI * 2)} ${50 - 50 * Math.cos((impact.producePercentage / 100) * Math.PI * 2)} Z`}
                      fill="#8dc53e"
                      stroke="#fff"
                      strokeWidth="1"
                    />
                  </svg>
                </motion.div>
                
                {/* Dairy section */}
                <motion.div
                  className="absolute inset-0"
                  custom={1}
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <path
                      d={`M 50 50 L ${50 + 50 * Math.sin((impact.producePercentage / 100) * Math.PI * 2)} ${50 - 50 * Math.cos((impact.producePercentage / 100) * Math.PI * 2)} A 50 50 0 0 1 ${50 + 50 * Math.sin(((impact.producePercentage + impact.dairyPercentage) / 100) * Math.PI * 2)} ${50 - 50 * Math.cos(((impact.producePercentage + impact.dairyPercentage) / 100) * Math.PI * 2)} Z`}
                      fill="#227d7f"
                      stroke="#fff"
                      strokeWidth="1"
                    />
                  </svg>
                </motion.div>
                
                {/* Protein section */}
                <motion.div
                  className="absolute inset-0"
                  custom={2}
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <path
                      d={`M 50 50 L ${50 + 50 * Math.sin(((impact.producePercentage + impact.dairyPercentage) / 100) * Math.PI * 2)} ${50 - 50 * Math.cos(((impact.producePercentage + impact.dairyPercentage) / 100) * Math.PI * 2)} A 50 50 0 0 1 ${50 + 50 * Math.sin(((impact.producePercentage + impact.dairyPercentage + impact.proteinPercentage) / 100) * Math.PI * 2)} ${50 - 50 * Math.cos(((impact.producePercentage + impact.dairyPercentage + impact.proteinPercentage) / 100) * Math.PI * 2)} Z`}
                      fill="#e97826"
                      stroke="#fff"
                      strokeWidth="1"
                    />
                  </svg>
                </motion.div>
                
                {/* Other section */}
                <motion.div
                  className="absolute inset-0"
                  custom={3}
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <path
                      d={`M 50 50 L ${50 + 50 * Math.sin(((impact.producePercentage + impact.dairyPercentage + impact.proteinPercentage) / 100) * Math.PI * 2)} ${50 - 50 * Math.cos(((impact.producePercentage + impact.dairyPercentage + impact.proteinPercentage) / 100) * Math.PI * 2)} A 50 50 0 0 1 50 0 Z`}
                      fill="#414042"
                      stroke="#fff"
                      strokeWidth="1"
                    />
                  </svg>
                </motion.div>
                
                {/* Center hole */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center">
                    <p className="text-sm font-bold text-[#414042]">100%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend for food distribution */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div 
              className="flex items-center p-2 rounded-lg bg-[#8dc53e]/20"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <FoodTypeIcon type="produce" />
              <div className="ml-2">
                <p className="text-xs font-medium text-[#414042]">Produce</p>
                <p className="text-base font-bold text-[#8dc53e]">{impact.producePercentage}%</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center p-2 rounded-lg bg-[#227d7f]/20"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <FoodTypeIcon type="dairy" />
              <div className="ml-2">
                <p className="text-xs font-medium text-[#414042]">Dairy</p>
                <p className="text-base font-bold text-[#227d7f]">{impact.dairyPercentage}%</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center p-2 rounded-lg bg-[#e97826]/20"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <FoodTypeIcon type="protein" />
              <div className="ml-2">
                <p className="text-xs font-medium text-[#414042]">Protein</p>
                <p className="text-base font-bold text-[#e97826]">{impact.proteinPercentage}%</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center p-2 rounded-lg bg-[#414042]/20"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <FoodTypeIcon type="other" />
              <div className="ml-2">
                <p className="text-xs font-medium text-[#414042]">Other</p>
                <p className="text-base font-bold text-[#414042]">{100 - impact.freshFoodPercentage}%</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
}