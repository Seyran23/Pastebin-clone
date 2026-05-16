"use client";

import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import {
  ChevronDown,
  ClipboardList,
  KeyRound,
  LogOut,
  MessageSquareText,
  Plus,
  SearchIcon,
  UserPen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import pastebinLogo from "@/public/pastebin-logo.svg";
import { useAuthStore } from "@/store/useAuthStore";

const getDropdownItems = (username: string) => [
  { label: "My Pastes", icon: <ClipboardList size={16} />, link: `/user/${username}` },
  { label: "My Comments", icon: <MessageSquareText size={16} />, link: `/user/${username}/comments` },
  { label: "Edit Profile", icon: <UserPen size={16} />, link: "/user/profile" },
  { label: "Change Password", icon: <KeyRound size={16} />, link: "/user/password" },
];

const Header = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const isSearchPage = currentPath === "/search";

  const user = useAuthStore((state) => state.user);

  return (
    <header className="border-b border-zinc-300 dark:border-zinc-600">
      <div className="container max-w-[1340px] mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image alt="logo" src={pastebinLogo} width={50} height={50} />
            <span className="text-neutral-900 dark:text-neutral-50 text-2xl font-semibold tracking-wider uppercase">
              Pastebin
            </span>
          </Link>

          <Link href="/">
            <Button
              variant="default"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition-colors"
            >
              <Plus className="text-neutral-50" size={18} strokeWidth={2.5} />
              <span className="text-neutral-50 text-sm font-medium">New Paste</span>
            </Button>
          </Link>

          {!isSearchPage && (
            <div className="relative hidden md:flex ml-2 w-48">
              <Input
                type="text"
                placeholder="Search pastes..."
                className="pr-10 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-zinc-300 dark:border-zinc-600 text-neutral-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                  }
                }}
              />
              <SearchIcon
                strokeWidth={2.5}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-white h-4 w-4"
              />
            </div>
          )}
        </div>

        {user?.isActivated ? (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-neutral-700 dark:text-neutral-100 text-sm">{user.username}</span>
            <Avatar>
              <AvatarImage
                src={user?.avatar || "/profile-default.svg"}
                alt={user?.username}
                className="w-10 h-10 object-cover p-1 border border-zinc-500 rounded-sm"
              />
            </Avatar>
            <UserDropdown username={user.username} />
          </div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UnactivatedBanner username={user.username} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button
                variant="outline"
                className="text-neutral-700 dark:text-white bg-transparent border-zinc-300 dark:border-zinc-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="default"
                className="bg-neutral-900 dark:bg-white text-white dark:text-blue-600 hover:bg-neutral-700 dark:hover:bg-zinc-100 transition-colors text-sm"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

function UnactivatedBanner({ username }: { username: string }) {
  const { logout } = useAuthStore();
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end">
        <span className="text-neutral-100 text-sm">{username}</span>
        <span className="text-amber-400 text-xs">
          ⚠ Account not activated —{' '}
          <Link href="/resend" className="underline hover:text-amber-300">
            resend email
          </Link>
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
        onClick={() => logout()}
      >
        <LogOut size={14} />
      </Button>
    </div>
  );
}

function UserDropdown({ username }: { username: string }) {
  const { logout } = useAuthStore();
  const items = getDropdownItems(username);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem key={item.label} asChild>
              <Link href={item.link} className="flex items-center gap-2">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut size={16} />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Header;
