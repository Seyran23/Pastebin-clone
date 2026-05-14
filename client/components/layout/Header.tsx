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

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { useAuthStore } from "@/store/useAuthStore";

const getDropdownItems = (username: string) => [
  { label: "my pastebin", icon: <ClipboardList />, link: `/user/${username}` },
  { label: "my comments", icon: <MessageSquareText />, link: `/user/${username}/comments` },
  { label: "edit profile", icon: <UserPen />, link: "/user/profile" },
  { label: "change password", icon: <KeyRound />, link: "/user/password" },
];

const Header = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const isSearchPage = currentPath === "/search";

  const user = useAuthStore((state) => state.user);

  return (
    <header className="border-b border-zinc-600 ">
      <div className="container max-w-[1340px] mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image alt="logo" src="/pastebin-logo.svg" width={40} height={40} />

            <span className="text-neutral-50 text-2xl font-semibold tracking-wider uppercase ">
              Pastebin
            </span>
          </Link>
          <Link href="/create">
            <Button
              variant="default"
              className="flex items-center justify-center gap-2 transition-all duration-200 !hover:bg-green-700"
              style={{ backgroundColor: "#61ba65" }}
            >
              <Plus
                className="text-neutral-50"
                size={25}
                style={{ strokeWidth: 6 }}
              />{" "}
              <span className="text-neutral-50 text-sm font-medium">paste</span>{" "}
            </Button>
          </Link>

          {!isSearchPage && (
            <div className="relative ml-4 w-48">
              <Input
                type="text"
                placeholder="Search pastes..."
                className="pr-10 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-borderCustom text-white placeholder:text-gray-400 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(
                      `/search?query=${encodeURIComponent(
                        e.currentTarget.value
                      )}`
                    );
                  }
                }}
              />
              <SearchIcon
                style={{ strokeWidth: 3 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white h-4 w-4"
              />
            </div>
          )}
        </div>

        {user?.isActivated ? (
          <div className="flex items-center gap-4">
            <span className="text-neutral-100">{user.username}</span>
            <Avatar>
              <AvatarImage
                src={user?.avatar || "/profile-default.svg"}
                alt={user?.username}
                className="w-10 h-10 object-cover p-1 border border-zinc-500 rounded-xs"
              />
            </Avatar>
            <DropdownMenuDemo username={user.username} />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="text-white bg-transparent border-white hover:bg-white/10 focus:bg-white/10 transition-colors uppercase font-normal text-sm "
              >
                Login
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                variant="default"
                className="bg-white text-blue-500 hover:bg-blue-500/20 hover:text-white transition-colors uppercase font-normal text-sm"
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

function DropdownMenuDemo({ username }: { username: string }) {
  const { logout } = useAuthStore();
  const items = getDropdownItems(username);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem key={item.label} asChild>
              <Link href={item.link} className="flex items-center gap-2">
                {item.icon}
                <span>{item.label.toUpperCase()}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut />
            <span>LOGOUT</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Header;
