"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { deleteAccount } from '@/lib/api';
import { userSettingsLinks } from '@/lib/constants/auth-links';
import { useAuthStore } from "@/store/useAuthStore";

const DeleteAccountPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const formSchema = z.object({
    confirm: z.string().refine((val) => val === user?.username, {
      message: `Type your username exactly to confirm.`,
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { confirm: "" },
  });

  async function onSubmit() {
    if (!user?.username) return;
    setIsSubmitting(true);
    try {
      await deleteAccount(user.username);
      logout();
      router.push("/");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? "Something went wrong. Please try again.";
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
            By clicking the &quot;DELETE MY ACCOUNT&quot; button you accept the points made above.
          </li>
          <li>You will be logged out immediately and redirected to the Pastebin index page.</li>
          <li>
            We will email you a confirmation of the removal of your account (if you have a valid
            &amp; confirmed email address linked to your account).
          </li>
        </ul>
      </InfoBox>

      <div className="flex flex-col md:flex-row gap-8">
        <Card className="flex-1 bg-neutral-800 border-none">
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1 text-neutral-200">
                      <FormLabel className="text-sm text-zinc-400">
                        Type <span className="font-mono font-semibold text-zinc-200">{user?.username}</span> to confirm:
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={user?.username}
                          autoComplete="off"
                          className="bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-0 font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
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

        <RelatedPages links={userSettingsLinks} />
      </div>
    </div>
  );
};

export default DeleteAccountPage;
