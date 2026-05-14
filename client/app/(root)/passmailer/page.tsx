"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import InfoBox from '@/components/shared/InfoBox';
import RelatedPages from '@/components/shared/RelatedPages';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotPassword } from '@/lib/api';
import { passmailerPageLinks } from '@/lib/constants/auth-links';


const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
});

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await forgotPassword(values.username);
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
        Pastebin Password Emailer
      </h1>

      <InfoBox>
        If you have lost or forgotten your password you can request a new one via the form below.
      </InfoBox>

      {sent && (
        <InfoBox>
          Password reset email sent! Check your inbox and follow the link.
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
                  name="username"
                  render={({ field }) => (
                    <FormItem className="flex gap-20 text-neutral-200">
                      <FormLabel>
                        Username: <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your username"
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
                  {isSubmitting ? "Sending..." : "Fetch Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <RelatedPages links={passmailerPageLinks} />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
