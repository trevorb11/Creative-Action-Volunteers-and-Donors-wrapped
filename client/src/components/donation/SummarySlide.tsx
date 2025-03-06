import { motion } from "framer-motion";
import { useRef } from "react";
import { DonationImpact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Share2, Download, Heart } from "lucide-react";
import SlideLayout from "./SlideLayout";

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
  
  return (
    <SlideLayout
      title="Your Impact Summary"
      titleClassName="text-white" // Make title white
      variant="summary"
      quote="Thank you for making a difference in our community!"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <motion.div 
        ref={summaryRef}
        className="bg-white/20 p-8 rounded-xl mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-heading mb-6 text-[#8dc53e]">
          With your ${amount.toLocaleString()} donation:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {impactItems.map((item, index) => (
            <motion.div 
              key={index}
              className="flex items-start"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Heart className="h-6 w-6 mr-2 mt-1 flex-shrink-0 text-[#8dc53e]" />
              <p className="text-lg">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={onReset}
            className="px-6 py-3 bg-white text-primary font-bold rounded-lg shadow hover:bg-neutral-100 transition duration-300"
          >
            <RefreshCcw className="h-5 w-5 mr-2" />
            Donate Again
          </Button>
          
          <Button
            onClick={onShare}
            className="px-6 py-3 bg-secondary text-white font-bold rounded-lg shadow hover:bg-secondary/90 transition duration-300 flex items-center"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share Your Impact
          </Button>
          
          <Button
            onClick={handleDownload}
            className="px-6 py-3 bg-[#8dc53e] text-white font-bold rounded-lg shadow hover:bg-[#7db22d] transition duration-300 flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Summary
          </Button>
        </div>
      </motion.div>
    </SlideLayout>
  );
}
