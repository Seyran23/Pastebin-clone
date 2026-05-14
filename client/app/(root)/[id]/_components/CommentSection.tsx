'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CircleUserRound, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getComments, postComment } from '@/lib/api';
import type { IComment } from '@/lib/types';
import { useAuthStore } from '@/store/useAuthStore';

dayjs.extend(relativeTime);

interface CommentSectionProps {
  pasteId: string;
}

export default function CommentSection({ pasteId }: CommentSectionProps) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', pasteId],
    queryFn: () => getComments(pasteId),
    enabled: !!pasteId,
  });

  const mutation = useMutation({
    mutationFn: () => postComment(pasteId, text),
    onSuccess: (newComment) => {
      queryClient.setQueryData<IComment[]>(['comments', pasteId], (old) =>
        old ? [newComment, ...old] : [newComment],
      );
      setText('');
    },
    onError: () => toast.error('Failed to post comment.'),
  });

  const handleSubmit = () => {
    if (!text.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="mt-8 border-t border-zinc-700 pt-6">
      <h3 className="text-sm font-semibold mb-4 text-zinc-300">
        Comments {comments && comments.length > 0 && (
          <span className="text-zinc-500 font-normal">({comments.length})</span>
        )}
      </h3>

      {/* Existing comments */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin w-5 h-5 text-zinc-500" />
        </div>
      )}

      {comments && comments.length > 0 && (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <CircleUserRound size={32} className="text-zinc-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-zinc-300">{comment.author}</span>
                  <span className="text-xs text-zinc-600">{dayjs(comment.createdAt).fromNow()}</span>
                </div>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {comments?.length === 0 && !isLoading && (
        <p className="text-sm text-zinc-600 mb-6">No comments yet. Be the first!</p>
      )}

      {/* Submit form */}
      {isAuthenticated ? (
        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your comment…"
            className="resize-none min-h-[80px] max-h-[200px] text-sm bg-zinc-900 border-zinc-700 text-neutral-200 placeholder:text-zinc-500 focus:outline-none focus:ring-0"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending || !text.trim()}
              className="bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              {mutation.isPending ? 'Posting…' : 'Add Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          <a href="/login" className="text-sky-300 hover:text-sky-400">Log in</a> to leave a comment.
        </p>
      )}
    </div>
  );
}
