// pages/user/[username].tsx
"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@radix-ui/react-avatar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import {
  CalendarDays,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import PastesTable from '@/components/paste/PastesTable';
import InfoBox from '@/components/shared/InfoBox';
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import {
  deletePaste,
  getPastesByProfile,
  getUserPasteStats,
  getUserProfile,
} from '@/lib/api';
import { IUserPaste } from '@/lib/types';
import { useAuthStore } from "@/store/useAuthStore";

dayjs.extend(advancedFormat);

export default function UserProfilePage() {
  const queryClient = useQueryClient();
  const router = useRouter()
  const [searchInput, setSearchInput] = useState("");



  const { username } = useParams();
  const { user: me } = useAuthStore();
  const isOwner = me?.username === username;
  const capitalizedUsername = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : "";




  // ▶️ Profile
  const {
    data: profile,
    isLoading: loadingProfile,
    isError: errorProfile,
  } = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserProfile(username!),
    enabled: !!username,
  });

  // ▶️ Pastes
  const {
    data: pastes,
    isLoading: loadingPastes,
    isError: errorPastes,
  } = useQuery({
    queryKey: ["userPastes", username],
    queryFn: () => getPastesByProfile(username!),
    enabled: !!username,
  });

  // ▶️ Stats (only for owner)
  const {
    data: stats,
    isLoading: loadingStats,
  } = useQuery({
    queryKey: ["userStats", username],
    queryFn: () => getUserPasteStats(username!),
    enabled: isOwner && !!username,
  });

  if (errorProfile) {
    return (
      <InfoBox variant="error">
        Couldn’t load user “{username}”. Please try again.
      </InfoBox>
    );
  }
  // simple loader
  const Skeleton = ({ className }: { className: string }) => (
    <div className={`bg-gray-700 rounded animate-pulse ${className}`} />
  );

  if (errorProfile) {
    return (
      <InfoBox variant="error">
        Couldn’t load user “{username}”. Please try again.
      </InfoBox>
    );
  }


  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePaste(id),
    onSuccess: (_data, id) => {
      // remove from cache
      queryClient.setQueryData<IUserPaste[]>(["userPastes", username], (old) =>
        old ? old.filter((p: IUserPaste) => p.id !== id) : []
      );
      // show success toast
      toast.success("Your paste has been deleted.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete paste.");
    },
  });



  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchInput.trim()) {
      router.push(
        `/user/search-self?query=${encodeURIComponent(
          searchInput.trim()
        )}`
      );
    }
  };



  return (
    <div>
      {/* —— USER INFO —— */}
      {loadingProfile ? (
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-6 text-sm">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage
                src={profile?.avatar || "/profile-default.svg"}
                alt={profile?.username}
                className="w-12 h-12 object-cover p-1 border border-zinc-500 rounded-xs"
              />
              <AvatarFallback className="bg-gray-500 text-white w-12 h-12 flex items-center justify-center border border-zinc-500">
                {profile?.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-between text-white">
              <h2 className="text-lg font-semibold">
                {capitalizedUsername}&apos;s Pastebin
              </h2>
              <div className="flex gap-3 text-gray-400 text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  {profile?.location || "Unknown"}
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays size={18} />{" "}
                  {dayjs(profile?.createdAt).format("MMM Do, YYYY")}
                </div>
                <div className="flex items-center gap-1">
                  <Star size={18} /> {profile?.starCount}
                </div>
              </div>
            </div>
          </div>

          {isOwner && (
            <Input
              placeholder="Search your own pastes…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              onKeyDown={onKeyDown}
              className="text-neutral-300 border-zinc-700 focus:outline-none focus:ring-0 text-sm w-64"
            />
          )}
        </div>
      )}


      {
        loadingPastes && (
          <div className="space-y-2 mb-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        )
      }

      {
        errorPastes && (
          <InfoBox variant="error">Failed to load pastes.</InfoBox>
        )
      }

      {
        pastes?.length === 0 && (
          <InfoBox className="text-white">Your pastebin is empty. <Link href={'/'} className="text-sky-300 hover:text-sky-600">Create your first paste.</Link></InfoBox>
        )
      }

      {
        !loadingPastes && pastes && pastes?.length !== 0 && (
          <PastesTable pastes={pastes} isOwner={isOwner} onDelete={(id) => {
            if (
              window.confirm(
                "Are you sure you want to delete this paste? This cannot be undone."
              )
            ) {
              deleteMutation.mutate(id);
            }
          }}
          />
        )
      }

      {/* —— OWNER-ONLY STATS —— */}
      {isOwner && (
        <>
          {loadingStats ? (
            <InfoBox className="mb-6">
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-3/4" />
                ))}
              </div>
            </InfoBox>
          ) : stats ? (
            <InfoBox className="items-start gap-4 text-white text-sm leading-relaxed">
              <p className="text-base">
                Hi {capitalizedUsername}, this is your personal Pastebin.
              </p>
              <p>
                Only you can see unlisted/private pastes and edit or delete them.
              </p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Your Stats:</h3>
                <ul className="space-y-1 list-inside list-disc">
                  <li>Total active pastes: {stats.totalActivePastes}</li>
                  <li>Public pastes: {stats.publicPastes}</li>
                  <li>Unlisted pastes: {stats.unlistedPastes}</li>
                  <li>Private pastes: {stats.privatePastes}</li>
                </ul>
              </div>
            </InfoBox>
          ) : null}
        </>
      )}

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
