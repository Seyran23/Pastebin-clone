import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-6">
      <div className="select-none">
        <p className="text-[8rem] font-black leading-none text-zinc-700 tracking-tighter">404</p>
        <p className="text-2xl font-semibold text-zinc-300 -mt-2">Paste not found</p>
      </div>

      <p className="text-zinc-300 max-w-sm text-sm leading-relaxed">
        Looks like this paste expired, was deleted, or never existed.
        <br />
        Either way, it&apos;s gone. Like your weekend. 🫠
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2 text-sm rounded-md bg-zinc-700 text-zinc-100 hover:bg-zinc-600 transition-colors"
        >
          New Paste
        </Link>
        <Link
          href="/archive"
          className="px-5 py-2 text-sm rounded-md border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          Browse Archive
        </Link>
      </div>

      <p className="text-zinc-400 text-xs font-mono">
        err: PASTE_NOT_FOUND · status: 404 · suggestion: touch grass
      </p>
    </div>
  );
}
