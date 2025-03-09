import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Heart } from "lucide-react";

export default function DonorLoadingScreen() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full overflow-hidden">
          <CardHeader className="text-center bg-[#8dc53e] text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Calculating Your Impact</CardTitle>
            <CardDescription className="text-white opacity-90">
              Please wait while we process your donation
            </CardDescription>
          </CardHeader>
          
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="w-24 h-24 rounded-full bg-[#e6f2ed] flex items-center justify-center"
              >
                <DollarSign className="h-12 w-12 text-[#8dc53e]" />
              </motion.div>
              
              {/* Hearts Animation */}
              <motion.div
                initial={{ opacity: 0, y: 0, x: -10 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [-20, -60],
                  x: [-10, -30]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 0.2
                }}
                className="absolute top-1/2 left-1/2"
              >
                <Heart className="h-5 w-5 text-red-400" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 0, x: 10 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [-20, -70],
                  x: [10, 20]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 0.5
                }}
                className="absolute top-1/2 left-1/2"
              >
                <Heart className="h-4 w-4 text-red-500" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 0, x: 5 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [-10, -50],
                  x: [5, 10]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 0.8
                }}
                className="absolute top-1/2 left-1/2"
              >
                <Heart className="h-3 w-3 text-red-300" />
              </motion.div>
            </div>
            
            <div className="mt-8 text-center">
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[#414042]"
              >
                Converting your generosity into community impact...
              </motion.p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-[#0c4428] text-xs">
          © Community Food Share {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}