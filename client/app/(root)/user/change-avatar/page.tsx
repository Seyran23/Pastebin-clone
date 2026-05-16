"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
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
import { updateAvatar } from '@/lib/api';
import { useAuthStore } from "@/store/useAuthStore";

const authLinks = [
  { href: "/user/profile", label: "Profile" },
  { href: "/user/change-avatar", label: "Avatar" },
  { href: "/user/password", label: "Password" },
  { href: "/user/delete-account", label: "Delete Account" },
];

const formSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
      { message: "Only JPG/JPEG or PNG files are allowed." }
    )
    .refine(
      (file) => file.size <= 3 * 1024 * 1024,
      { message: "File size must be less than 3MB." }
    ),
});

const ChangeAvatarPage = () => {
  const { updateUserAvatar, user } = useAuthStore();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { avatar: undefined },
  });

  const mutation = useMutation({
    mutationFn: (file: File) => updateAvatar(file),
    onSuccess: (response) => {
      updateUserAvatar(response.newAvatar);
      form.reset();
      router.push(`/user/${user?.username}`);
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Failed to update avatar.');
      setTimeout(() => mutation.reset(), 5000);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values.avatar);
  }

  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-white">
      <h1 className="text-2xl font-bold mb-3 border-zinc-600">
        Change Your Avatar
      </h1>

      <InfoBox>
        To update your avatar, select a valid JPG or PNG image. We will
        automatically resize the image for you.
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
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 text-neutral-200">
                      <FormLabel className="whitespace-nowrap">
                        Avatar: <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/jpeg, image/png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) field.onChange(file);
                            }}
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="px-4 py-2 bg-zinc-500 text-white rounded cursor-pointer hover:bg-zinc-400 transition-colors"
                          >
                            Choose File
                          </label>
                          <span className="text-neutral-300">
                            {field.value ? field.value.name : "No file selected"}
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

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

        <RelatedPages links={authLinks} />
      </div>
    </div>
  );
};

export default ChangeAvatarPage;
