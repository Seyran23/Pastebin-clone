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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RelatedPages from '@/components/shared/RelatedPages';
import InfoBox from '@/components/shared/InfoBox';
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { updateAvatar } from '@/lib/api';
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const authLinks = [
  { href: "/user/profile", label: "Profile" },
  { href: "/user/change-avatar", label: "Avatar" },
  { href: "/user/password", label: "Password" },
  { href: "/user/delete-account", label: "Delete Account" },
];

// Validation Schema
const formSchema = z.object({
  avatar: z
    .instanceof(File) // Ensure the uploaded value is a File object
    .refine(
      (file) => {
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        return validTypes.includes(file.type); // Validate file type
      },
      {
        message: "Only JPG/JPEG or PNG files are allowed.",
      }
    )
    .refine(
      (file) => file.size <= 3 * 1024 * 1024, // Limit file size to 3MB
      {
        message: "File size must be less than 3MB.",
      }
    ),
});

const ChangeAvatarPage = () => {
  const {updateUserAvatar, user} = useAuthStore()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatar: undefined, // Default value for file input
    },
  });

  const mutation = useMutation({
    mutationFn: (file: File) => updateAvatar(file),
    onSuccess: (response) => {
      updateUserAvatar(response.newAvatar)
      form.reset()
      router.push(`/user/${user?.username}`)
    },
    onError: (error: any) => {
      setTimeout(() => mutation.reset(), 5000); 
    }
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values)
  }

  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-white">
      <h1 className="text-2xl font-bold mb-3 border-zinc-600">
        Change Your Avatar
      </h1>

      {/* Info Alert */}
      <InfoBox>
        To update your avatar, select a valid JPG or PNG image. We will
        automatically resize the image for you.
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
                {/* Avatar Upload Field */}
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 text-neutral-200">
                      <FormLabel className="whitespace-nowrap">
                        Avatar: <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          {/* Hidden File Input */}
                          <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/jpeg, image/png" // Restrict file types
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file); // Update form state with the selected file
                              }
                            }}
                          />
                          {/* Custom Button */}
                          <label
                            htmlFor="avatar-upload"
                            className="px-4 py-2 bg-zinc-500 text-white rounded cursor-pointer hover:bg-zinc-400 transition-colors"
                          >
                            Choose File
                          </label>
                          {/* Selected File Name */}
                          <span className="text-neutral-300">
                            {field.value
                              ? field.value.name
                              : "No file selected"}
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="px-6 py-2 bg-white text-black hover:bg-zinc-200 self-start"
                  isLoading={mutation.isPending}
                  disabled={mutation.isPending}
                  loadingText="Updating Avatar..."
                >
                  Upload Avatar
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

export default ChangeAvatarPage;
