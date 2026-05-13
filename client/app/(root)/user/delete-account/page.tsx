"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import InfoBox from "@/components/InfoBox";
import RelatedPages from "@/components/RelatedPages";
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
import { deleteAccount } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const authLinks = [
  { href: "/user/profile", label: "Profile" },
  { href: "/user/change-avatar", label: "Avatar" },
  { href: "/user/password", label: "Password" },
  { href: "/user/delete-account", label: "Delete Account" },
];

const formSchema = z.object({
  password: z.string().min(6, { message: "Password is required." }),
});

const DeleteAccountPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.username) return;
    setIsSubmitting(true);
    try {
      await deleteAccount(user.username);
      logout();
      router.push("/");
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
      <h1 className="text-2xl font-bold mb-3 border-zinc-600 border-b">Delete My Account</h1>

      <InfoBox variant="error">
        <p className="my-2">Are you sure you want to delete your account?</p>
        <div className="flex-col gap-2">
          <p className="font-semibold">This is extremely important!</p>
          <ul className="list-decimal px-3 py-1">
            <li>You will NOT be able to login again!</li>
            <li>You will NOT be able to register another account with this same username!</li>
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
            By clicking the &quot;DELETE MY ACCOUNT&quot; button you accept the points made above
          </li>
          <li>You will be logged out immediately and redirected to the Pastebin index page.</li>
          <li>
            We will email you a confirmation of the removal of your account (if you have a valid
            &amp; confirmed email address linked to your account).
          </li>
        </ul>
      </InfoBox>

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
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex gap-13 text-neutral-200">
                      <FormLabel className="whitespace-nowrap">
                        Password: <span className="text-red-500">*</span>
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 self-start"
                >
                  {isSubmitting ? "Deleting..." : "Delete My Account"}
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

export default DeleteAccountPage;
