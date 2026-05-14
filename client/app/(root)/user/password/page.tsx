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
import { changePassword } from '@/lib/api';

const authLinks = [
  { href: "/user/profile", label: "Profile" },
  { href: "/user/change-avatar", label: "Avatar" },
  { href: "/user/password", label: "Password" },
  { href: "/user/delete-account", label: "Delete Account" },
];

const formSchema = z
  .object({
    currentPassword: z.string().min(6, { message: "Current password is required." }),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
    newPasswordAgain: z.string().min(6, { message: "Please confirm your new password." }),
  })
  .refine((data) => data.newPassword === data.newPasswordAgain, {
    message: "New passwords do not match.",
    path: ["newPasswordAgain"],
  });

const ChangePasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "", newPasswordAgain: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully.");
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
      <h1 className="text-2xl font-bold mb-3 border-zinc-600 border-b">
        Change Your Password
      </h1>

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
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem className="flex gap-13 text-neutral-200">
                      <FormLabel className="whitespace-nowrap">
                        Current Password: <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your current password"
                          className="bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-0"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="flex gap-13 text-neutral-200">
                      <FormLabel className="whitespace-nowrap">
                        New Password: <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your new password"
                          className="bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-0"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPasswordAgain"
                  render={({ field }) => (
                    <FormItem className="flex gap-13 text-neutral-200">
                      <FormLabel className="whitespace-nowrap">
                        Confirm New Password: <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Re-enter your new password"
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
                  {isSubmitting ? "Saving..." : "Change Password"}
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

export default ChangePasswordPage;
