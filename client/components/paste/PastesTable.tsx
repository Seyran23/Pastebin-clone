// components/PastesTable.tsx
"use client";

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import {
  GlobeIcon,
  LinkIcon,
  Lock,
  Pencil,
  X as XIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IUserPaste } from '@/lib/types';

dayjs.extend(advancedFormat);

interface PastesTableProps {
  pastes: IUserPaste[];
  isOwner: boolean;
  onDelete?: (id: string) => void;
}

export default function PastesTable({
  pastes = [],
  isOwner,
  onDelete,
}: PastesTableProps) {
  return (
    <Table className="text-white bg-transparent mb-6">
      <TableHeader>
        <TableRow className="hover:bg-zinc-700 transition-colors">
          <TableHead className="w-[300px] text-neutral-300">
            Name / Title
          </TableHead>
          <TableHead className="text-neutral-300">Added At</TableHead>
          <TableHead className="text-neutral-300">Expires</TableHead>
          <TableHead className="text-neutral-300">Comments</TableHead>
          <TableHead className="text-right text-neutral-300">
            Syntax
          </TableHead>
          {isOwner && (
            <TableHead className="text-right w-[150px] text-neutral-300">
              Actions
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {pastes.map((paste) => (
          <TableRow
            key={paste.id}
            className="text-neutral-300 hover:bg-zinc-700 transition-colors"
          >
            <TableCell className="font-medium flex items-center gap-1">
              {paste.exposure === "public" && (
                <GlobeIcon className="w-4 h-4 text-neutral-400" />
              )}
              {paste.exposure === "unlisted" && (
                <LinkIcon className="w-4 h-4 rotate-[-90deg] text-neutral-400" />
              )}
              {paste.exposure === "private" && (
                <Lock className="w-4 h-4 text-neutral-400" />
              )}
              <Link
                href={`/${paste.link}`}
                className="text-sky-300 hover:text-sky-400 transition"
              >
                {paste.name}
              </Link>
            </TableCell>
            <TableCell>
              {dayjs(paste.addedAt).format("MMM Do, YYYY")}
            </TableCell>
            <TableCell>
              {paste.expires
                ? dayjs(paste.expires).format("MMM Do, YYYY")
                : "Never"}
            </TableCell>
            <TableCell>{paste.comments}</TableCell>
            <TableCell className="text-right">{paste.syntax}</TableCell>
            {isOwner && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/edit/${paste.link}`}
                    className="hover:text-green-400"
                    title="Edit paste"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => onDelete?.(paste.id)}
                    className="hover:text-red-500"
                    title="Delete paste"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
