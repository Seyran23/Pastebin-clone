import { ImageResponse } from 'next/og';

import { getLangColor } from '@/lib/constants/language-colors';
import type { IPasteInfo } from '@/lib/types';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchPaste(link: string): Promise<IPasteInfo | null> {
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

function truncateLines(content: string, maxLines = 5, maxChars = 58): string[] {
  return content
    .split('\n')
    .slice(0, maxLines)
    .map((line) => (line.length > maxChars ? line.slice(0, maxChars) + '…' : line || ' '));
}

function truncateTitle(title: string, max = 48): string {
  return title.length > max ? title.slice(0, max) + '…' : title;
}

export default async function PasteOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchPaste(id);

  const title = truncateTitle(data?.pasteData?.title || 'Untitled Paste');
  const author = data?.owner?.username ?? 'Anonymous';
  const lang = (data?.pasteData?.syntaxHighlight as { name?: string; language?: string } | null)?.language
    ?? (data?.pasteData?.syntaxHighlight as { name?: string } | null)?.name
    ?? null;
  const likes = data?.pasteData?.likes ?? 0;
  const views = data?.viewCount ?? 0;
  const content = data?.pasteData?.content ?? '';
  const langColor = getLangColor(lang);
  const codeLines = truncateLines(content || '// No preview available');
  const totalLines = content.split('\n').length;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#18181b',
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          padding: '48px 56px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 99, background: '#22c55e', display: 'flex' }} />
            <span style={{ color: '#52525b', fontSize: 20, letterSpacing: 1 }}>pastebin</span>
          </div>
          {lang && (
            <div style={{
              background: langColor,
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              padding: '5px 18px',
              borderRadius: 6,
              letterSpacing: 1,
              display: 'flex',
            }}>
              {lang.toUpperCase()}
            </div>
          )}
        </div>

        <div style={{
          color: '#f4f4f5',
          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: 18,
          display: 'flex',
        }}>
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a1a1aa', fontSize: 20, marginBottom: 32 }}>
          <span>by {author}</span>
          <span style={{ color: '#3f3f46' }}>·</span>
          <span>⭐ {likes}</span>
          <span style={{ color: '#3f3f46' }}>·</span>
          <span>👁 {views.toLocaleString()}</span>
        </div>

        <div style={{
          background: '#09090b',
          borderRadius: 12,
          padding: '20px 24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #27272a',
          overflow: 'hidden',
        }}>
          {codeLines.map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 4 }}>
              <span style={{ color: '#3f3f46', fontSize: 18, minWidth: 20, textAlign: 'right', fontFamily: 'monospace' }}>
                {i + 1}
              </span>
              <span style={{ color: '#e4e4e7', fontSize: 18, fontFamily: 'monospace', whiteSpace: 'pre' }}>
                {line}
              </span>
            </div>
          ))}
          {totalLines > 5 && (
            <div style={{ color: '#52525b', fontSize: 16, marginTop: 6, fontFamily: 'monospace', display: 'flex' }}>
              … {totalLines - 5} more lines
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
