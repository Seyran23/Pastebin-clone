"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  ClipboardCopy,
  Download,
  Eye,
  Star,
  Clock,
  CircleUserRound,
  CalendarDays,
  MessageSquareText,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import InfoBox from "@/components/InfoBox";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import autosize from "autosize"; // Import autosize for growing textarea
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"; // Example theme
import { useQuery } from "@tanstack/react-query";
import { getPaste } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/interceptor";
import { formatRemainingTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/components/QueryProvider";
import { IPasteInfo } from "@/lib/models";

dayjs.extend(advancedFormat);

export default function PasteView() {
  const { id } = useParams();

  const { isAuthenticated } = useAuthStore();

  // const [isLiked, setIsLiked] = useState(false);
  // const [isDisliked, setIsDisliked] = useState(false);
  const textareaRef = useRef(null); // Ref for the textarea
  const [password, setPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  // const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["paste", id],
    queryFn: () => getPaste(id as string),

    staleTime: Infinity,
    cacheTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,

  });


  useEffect(() => {
    // Initialize autosize for the textarea
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }

    // Cleanup autosize on unmount
    return () => {
      if (textareaRef.current) {
        autosize.destroy(textareaRef.current);
      }
    };
  }, [id]);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setUnlockError("");
    try {
      const res = await api.post<IPasteInfo>(`/pastes/unlock-paste`, {
        link: id,
        password,
      });

      // immediately replace the ["paste", id] entry so `data` updates
      queryClient.setQueryData(["paste", id], res);
      setPassword(""); // Optional cleanup
    } catch (err) {
      setUnlockError(err?.response?.data?.message || "Incorrect password.");
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isLoading) return <div className="text-white">Loading...</div>;

  if (isError) {
    return (
      <div className="bg-[#2e2e2e] p-4 rounded-lg shadow-md text-neutral-200 text-center">
        <h1 className="text-2xl font-bold mb-2">{error.name}</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  if (data?.requiresPassword) {
    return (
      <div className="bg-[#2e2e2e] text-white p-8 max-w-md mx-auto mt-10 rounded-md shadow">
        <h1 className="text-xl font-semibold mb-4">🔒 Locked Paste</h1>
        <Input
          placeholder="Enter password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3"
        />
        {unlockError && <p className="text-red-400 mb-2">{unlockError}</p>}
        <Button
          onClick={handleUnlock}
          disabled={isUnlocking}
          className="w-full"
        >
          {isUnlocking ? "Unlocking..." : "Unlock"}
        </Button>
      </div>
    );
  }

  const scrollToComment = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight, // Scrolls to the bottom of the page
      behavior: "smooth", // Smooth scrolling animation
    });
  };

  const remainingTime = formatRemainingTime(data?.remainingTime);

  const formattedCreationTime = dayjs(data?.pasteData?.createdAt).format(
    "MMM Do, YYYY"
  );

  return (
    <div className="bg-[#2e2e2e] p-4 rounded-lg shadow-md text-neutral-200">
      {/* Header Section */}
      <div className="flex gap-3 mb-4 text-sm">
        <div>
          <Avatar>
            <AvatarImage
              src={data?.owner?.avatar || "/profile-default.svg"}
              alt={data?.owner?.username}
              className="w-12 h-12 object-cover p-1 border border-zinc-500 rounded-xs"
            />
          </Avatar>
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex gap-1 items-center">
            <h2 className="text-lg font-semibold">{data?.pasteData?.title}</h2>
          </div>

          <div className="flex gap-3 text-gray-400 text-xs">
            <div className="flex gap-1 items-center">
              <CircleUserRound size={18} />{" "}
              <Link
                href={`user/${data?.owner?.username}`}
                className="text-blue-300 hover:text-neutral-800"
              >
                <span className="text-blue-300 hover:text-neutral-500">
                  {data?.owner?.username.toUpperCase()}
                </span>
              </Link>
            </div>
            <div className="flex gap-1 items-center">
              {" "}
              <CalendarDays size={18} /> {formattedCreationTime}
            </div>
            <div className="flex items-center gap-1">
              <Star size={18} /> {data?.pasteData?.likes}
            </div>
            <div className="flex items-center gap-1">
              <Eye size={18} /> {data?.viewCount ?? 0}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={18} /> {remainingTime}
            </div>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={scrollToComment}
            >
              <MessageSquareText size={18} />
              <span className="text-blue-300 hover:text-neutral-500">
                ADD COMMENT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      {isAuthenticated && (
        <InfoBox>
          Not a member of Pastebin yet?{" "}
          <Link
            href={"/signup"}
            className="text-blue-300 hover:text-neutral-700"
          >
            Sign Up
          </Link>
          , it unlocks many cool features!
        </InfoBox>
      )}

      {/* Paste Content with Syntax Highlighting */}
      <div className="flex flex-col border border-zinc-600 rounded-sm mt-4">
        <div className="text-xs flex flex-wrap  items-center gap-3 border-b border-zinc-600 p-3 text-center">
          <span className="text-blue-300 bg-neutral-800 rounded-sm px-2 py-0.5">
            {data?.pasteData?.syntaxHighlight?.name.toUpperCase()}
          </span>
          <span>{data?.pasteData?.size}</span>
          <span>|</span>
          <span>{data?.pasteData?.category?.name}</span>
          <span>|</span>
          <div className="flex gap-2 items-center">
            {/* Thumbs Up */}
            <div
              className={`flex gap-2 items-center px-2 py-0.5 rounded-sm cursor-pointer ${true
                ? "bg-green-500 text-black"
                : "bg-neutral-800 text-blue-300"
                }`}
            // onClick={handleLike}
            >
              <ThumbsUp size={18} />
              {data?.pasteData?.likes}
            </div>

            {/* Thumbs Down */}
            <div
              className={`flex gap-2 items-center px-2 py-0.5 rounded-sm cursor-pointer ${true ? "bg-red-500 text-black" : "bg-neutral-800 text-blue-300"
                }`}
            // onClick={handleDislike}
            >
              <ThumbsDown size={18} />
              {data?.pasteData?.dislikes}
            </div>
          </div>
        </div>
        <SyntaxHighlighter
          language={data?.pasteData?.syntaxHighlight?.name} // Dynamically set language
          style={dracula} // Use Dracula theme
          showLineNumbers // Enable line numbers
          customStyle={{
            padding: "1rem",
            margin: 0,
            background: "#1e1e1e",
            borderRadius: "0 0 0.375rem 0.375rem",
          }}
        >
          {data?.pasteData?.content}
        </SyntaxHighlighter>
      </div>

      {/* RAW Paste Data */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">RAW Paste Data</h3>
        <Textarea
          ref={(el) => {
            if (el) autosize(el); // Initialize autosize when the textarea mounts
          }}
          value={data?.pasteData?.content}
          readOnly
          className="resize-none min-h-[60px] max-h-[200px] text-sm focus:outline-none bg-[#3b3b3b] text-neutral-200 placeholder:text-gray-500"
        />
      </div>

      {/* Comment Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Your Comment</h3>
        <div className="space-y-4">
          {/* Growing Textarea */}
          <Textarea
            ref={(el) => {
              if (el) autosize(el); // Initialize autosize when the textarea mounts
            }}
            placeholder="Write your comment here..."
            className="resize-none min-h-[60px] max-h-[200px] text-sm bg-[#3b3b3b] text-neutral-200 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:shadow-none"
          />

          <div className="flex justify-between">
            <div className="flex items-center gap-10">
              <label htmlFor="syntax-highlight" className="text-sm font-medium">
                Syntax Highlight:
              </label>
              <Select defaultValue="javascript">
                <SelectTrigger className="w-[180px] bg-[#3b3b3b] text-neutral-200">
                  <SelectValue placeholder="Select syntax" />
                </SelectTrigger>
                <SelectContent className="bg-[#3b3b3b] text-neutral-200">
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Comment Button */}
            <Button className="bg-neutral-500 hover:bg-neutral-600 text-white">
              Add Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
