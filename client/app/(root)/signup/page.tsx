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
import { signupUser } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import {  useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CustomError } from "@/lib/models";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/store/useAuthStore";

const authLinks = [
  { href: "/login", label: "Already Have An Account" },
  { href: "/usernamemailer", label: "Forgot Username" },
  { href: "/passmailer", label: "Forgot Password" },
  { href: "/resend", label: "No Activation Mail" },
];

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." }),
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .min(5, { message: "Email address is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

const SignupPage = () => {
  const router = useRouter();
  const params = useSearchParams();
  const messageParam = params.get("message");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const { saveAccessToken, saveRefreshToken,  user, setUserInfo } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      form.reset();
      saveAccessToken(data.accessToken);
      saveRefreshToken(data.refreshToken);
      const decoded = jwtDecode(data.accessToken);

      setUserInfo(decoded);

      router.push("/signup?message=activation-sent");
    },
    onError: (error) => {
      const customError = error as CustomError;

      if (customError.errors.length > 0) {
        customError.errors.forEach((err) => {
          form.setError(err.field as any, { message: err.message });
        });
      } else {
        form.setError("root", { message: customError.message });
      }
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  useEffect(() => {
    if (messageParam === "activation-sent" && user && !user.isActivated) {
      setInfoMessage(
        `Hi <strong>${user?.username}</strong>, your account has been created! We have sent you an activation email has been sent to <strong>${user?.email}</strong>. Please click the link in the email to activate your account.`
      );
      // Start timeout only after showing message
      const timeout = setTimeout(() => {
        setInfoMessage(null);
        router.replace("/signup"); // Clear the message from URL after timeout
      }, 15000);

      return () => clearTimeout(timeout);
    }
  }, [messageParam, user, router]);

  return (
    <div className="container max-w-[1024px] mx-auto  px-4 text-white">
      {infoMessage ? (
        <div>
          <InfoBox variant="success" className="mb-4 border-green-700">
            <p dangerouslySetInnerHTML={{ __html: infoMessage }} />
          </InfoBox>
          <InfoBox variant="info" className="mb-4">
            It can take a few minutes to arrive. Please check your spam folder
            if you don&apos;t see it in your inbox.
          </InfoBox>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-6 border-zinc-600">
            Sign Up Page
          </h1>

          <div className="mb-4  text-xl font-light">
            Join the Pastebin community with over 4,000,000 users!
          </div>

          {Object.keys(form.formState.errors).length > 0 && (
            <InfoBox variant="error">
              <div className="space-y-1">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <div key={field}>
                    {(error as Record<string, string>).message}
                  </div>
                ))}
              </div>
            </InfoBox>
          )}

          {/* Content Layout */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left - Form */}
            <Card className="flex-1 bg-neutral-800 border-none">
              <CardContent className="p-6 space-y-4">
                {/* Social Buttons */}
                <div className="flex flex-col gap-2 mb-4">
                  <Button className="bg-[#3b5998] hover:bg-[#2d4373] text-white w-full text-sm">
                    <span className="mr-2">📘</span> Sign in with Facebook
                  </Button>
                  <Button className="bg-[#1da1f2] hover:bg-[#0d8ddb] text-white w-full text-sm">
                    <span className="mr-2">🐦</span> Sign in with Twitter
                  </Button>
                  <Button className="bg-[#dd4b39] hover:bg-[#c23321] text-white w-full text-sm">
                    <span className="mr-2">🟥</span> Sign in with Google
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-neutral-800 px-2 text-zinc-400">
                      or
                    </span>
                  </div>
                </div>

                {/* Form */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className=" flex gap-20 text-neutral-200">
                          <FormLabel>
                            Username: <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your username"
                              className="bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-0"
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                form.clearErrors("username"); // Clear the username error
                                field.onChange(e); // Also update the field value
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className=" flex gap-13 text-neutral-200">
                          <FormLabel className="whitespace-nowrap">
                            Email Address:{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Your email address"
                              className="bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-0"
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                form.clearErrors("email"); // Clear the email error
                                field.onChange(e); // Update the field value
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="flex gap-20 text-neutral-200">
                          <FormLabel>
                            Password: <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Your password"
                              className="bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-0"
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                form.clearErrors("password"); // Clear the password error
                                field.onChange(e); // Update the field value
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      isLoading={mutation.isPending}
                      loadingText="Creating..."
                      className="px-6 py-2 bg-white text-black hover:bg-zinc-200 self-start"
                    >
                      Create My Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Right - Related Pages */}
            <RelatedPages links={authLinks} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
