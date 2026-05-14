import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import dayjs from "dayjs";
import {
  CalendarDays,
  GlobeIcon,
  LinkIcon,
  Lock,
  MapPin,
  Pencil,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import advancedFormat from "dayjs/plugin/advancedFormat";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InfoBox from '@/components/shared/InfoBox';
import { Input } from "@/components/ui/input";

const user = {
  avatarUrl: "https://i.imgur.com/6Z1pJzL.jpg",
  username: "CodeMaster123",
  location: "San Francisco, CA",
  starCount: 450,
  createdAt: "2021-03-15T08:30:00Z",
};

const comments = [
  {
    id: "paste_001",
    title: "React Hook Example",
    addedAt: "2023-09-01T10:15:00Z",
  },
  {
    id: "paste_002",
    title: "Python Flask API",
    addedAt: "2023-08-25T14:45:00Z",
  },
  {
    id: "paste_003",
    title: "CSS Grid Layout",
    addedAt: "2023-07-10T09:20:00Z",
  },
  {
    id: "paste_004",
    title: "SQL Query for Reporting",
    addedAt: "2023-06-18T16:30:00Z",
  },
  {
    id: "paste_005",
    title: "Docker Compose File",
    addedAt: "2023-05-05T12:00:00Z",
  },
  {
    id: "paste_006",
    title: "Shell Script for Automation",
    addedAt: "2023-04-22T18:10:00Z",
  },
];

dayjs.extend(advancedFormat);

const UserCommentsPage = () => {
  const capitalizedUsername =
    user.username.charAt(0).toUpperCase() + user.username.slice(1);

  const isOwner = true; // <-- Check if owner

  return (
    <div>
      {/* USER INFO */}
      <div className="flex justify-between items-center mb-6 text-sm">
        {/* Left: User Info */}
        <div className="flex gap-3">
          <div>
            <Avatar>
              <AvatarImage
                src={user.avatarUrl}
                alt={user.username}
                className="w-12 h-12 object-cover p-1 border border-zinc-500 rounded-xs"
              />
              <AvatarFallback className="bg-gray-500 text-white w-10 h-10 flex items-center justify-center border border-zinc-500">
                {user.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col justify-between text-white">
            <div className="flex gap-1 items-center">
              <h2 className="text-lg font-semibold">
                {capitalizedUsername}&apos;s Pastebin
              </h2>
            </div>

            <div className="flex gap-3 text-gray-400 text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" /> {user.location}
              </div>
              <div className="flex gap-1 items-center">
                <CalendarDays size={18} />
                {dayjs(user.createdAt).format("MMM Do, YYYY")}
              </div>
              <div className="flex items-center gap-1">
                <Star size={18} /> {user.starCount || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PASTES TABLE */}
      <Table className="text-white bg-transparent ">
        <TableHeader>
          <TableRow className=" hover:bg-zinc-700 transition-colors">
            <TableHead className="w-[300px] text-neutral-300">
              Name / Title
            </TableHead>
            <TableHead className="text-neutral-300">Added</TableHead>
            {isOwner && (
              <TableHead className="text-right text-neutral-300">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {comments.map((comment) => (
            <TableRow
              key={comment.id}
              className="text-neutral-300 hover:bg-zinc-700 transition-colors"
            >
              <TableCell className="font-medium flex items-center gap-1">
                <Link
                  href={`/paste/${comment.id}`}
                  className="text-[#81b6de]  hover:text-sky-500 transition"
                >
                  {comment.title}
                </Link>
              </TableCell>

              <TableCell>
                {dayjs(comment.addedAt).format("MMM Do, YYYY")}
              </TableCell>

              {isOwner && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button className="hover:text-red-500 cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserCommentsPage;
