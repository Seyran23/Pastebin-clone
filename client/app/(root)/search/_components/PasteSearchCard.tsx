import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { CalendarDays, CircleUserRound, Eye, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { bytesToKilobytes } from '@/lib/utils';

dayjs.extend(advancedFormat);

interface PasteSearchCardProps {
  paste: {
    id: string;
    name: string;
    link: string;
    size: number;
    createdAt: string;
    category: string | null;
    syntaxHighlight: string | null;
    author: string | null;
    preview: string | null;
    likes: number;
    viewCount: number;
    commentsCount: number;
  };
}

export default function PasteSearchCard({ paste }: PasteSearchCardProps) {
  return (
    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold truncate">{paste.name}</h2>
        <Link
          href={`/${paste.link}`}
          className="text-xs px-3 py-1 border border-zinc-600 rounded text-zinc-300 hover:border-zinc-400 hover:text-white transition-colors shrink-0"
        >
          View
        </Link>
      </div>

      <div className="flex gap-4 text-zinc-400 text-xs mb-3 flex-wrap">
        <div className="flex items-center gap-1">
          <CircleUserRound size={14} />
          {paste.author ? (
            <Link href={`/user/${paste.author}`} className="hover:text-zinc-200 transition-colors">
              {paste.author}
            </Link>
          ) : (
            <span>Anonymous</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <CalendarDays size={14} />
          <span>{dayjs(paste.createdAt).format('MMM Do, YYYY')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={14} />
          <span>{paste.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye size={14} />
          <span>{paste.viewCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare size={14} />
          <span>{paste.commentsCount}</span>
        </div>
      </div>

      <div className="flex flex-col border border-zinc-700 rounded overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-700 px-3 py-1.5 bg-zinc-900 text-xs">
          {paste.syntaxHighlight && (
            <span className="text-sky-300 bg-zinc-800 rounded px-2 py-0.5 font-mono">
              {paste.syntaxHighlight}
            </span>
          )}
          <span className="text-zinc-400">{bytesToKilobytes(paste.size)}</span>
          {paste.category && (
            <>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">{paste.category}</span>
            </>
          )}
        </div>
        <SyntaxHighlighter
          language={paste.syntaxHighlight ?? 'text'}
          style={dracula}
          showLineNumbers
          customStyle={{ padding: '0.75rem', margin: 0, maxHeight: '160px', overflow: 'hidden', background: '#1e1e1e', fontSize: '0.75rem' }}
        >
          {paste.preview ?? ''}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
