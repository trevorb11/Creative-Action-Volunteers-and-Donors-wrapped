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
  
  // Create a list of Creative Action impact achievements
  const impactItems = [
    { 
      text: `Supported ${impact.instructionHours.toLocaleString()} hours of creative instruction` 
    },
    { 
      text: `Reached ${impact.studentsReached.toLocaleString()} students with arts education` 
    },
    { 
      text: `Funded ${impact.teachingArtistHours.toLocaleString()} teaching artist hours` 
    },
    { 
      text: `Supported ${impact.selStudents.toLocaleString()} students with social-emotional learning` 
    },
    {
      text: `Helped create ${impact.muralsSupported.toLocaleString()} community murals`
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
          <title>Your Creative Impact Summary</title>
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
              color: #6A1B9A;
              font-family: 'Arial', sans-serif;
            }
            .impact-header {
              text-align: center;
              margin-bottom: 2rem;
              border-bottom: 2px solid #6A1B9A;
              padding-bottom: 1rem;
            }
            .impact-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 1rem;
            }
            .impact-icon {
              margin-right: 1rem;
              color: #6A1B9A;
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
            <h1>Your Creative Action Impact</h1>
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
            <p>Creative Action | Where creativity meets possibility</p>
            <p>Igniting the next generation of change makers through arts education</p>
          </div>
          
          <div class="no-print" style="margin-top: 2rem; text-align: center;">
            <button onclick="window.print();" style="padding: 0.5rem 1rem; background: #6A1B9A; color: white; border: none; border-radius: 4px; cursor: pointer;">
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
          <Award className="h-16 w-16 text-[#6A1B9A] mb-2" />
          <h3 className="text-2xl font-bold text-[#414042] text-center">
            Thank you for your donation of
          </h3>
          <p className="text-4xl font-bold text-[#6A1B9A] mt-1">
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
                <div className="bg-[#6A1B9A]/10 p-2 rounded-full mr-3">
                  <Check className="h-5 w-5 text-[#6A1B9A]" />
                </div>
                <div>
                  <p className="text-base sm:text-base font-medium text-[#414042]">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            className="mt-6 bg-[#F3E5F5] p-4 rounded-lg border border-[#6A1B9A]/20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p className="text-[#414042]">
              <span className="font-medium">Your generosity matters.</span> Together, we're igniting creativity in the next generation of change makers.
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
            className="bg-white text-[#414042] border border-[#6A1B9A]/30 hover:bg-gray-50"
            size="lg"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Donate Again
          </Button>
          
          <Button
            onClick={onShare}
            className="bg-[#66CDAA] text-white hover:bg-[#50B898]"
            size="lg"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Your Impact
          </Button>
          
          <Button
            onClick={handleDownload}
            className="bg-[#6A1B9A] text-white hover:bg-[#4A148C]"
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
