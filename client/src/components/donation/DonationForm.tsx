import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DonationFormValues } from "@/types/donation";

interface DonationFormProps {
  onSubmit: (amount: number) => void;
}

export default function DonationForm({ onSubmit }: DonationFormProps) {
  const formSchema = z.object({
    amount: z.coerce
      .number()
      .min(1, "Amount must be at least $1")
      .max(1000000, "Amount must be less than $1,000,000"),
  });

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100, // Default value for demonstration
    },
  });

  const handleSubmit = (values: DonationFormValues) => {
    onSubmit(values.amount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="block text-lg font-medium">
                Donation Amount ($)
              </FormLabel>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-800">
                  $
                </span>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Amount"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-md transition duration-300 flex items-center justify-center space-x-2"
        >
          <span>See Your Impact</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
    </Form>
  );
}
