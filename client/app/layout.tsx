// src/app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import QueryProvider from '@/components/layout/QueryProvider';
import LastestPastes from '@/components/paste/LatestPastes';

export const metadata: Metadata = {
  title: "Pastebin Clone",
  description: "Fast and simple pasting tool",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-700 text-neutral-900">
        <QueryProvider>

          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container max-w-[1340px] mx-auto pb-8 grid grid-cols-1 md:grid-cols-[3fr_1fr] rounded-b-xl ">
              <div className="bg-neutral-800 shadow-sm p-6 ">{children}</div>

              <LastestPastes />
            </div>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
