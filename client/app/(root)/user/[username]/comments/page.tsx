'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { getUserComments, getUserProfile } from '@/lib/api';

import UserProfileHeader from '../_components/UserProfileHeader';

dayjs.extend(advancedFormat);

export default function UserCommentsPage() {
  const { username } = useParams();
  const usernameStr = Array.isArray(username) ? username[0] : username ?? '';

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['user', usernameStr],
    queryFn: () => getUserProfile(usernameStr),
    enabled: !!usernameStr,
  });

  const { data: comments, isLoading: loadingComments, isError } = useQuery({
    queryKey: ['userComments', usernameStr],
    queryFn: () => getUserComments(usernameStr),
    enabled: !!usernameStr,
  });

  return (
    <div>
      {loadingProfile ? (
        <div className="h-16 bg-zinc-700 rounded animate-pulse mb-6" />
      ) : profile ? (
        <UserProfileHeader profile={profile} isOwner={false} />
      ) : null}

      <div className="mt-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-4 pb-2 border-b border-zinc-700">
          <MessageSquare size={15} />
          Comments by {usernameStr}
          {comments && (
            <span className="text-zinc-500 font-normal">({comments.length})</span>
          )}
        </h2>

        {(loadingComments) && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-6 h-6 text-zinc-500" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-red-400 py-4">Failed to load comments.</p>
        )}

        {comments?.length === 0 && !loadingComments && (
          <p className="text-sm text-zinc-500 py-4">No comments yet.</p>
        )}

        {comments && comments.length > 0 && (
          <div className="divide-y divide-zinc-800">
            {comments.map((comment) => (
              <div key={comment.id} className="py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {comment.pasteLink ? (
                    <Link
                      href={`/${comment.pasteLink}`}
                      className="text-sky-300 hover:text-sky-400 text-sm font-medium truncate"
                    >
                      {comment.pasteTitle}
                    </Link>
                  ) : (
                    <span className="text-zinc-500 text-sm italic">[deleted paste]</span>
                  )}
                  <span className="text-xs text-zinc-600 shrink-0">
                    {dayjs(comment.createdAt).format('MMM Do, YYYY')}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
