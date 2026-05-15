"use client";

import { useQuery } from '@tanstack/react-query';
import autosize from 'autosize';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import InfoBox from '@/components/shared/InfoBox';
import { Textarea } from '@/components/ui/textarea';
import { useLike } from '@/hooks/useLike';
import { usePasteUnlock } from '@/hooks/usePasteUnlock';
import { getPaste } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

import CommentSection from './_components/CommentSection';
import LockedPasteView from './_components/LockedPasteView';
import PasteCodeBlock from './_components/PasteCodeBlock';
import PasteHeader from './_components/PasteHeader';

export default function PasteView() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['paste', id],
    queryFn: () => getPaste(id as string),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { password, setPassword, unlockError, isUnlocking, handleUnlock } = usePasteUnlock(
    id as string,
  );

  const { userVote, likes, dislikes, isPending: likePending, handleVote } = useLike(
    data?.pasteData?.id ?? '',
    data?.pasteData?.likes ?? 0,
    data?.pasteData?.dislikes ?? 0,
    data?.pasteData?.userVote ?? null,
  );

  useEffect(() => {
    const el = textareaRef.current;
    if (el) autosize(el);
    return () => { if (el) autosize.destroy(el); };
  }, [id]);

  const scrollToComment = () =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-neutral-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-zinc-800 p-6 rounded-lg text-neutral-200 text-center">
        <h1 className="text-2xl font-bold mb-2">{error.name}</h1>
        <p className="text-neutral-400">{error.message}</p>
      </div>
    );
  }

  if (data?.requiresPassword) {
    return (
      <LockedPasteView
        password={password}
        unlockError={unlockError}
        isUnlocking={isUnlocking}
        onPasswordChange={setPassword}
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <div className="bg-zinc-800 p-5 rounded-lg border border-zinc-700 text-neutral-200">
      <PasteHeader data={data!} onScrollToComment={scrollToComment} />

      {!isAuthenticated && (
        <InfoBox>
          Not a member yet?{' '}
          <Link href="/signup" className="text-sky-300 hover:text-sky-400">Sign Up</Link>
          {' '}— it unlocks many cool features!
        </InfoBox>
      )}

      <PasteCodeBlock
        data={data!}
        likes={likes}
        dislikes={dislikes}
        userVote={userVote}
        isPending={likePending}
        isAuthenticated={isAuthenticated}
        onVote={handleVote}
      />

      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2 text-zinc-300">Raw Paste Data</h3>
        <Textarea
          ref={textareaRef}
          value={data?.pasteData?.content}
          readOnly
          className="resize-none min-h-[80px] max-h-[400px] text-sm font-mono focus:outline-none bg-zinc-900 border-zinc-700 text-neutral-300"
        />
      </div>

      <CommentSection pasteId={data?.pasteData?.id ?? ''} />
    </div>
  );
}
