import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { CalendarDays, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { IUserProfile } from '@/lib/types';

dayjs.extend(advancedFormat);

interface UserProfileHeaderProps {
  profile: IUserProfile;
  isOwner: boolean;
  searchInput: string;
  onSearchChange: (v: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function UserProfileHeader({
  profile, isOwner, searchInput, onSearchChange, onSearchKeyDown,
}: UserProfileHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 text-sm">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage
            src={profile.avatar || '/profile-default.svg'}
            alt={profile.username}
            className="w-12 h-12 object-cover p-1 border border-zinc-500 rounded-sm"
          />
          <AvatarFallback className="bg-zinc-700 text-white w-12 h-12 flex items-center justify-center border border-zinc-500 rounded-sm text-sm font-medium">
            {profile.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col justify-between text-white">
          <h2 className="text-lg font-semibold">
            <Link href={`/user/${profile.username}`} className="hover:text-sky-300 transition-colors">
              {profile.username}
            </Link>
            &apos;s Pastebin
          </h2>
          <div className="flex gap-3 text-zinc-400 text-xs">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{profile.location || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays size={14} />
              <span>{dayjs(profile.createdAt).format('MMM Do, YYYY')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} />
              <span>{profile.starCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {isOwner && (
        <Input
          placeholder="Search your pastes…"
          value={searchInput}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          onKeyDown={onSearchKeyDown}
          className="text-neutral-300 border-zinc-700 focus:outline-none focus:ring-0 text-sm w-56 hidden md:block"
        />
      )}
    </div>
  );
}
