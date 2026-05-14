"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import InfoBox from '@/components/shared/InfoBox';
import RelatedPages from '@/components/shared/RelatedPages';
import { forgotUsername } from '@/lib/api';

const authLinks = [
  { href: "/passmailer", label: "Forgot Password" },
  { href: "/resend", label: "No Activation Mail" },
];

const formSchema = z.object({
  emailAddress: z
    .string()
    .email({ message: "Invalid email address." })
    .min(5, { message: "Email address is required." }),
});

const ForgotUsernamePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { emailAddress: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await forgotUsername(values.emailAddress);
      setSent(true);
      form.reset();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-white">
      <h1 className="text-2xl font-bold mb-3 border-zinc-600">
        Pastebin Username Emailer
      </h1>

      <InfoBox>
        If you have forgotten your username you can request a reminder via the form below.
      </InfoBox>

      {sent && (
        <InfoBox>
          Username reminder sent! Check your inbox.
        </InfoBox>
      )}

      {Object.keys(form.formState.errors).length > 0 && (
        <InfoBox variant="error">
          <div className="space-y-1">
            {Object.entries(form.formState.errors).map(([field, error]) => (
              <div key={field}>{(error as Record<string, string>).message}</div>
            ))}
          </div>
        </InfoBox>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <Card className="flex-1 bg-neutral-800 border-none">
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem className="flex gap-13 text-neutral-200">
                      <FormLabel className="whitespace-nowrap">
                        Email Address: <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Your email address"
                          className="bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-0"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-white text-black hover:bg-zinc-200 self-start"
                >
                  {isSubmitting ? "Sending..." : "Fetch Username"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <RelatedPages links={authLinks} />
      </div>
    </div>
  );
};

export default ForgotUsernamePage;
