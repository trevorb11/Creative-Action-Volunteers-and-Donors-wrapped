import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DonationFormValues } from "@/types/donation";
import { Checkbox } from "@/components/ui/checkbox";

interface DonationFormProps {
  onSubmit: (amount: number, email?: string) => void;
}

export default function DonationForm({ onSubmit }: DonationFormProps) {
  const formSchema = z.object({
    amount: z.coerce
      .number()
      .min(1, "Amount must be at least $1")
      .max(1000000, "Amount must be less than $1,000,000"),
    email: z.string().email("Please enter a valid email").optional(),
  });

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100, // Default value for demonstration
      email: "",
    },
  });

  const handleSubmit = (values: DonationFormValues) => {
    // Pass both amount and email (if provided) to the onSubmit handler
    onSubmit(values.amount, values.email);
  };

  // Predefined donation amounts
  const presetAmounts = [25, 50, 100, 250, 500];
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [includeEmail, setIncludeEmail] = useState(false);

  const handlePresetAmount = (amount: number) => {
    form.setValue('amount', amount);
    setSelectedAmount(amount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Preset donation amount buttons */}
        <div className="mb-4">
          <p className="text-cfs-darkGray mb-2 font-medium">Choose an amount:</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handlePresetAmount(amount)}
                className={`py-2 px-1 rounded-md text-sm md:text-base transition-all ${
                  selectedAmount === amount
                    ? 'bg-cfs-brightGreen text-white font-semibold'
                    : 'bg-gray-100 text-cfs-darkGray hover:bg-gray-200'
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="block text-lg font-medium text-cfs-darkGreen">
                Custom Amount ($)
              </FormLabel>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cfs-darkGray">
                  $
                </span>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Amount"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cfs-teal text-lg"
                    value={field.value}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    onChange={(e) => {
                      field.onChange(e);
                      setSelectedAmount(null);
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Email option with checkbox to toggle */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeEmail" 
              checked={includeEmail}
              onCheckedChange={(checked) => {
                setIncludeEmail(checked as boolean);
                if (!checked) {
                  form.setValue('email', '');
                }
              }}
            />
            <label
              htmlFor="includeEmail"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Save my donation information
            </label>
          </div>
          
          {includeEmail && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm" />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button
          type="submit"
          className="w-full py-3 px-6 bg-cfs-brightGreen hover:bg-cfs-brightGreen/90 text-white font-bold rounded-lg shadow-md transition duration-300 flex items-center justify-center space-x-2"
        >
          <span>See Your Impact</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
        
        <p className="text-xs text-center text-cfs-darkGray/70 mt-2">
          For every $1 you give, we provide 3 meals to neighbors in need
        </p>
      </form>
    </Form>
  );
}
