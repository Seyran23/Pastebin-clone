import { type ClassValue,clsx } from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateRandomPassword = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

dayjs.extend(relativeTime);

export function timeAgo(date: string): string {
  const formatted = dayjs(date).fromNow();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function bytesToKilobytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatRemainingTime(ms: number): string {
  if (!ms) return "Never";

  if (ms <= 0) return "Expired";

  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / (3600 * 24));
  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;

  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;

  const minutes = Math.floor((seconds % 3600) / 60);
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;

  const secs = seconds % 60;
  return `${secs} second${secs !== 1 ? "s" : ""}`;
}
