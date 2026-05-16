import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import type { IPasteInfo } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchPasteMeta(link: string): Promise<IPasteInfo | null> {
  try {
    const res = await fetch(`${API}/api/pastes/${link}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as IPasteInfo;
    if (!data.pasteData || data.requiresPassword) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchPasteMeta(id);

  if (!data?.pasteData) {
    return { title: 'Paste Not Found — Pastebin' };
  }

  const { title, content, syntaxHighlight, likes } = data.pasteData;
  const author = data.owner?.username ?? 'Anonymous';
  const lang = syntaxHighlight?.name ?? 'Text';
  const preview = content.slice(0, 140).replace(/\n/g, ' ');

  const ogTitle = title || 'Untitled Paste';
  const ogDescription = `${lang} paste by ${author} · ${likes} likes — ${preview}`;

  return {
    title: `${ogTitle} — Pastebin`,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'article',
      authors: [author],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
    },
  };
}

export default function PasteLayout({ children }: { children: ReactNode }) {
  return children;
}
