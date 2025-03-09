import { motion } from "framer-motion";
import { useRef } from "react";
import { DonationImpact } from "@/types/donation";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Share2, Download, Heart, Check, Award } from "lucide-react";
import SlideLayout from "./SlideLayout";
import CountUpAnimation from "./CountUpAnimation";

interface SummarySlideProps {
  amount: number;
  impact: DonationImpact;
  onReset: () => void;
  onShare: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function SummarySlide({ 
  amount, 
  impact, 
  onReset, 
  onShare,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: SummarySlideProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  
  // Create a list of impact achievements
  const impactItems = [
    { 
      text: `Provided ${impact.mealsProvided.toLocaleString()} nutritious meals` 
    },
    { 
      text: `Helped serve ${impact.peopleServed.toLocaleString()} people in need` 
    },
    { 
      text: `Rescued ${impact.foodRescued.toLocaleString()} lbs of food` 
    },
    { 
      text: `Prevented ${impact.co2Saved.toLocaleString()} lbs of CO2 emissions` 
    },
    {
      text: `Saved ${impact.waterSaved.toLocaleString()} gallons of water`
    }
  ];
  
  // Function to handle downloading the impact summary
  const handleDownload = () => {
    if (!summaryRef.current) return;
    
    // Create a canvas from the summary div
    const element = summaryRef.current;
    const content = element.innerHTML;
    
    // Create a document to print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to download your impact summary.');
      return;
    }
    
    // Add the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Your Impact Summary</title>
          <style>
            body {
              font-family: 'Open Sans', sans-serif;
              color: #333;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
            }
            h1, h2, h3 {
              color: #8dc53e;
              font-family: 'Spectral', serif;
            }
            .impact-header {
              text-align: center;
              margin-bottom: 2rem;
              border-bottom: 2px solid #8dc53e;
              padding-bottom: 1rem;
            }
            .impact-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 1rem;
            }
            .impact-icon {
              margin-right: 1rem;
              color: #8dc53e;
            }
            .footer {
              margin-top: 3rem;
              text-align: center;
              font-size: 0.9rem;
              color: #666;
            }
            .date {
              margin-top: 0.5rem;
              text-align: right;
              font-style: italic;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="impact-header">
            <h1>Your Community Food Share Impact</h1>
            <p>Thank you for your donation of $${amount.toLocaleString()}!</p>
            <p class="date">${new Date().toLocaleDateString()}</p>
          </div>
          
          <h2>Your donation's impact:</h2>
          
          <div class="impact-items">
            ${impactItems.map(item => `
              <div class="impact-item">
                <div class="impact-icon">✓</div>
                <div>${item.text}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>Community Food Share | Together, we're building a hunger-free community</p>
            <p>Visit us at communityfoodshare.org</p>
          </div>
          
          <div class="no-print" style="margin-top: 2rem; text-align: center;">
            <button onclick="window.print();" style="padding: 0.5rem 1rem; background: #8dc53e; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Print This Page
            </button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  // Container and item variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <SlideLayout
      title="Your Impact Summary"
      variant="summary"
      quote="Thank you for making a difference in our community!"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Certificate-style header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <Award className="h-16 w-16 text-[#8dc53e] mb-2" />
          <h3 className="text-2xl font-bold text-[#414042] text-center">
            Thank you for your donation of
          </h3>
          <p className="text-4xl font-bold text-[#8dc53e] mt-1">
            ${amount.toLocaleString()}
          </p>
        </motion.div>
        
        {/* Impact achievements */}
        <div ref={summaryRef} className="w-full">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {impactItems.map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                variants={itemVariants}
              >
                <div className="bg-[#8dc53e]/10 p-2 rounded-full mr-3">
                  <Check className="h-5 w-5 text-[#8dc53e]" />
                </div>
                <div>
                  <p className="text-base sm:text-base font-medium text-[#414042]">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            className="mt-6 bg-[#f3fae7] p-4 rounded-lg border border-[#8dc53e]/20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p className="text-[#414042]">
              <span className="font-medium">Your generosity matters.</span> Together, we're building a hunger-free community.
            </p>
          </motion.div>
        </div>
        
        {/* Action buttons */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mt-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <Button
            onClick={onReset}
            className="bg-white text-[#414042] border border-[#8dc53e]/30 hover:bg-gray-50"
            size="lg"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Donate Again
          </Button>
          
          <Button
            onClick={onShare}
            className="bg-[#0c4428] text-white hover:bg-[#0c4428]/90"
            size="lg"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Your Impact
          </Button>
          
          <Button
            onClick={handleDownload}
            className="bg-[#8dc53e] text-white hover:bg-[#7db22d]"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
