"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import PastesTable from '@/components/paste/PastesTable';
import InfoBox from '@/components/shared/InfoBox';
import { deletePaste, getPastesByProfile, getUserPasteStats, getUserProfile } from '@/lib/api';
import { IUserPaste } from '@/lib/types';
import { useAuthStore } from '@/store/useAuthStore';

import OwnerStatsSection from './_components/OwnerStatsSection';
import UserProfileHeader from './_components/UserProfileHeader';

const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-zinc-700 rounded animate-pulse ${className}`} />
);

export default function UserProfilePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');

  const { username } = useParams();
  const { user: me } = useAuthStore();
  const isOwner = me?.username === username;
  const usernameStr = Array.isArray(username) ? username[0] : username ?? '';

  const { data: profile, isLoading: loadingProfile, isError: errorProfile } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserProfile(usernameStr),
    enabled: !!username,
  });

  const { data: pastes, isLoading: loadingPastes, isError: errorPastes } = useQuery({
    queryKey: ['userPastes', username],
    queryFn: () => getPastesByProfile(usernameStr),
    enabled: !!username,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['userStats', username],
    queryFn: () => getUserPasteStats(usernameStr),
    enabled: isOwner && !!username,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePaste(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<IUserPaste[]>(['userPastes', username], (old) =>
        old ? old.filter((p) => p.id !== id) : [],
      );
      toast.success('Paste deleted.');
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message || 'Failed to delete paste.');
    },
  });

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      router.push(`/user/search-self?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  if (errorProfile) {
    return (
      <InfoBox variant="error">
        Couldn&apos;t load user &quot;{username}&quot;. Please try again.
      </InfoBox>
    );
  }

  return (
    <div>
      {loadingProfile ? (
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ) : profile ? (
        <UserProfileHeader
          profile={profile}
          isOwner={isOwner}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onSearchKeyDown={onSearchKeyDown}
        />
      ) : null}

      {loadingPastes && (
        <div className="space-y-2 mb-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      )}

      {errorPastes && <InfoBox variant="error">Failed to load pastes.</InfoBox>}

      {pastes?.length === 0 && (
        <InfoBox className="text-white">
          Pastebin is empty.{' '}
          <Link href="/" className="text-sky-300 hover:text-sky-400">
            Create your first paste.
          </Link>
        </InfoBox>
      )}

      {!loadingPastes && pastes && pastes.length > 0 && (
        <PastesTable
          pastes={pastes}
          isOwner={isOwner}
          onDelete={(id) => {
            if (window.confirm('Delete this paste? This cannot be undone.')) {
              deleteMutation.mutate(id);
            }
          }}
        />
      )}

      {isOwner && (
        <OwnerStatsSection username={usernameStr} stats={stats} isLoading={loadingStats} />
      )}

    </div>
  );
}
