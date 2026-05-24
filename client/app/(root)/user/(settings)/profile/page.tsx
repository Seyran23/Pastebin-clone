"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { updateProfile } from '@/lib/api';
import { userSettingsLinks } from '@/lib/constants/auth-links';
import { CustomError } from '@/lib/types';
import { useAuthStore } from "@/store/useAuthStore";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .min(5, { message: "Email address is required." }),
  location: z.string(),
});

const UserProfilePage = () => {
  const { user, setUserInfo } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email,
      location: user?.location,
    },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setUserInfo(data.user);
      setSuccessMessage(data.message);
    },
    onError: (error) => {
      const customError = error as unknown as CustomError;
      if (customError.errors.length > 0) {
        customError.errors.forEach((err) => {
          form.setError(err.field as keyof z.infer<typeof formSchema>, { message: err.message });
        });
      } else {
        form.setError("root", { message: customError.message });
      }
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-white">
      <h1 className="text-2xl font-bold mb-3 border-zinc-600 border-b pb-2">
        My Profile
      </h1>

      {successMessage && (
        <InfoBox variant="success" className="text-green-400">
          {successMessage}
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-white">
                <div className="flex items-center gap-4 w-full">
                  <FormLabel className="w-32 whitespace-nowrap">Username:</FormLabel>
                  <p>{user?.username}</p>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4 w-full">
                      <FormLabel className="w-32 whitespace-nowrap">Email:</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-zinc-800 border-zinc-700 focus:ring-0 text-neutral-300"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4 w-full">
                  <FormLabel className="w-32 whitespace-nowrap">Email Status:</FormLabel>
                  <p className={user?.isActivated ? "text-green-600" : "text-red-700"}>
                    {user?.isActivated ? "Verified" : "Not Activated"}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4 w-full">
                      <FormLabel className="w-32 whitespace-nowrap">Location:</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-zinc-800 border-zinc-700 focus:ring-0" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4 w-full">
                  <FormLabel className="w-32 whitespace-nowrap">Avatar:</FormLabel>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={user?.avatar || "/profile-default.svg"}
                        alt={user?.username}
                        className="w-20 h-20 object-cover p-1 border border-zinc-500 rounded-xs"
                      />
                    </Avatar>
                    <Link href="/user/change-avatar" className="text-blue-500 hover:text-blue-400">
                      Change Avatar
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={mutation.isPending}
                  loadingText="Updating..."
                  disabled={mutation.isPending}
                  className="px-6 py-2 bg-white text-black hover:bg-zinc-200 mt-4"
                >
                  Update Profile
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

export default UserProfilePage;
