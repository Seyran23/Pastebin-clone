import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { CalendarDays, CircleUserRound, Clock, Eye, MessageSquareText, Star } from 'lucide-react';
import Link from 'next/link';

import { IPasteInfo } from '@/lib/types';
import { formatRemainingTime } from '@/lib/utils';

dayjs.extend(advancedFormat);

interface PasteHeaderProps {
  data: IPasteInfo;
  onScrollToComment: () => void;
}

export default function PasteHeader({ data, onScrollToComment }: PasteHeaderProps) {
  const remainingTime = formatRemainingTime(data.remainingTime ?? 0);
  const formattedDate = dayjs(data.pasteData?.createdAt).format('MMM Do, YYYY');

  return (
    <div className="flex gap-3 mb-4">
      <Avatar>
        <AvatarImage
          src={data.owner?.avatar || '/profile-default.svg'}
          alt={data.owner?.username}
          className="w-12 h-12 object-cover p-1 border border-zinc-600 rounded-sm"
        />
      </Avatar>

      <div className="flex flex-col justify-between flex-1 min-w-0">
        <h2 className="text-base font-semibold truncate">
          {data.pasteData?.title || 'Untitled'}
        </h2>

        <div className="flex flex-wrap gap-3 text-zinc-400 text-xs mt-1">
          <div className="flex items-center gap-1">
            <CircleUserRound size={14} />
            <Link href={`/user/${data.owner?.username}`} className="text-sky-300 hover:text-sky-400">
              {data.owner?.username}
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays size={14} />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} />
            <span>{data.pasteData?.likes ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{data.viewCount ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{remainingTime}</span>
          </div>
          <button
            onClick={onScrollToComment}
            className="flex items-center gap-1 text-sky-300 hover:text-sky-400 transition-colors"
          >
            <MessageSquareText size={14} />
            <span>Add Comment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
