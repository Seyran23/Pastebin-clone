"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RelatedPages from "@/components/RelatedPages";
import InfoBox from "@/components/InfoBox";

const authLinks = [
  { href: "/user/profile", label: "Profile" },
  { href: "/user/change-avatar", label: "Avatar" },
  { href: "/user/password", label: "Password" },
  { href: "/user/delete-account", label: "Delete Account" },

];

// Validation Schema
const formSchema = z
  .object({
    currentPassword: z.string().min(6, { message: "Current password is required." }),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
    newPasswordAgain: z.string().min(6, { message: "Please confirm your new password." }),
  })
  .refine((data) => data.newPassword === data.newPasswordAgain, {
    message: "New passwords do not match.",
    path: ["newPasswordAgain"], // Specifies which field the error should be associated with
  });

const ChangePasswordPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordAgain: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    form.reset(); // Reset the form after submission
  }

  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-white">
      <h1 className="text-2xl font-bold mb-3 border-zinc-600 border-b">
        Change Your Password
      </h1>

      {/* Error Messages */}
      {Object.keys(form.formState.errors).length > 0 && (
        <InfoBox variant="error">
          <div className="space-y-1">
            {Object.entries(form.formState.errors).map(([field, error]) => (
              <div key={field}>{(error as Record<string, string>).message}</div>
            ))}
          </div>
        </InfoBox>
      )}

      {/* Content Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left - Form */}
        <Card className="flex-1 bg-neutral-800 border-none">
          <CardContent className="space-y-4">
            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Current Password */}
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

                {/* New Password */}
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

                {/* Confirm New Password */}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="px-6 py-2 bg-white text-black hover:bg-zinc-200 self-start"
                >
                  Change Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right - Related Pages */}
        <RelatedPages links={authLinks} />
      </div>
    </div>
  );
};

export default ChangePasswordPage;