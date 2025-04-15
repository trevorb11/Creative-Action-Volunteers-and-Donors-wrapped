import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, DollarSign } from "lucide-react";

interface DonorWelcomeSlideProps {
  onSubmit: (amount: number, email?: string) => void;
}

// Form validation schema
const formSchema = z.object({
  amount: z.coerce.number()
    .positive("Please enter a positive amount")
    .min(5, "Minimum donation is $5")
    .max(100000, "Maximum donation is $100,000"),
  email: z.string().email("Please enter a valid email").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DonorWelcomeSlide({ onSubmit }: DonorWelcomeSlideProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100,
      email: "",
    },
  });

  function handleSubmit(values: FormValues) {
    onSubmit(values.amount, values.email ? values.email : undefined);
  }

  // Get amount for preview of impact
  const watchAmount = form.watch("amount") || 0;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full overflow-hidden">
          <CardHeader className="text-center bg-[#6A1B9A] text-white rounded-t-lg">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold">Your Creative Impact</CardTitle>
              <CardDescription className="text-white opacity-90">
                See how your generosity transforms lives through art
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div 
                className="w-24 h-24 rounded-full bg-[#f3e5f5] flex items-center justify-center"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <motion.div
                  animate={{ 
                    scale: isHovering ? [1, 1.1, 1] : 1,
                    rotate: isHovering ? [0, -10, 10, -5, 5, 0] : 0
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <DollarSign className="h-12 w-12 text-[#6A1B9A]" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#414042]">Donation Amount ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter donation amount"
                              className="border-[#6A1B9A] focus-visible:ring-[#6A1B9A]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#414042]">Email Address (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              className="border-[#6A1B9A] focus-visible:ring-[#6A1B9A]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                    className="pt-2"
                  >
                    {watchAmount >= 5 && (
                      <div className="rounded-lg bg-purple-50 p-3 mb-4 border border-purple-100">
                        <p className="text-[#414042] text-sm">
                          <span className="font-medium">Preview:</span> Your ${watchAmount} donation will support approximately {Math.round(watchAmount * 0.5)} students through Creative Action's arts education programs.
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#6A1B9A] hover:bg-[#4A148C] text-white" 
                      size="lg"
                    >
                      <Heart className="mr-2 h-5 w-5" /> See Your Creative Impact
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </motion.div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-[#6A1B9A] text-xs">
          © Creative Action {new Date().getFullYear()} • Inspiring creativity, courage, and critical thinking
        </p>
      </div>
    </div>
  );
}