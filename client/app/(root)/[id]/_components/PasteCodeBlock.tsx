import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { IPasteInfo } from '@/lib/types';

interface PasteCodeBlockProps {
  data: IPasteInfo;
}

export default function PasteCodeBlock({ data }: PasteCodeBlockProps) {
  return (
    <div className="flex flex-col border border-zinc-700 rounded-md mt-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-700 px-3 py-2 bg-zinc-900 text-xs">
        {data.pasteData?.syntaxHighlight?.name && (
          <span className="text-sky-300 bg-zinc-800 rounded px-2 py-0.5 font-mono">
            {data.pasteData.syntaxHighlight.name}
          </span>
        )}
        {data.pasteData?.size && (
          <span className="text-zinc-400">{data.pasteData.size} B</span>
        )}
        {data.pasteData?.category?.name && (
          <>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">{data.pasteData.category.name}</span>
          </>
        )}
        <span className="text-zinc-600 ml-auto">|</span>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1.5 items-center px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 cursor-not-allowed">
            <ThumbsUp size={14} />
            <span>{data.pasteData?.likes ?? 0}</span>
          </div>
          <div className="flex gap-1.5 items-center px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 cursor-not-allowed">
            <ThumbsDown size={14} />
            <span>{data.pasteData?.dislikes ?? 0}</span>
          </div>
        </div>
      </div>

      <SyntaxHighlighter
        language={data.pasteData?.syntaxHighlight?.name ?? 'text'}
        style={dracula}
        showLineNumbers
        customStyle={{ padding: '1rem', margin: 0, background: '#1e1e1e', borderRadius: 0, fontSize: '0.8rem' }}
      >
        {data.pasteData?.content ?? ''}
      </SyntaxHighlighter>
    </div>
  );
}
