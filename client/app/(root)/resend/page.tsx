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
    { href: "/usernamemailer", label: "Forgot Username" },
  { href: "/passmailer", label: "Forgot Password" },
];

const formSchema = z.object({
    username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." }),
});

const ResendActivationMailPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    form.reset(); // Reset the form after submission
  }
  return (
    <div className="container max-w-[1024px] mx-auto  px-4 text-white">
      <h1 className="text-2xl font-bold mb-3 border-zinc-600">
      Request New Activation Email
      </h1>

      {/* Info Alert */}
      <InfoBox>
        If you have not received the registration confirmation email, you can request another one here.

      </InfoBox>

      {Object.keys(form.formState.errors).length > 0 && (
        <InfoBox variant="error">
        <div className="space-y-1">
          {Object.entries(form.formState.errors).map(([field, error]) => (
            <div key={field}>{(error  as Record<string, string>).message}</div>
          ))}
        </div>
      </InfoBox>
      )}

      {/* Content Layout */}
      <div className="flex flex-col md:flex-row gap-8   ">
        {/* Left - Form */}
        <Card className="flex-1 bg-neutral-800 border-none">
          <CardContent className=" space-y-4">
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

                <Button
                  type="submit"
                  className="px-6 py-2 bg-white text-black hover:bg-zinc-200 self-start"
                >
                  Resend Activation Mail
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

export default ResendActivationMailPage;
