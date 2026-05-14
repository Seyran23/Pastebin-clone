import { Facebook, X } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-neutral-800">
      <div className="border-t border-zinc-700 py-8">
        <div className="max-w-[1340px] mx-auto px-4 flex flex-col md:flex-row justify-between gap-8">
          <div className="flex flex-col gap-4 text-sm text-neutral-400">
            <div className="flex flex-wrap gap-4">
              <Link href="/create" className="hover:text-neutral-200 transition-colors">Create Paste</Link>
              <Link href="/archive" className="hover:text-neutral-200 transition-colors">Archive</Link>
              <Link href="#" className="hover:text-neutral-200 transition-colors">FAQ</Link>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="#" className="hover:text-neutral-200 transition-colors">Privacy Statement</Link>
              <Link href="#" className="hover:text-neutral-200 transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-200 transition-colors">
              <X size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-200 transition-colors">
              <Facebook size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="text-xs text-neutral-500 px-4 py-4">
        <div className="max-w-[1340px] mx-auto">
          By using Pastebin you agree to our cookies policy to enhance your experience.
          <br />
          Site design &amp; logo &copy; {currentYear} Pastebin
        </div>
      </div>
    </footer>
  );
};

export default Footer;
