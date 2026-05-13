
import { Facebook, X } from "lucide-react";
import Link from "next/link";

 const Footer = () => {
    const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-[150px] bg-neutral-800">
      <div className="border-t border-borderCustom py-8">
        <div className="max-w-[1340px] mx-auto px-4 flex flex-col md:flex-row justify-between gap-8">
          {/* Left Links */}
          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-4">
              <Link href="#">Create Paste</Link>
              <Link href="#">Syntax Languages</Link>
              <Link href="#">Archive</Link>
              <Link href="#">FAQ</Link>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="#">Privacy Statement</Link>
              <Link href="#">Cookie Policy</Link>
              <Link href="#">Terms of Service</Link>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4 text-muted-foreground text-xl">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <X  />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Facebook />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Notice */}
      <div className="text-xs text-muted-foreground px-4 py-6">
        <div className="max-w-[1340px] mx-auto">
          By using Pastebin.com you agree to our cookies policy to enhance your experience.  
          <br />
          Site design & logo © {currentYear} Pastebin
        </div>
      </div>
    </footer>
  );
};

export default Footer;