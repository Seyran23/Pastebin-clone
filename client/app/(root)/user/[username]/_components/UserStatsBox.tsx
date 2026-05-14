import InfoBox from '@/components/shared/InfoBox';
import { IUserPastesStats } from '@/lib/types';

interface UserStatsBoxProps {
  username: string;
  stats: IUserPastesStats;
}

export default function UserStatsBox({ username, stats }: UserStatsBoxProps) {
  return (
    <InfoBox className="items-start gap-4 text-white text-sm leading-relaxed mt-4">
      <div className="space-y-3">
        <p className="text-base font-medium">Hi {username}, this is your personal Pastebin.</p>
        <p className="text-zinc-300">Only you can see unlisted/private pastes and edit or delete them.</p>
        <div>
          <h3 className="font-semibold mb-2 text-zinc-200">Your Stats</h3>
          <ul className="space-y-1 text-zinc-300">
            <li>Total active pastes: <span className="text-white font-medium">{stats.totalActivePastes}</span></li>
            <li>Public: <span className="text-white font-medium">{stats.publicPastes}</span></li>
            <li>Unlisted: <span className="text-white font-medium">{stats.unlistedPastes}</span></li>
            <li>Private: <span className="text-white font-medium">{stats.privatePastes}</span></li>
            <li>Total likes: <span className="text-white font-medium">{stats.totalLikes}</span></li>
          </ul>
        </div>
      </div>
    </InfoBox>
  );
}
