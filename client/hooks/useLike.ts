'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { toggleLike } from '@/lib/api';

export function useLike(pasteId: string, initialLikes: number, initialDislikes: number) {
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (pasteId) {
      setLikes(initialLikes);
      setDislikes(initialDislikes);
      setUserVote(null);
    }
  }, [pasteId]);

  const handleVote = async (isLike: boolean) => {
    if (isPending || userVote === isLike) return;

    const prevVote = userVote;
    const prevLikes = likes;
    const prevDislikes = dislikes;

    setUserVote(isLike);
    if (isLike) {
      setLikes((n) => n + 1);
      if (prevVote === false) setDislikes((n) => n - 1);
    } else {
      setDislikes((n) => n + 1);
      if (prevVote === true) setLikes((n) => n - 1);
    }

    setIsPending(true);
    try {
      await toggleLike(pasteId, isLike);
    } catch {
      setUserVote(prevVote);
      setLikes(prevLikes);
      setDislikes(prevDislikes);
      toast.error('Failed to update vote. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return { userVote, likes, dislikes, isPending, handleVote };
}
