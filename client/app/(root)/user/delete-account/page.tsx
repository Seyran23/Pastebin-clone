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
const formSchema = z.object({
  password: z.string().min(6, { message: "Password is required." }),
});
const DeleteAccountPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    form.reset(); // Reset the form after submission
  }

  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-white">
      <h1 className="text-2xl font-bold mb-3 border-zinc-600 border-b">
      Delete My Account
      </h1>

      <InfoBox variant="error" >
        <p className="my-2">Are you sure you want to delete your account?</p>
        <div className="flex-col gap-2">
          <p className="font-semibold">This is extremely important!</p>

          <ul className="list-decimal px-3 py-1">
            <li>You will NOT be able to login again!</li>
            <li>
              You will NOT be able to register another account with this same
              username!
            </li>
            <li>All your pastes will be permanently deleted! NO UNDO!</li>
            <li>You will be immediately logged out of your account!</li>
          </ul>
        </div>
        <p className="my-2 font-bold">
          DELETING YOUR ACCOUNT IS PERMANENT, AND THIS ACTION CANNOT BE UNDONE!
        </p>
      </InfoBox>

      <InfoBox>
        <ul className="list-decimal p-2">
          <li>
            By clicking the &quot;DELETE MY ACCOUNT&quot; button you accept the
            points made above
          </li>
          <li>
            You will be logged out immediately and redirected to the Pastebin
            index page.
          </li>
          <li>
            We will email you a confirmation of the removal of your account (if
            you have a valid & confirmed email address linked to your account).
          </li>
        </ul>
      </InfoBox>

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
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex gap-13 text-neutral-200">
                      <FormLabel className="whitespace-nowrap">
                        Password:{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
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
                  Delete My Account
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

export default DeleteAccountPage;
