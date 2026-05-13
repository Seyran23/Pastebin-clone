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
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const authLinks = [
  { href: "/signup", label: "Create New Account" },
  { href: "/usernamemailer", label: "Forgot Username" },
  { href: "/passmailer", label: "Forgot Password" },
  { href: "/resend", label: "No Activation Mail" },
];

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

const LoginPage = () => {
  const router = useRouter();
  const { saveAccessToken, saveRefreshToken, setUserInfo } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      form.reset();
      saveAccessToken(data.accessToken);
      saveRefreshToken(data.refreshToken);
      setUserInfo(data.user);

      router.push(`/user/${data.user.username}`);
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-white">
      <h1 className="text-2xl font-bold mb-6">Login Page</h1>

      {/* Info Alert */}
      <InfoBox>
        To login you can use any of these social media accounts:
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
                <span className="bg-neutral-800 px-2 text-zinc-400">or</span>
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
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="px-6 py-2 bg-white text-black hover:bg-zinc-200 self-start"
                  disabled={mutation.isPending}
                  isLoading={mutation.isPending}
                  loadingText="Logging in..."
                >
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right - Related Pages */}
        {/* Right - Related Pages */}
        <RelatedPages links={authLinks} />
      </div>
    </div>
  );
};

export default LoginPage;
