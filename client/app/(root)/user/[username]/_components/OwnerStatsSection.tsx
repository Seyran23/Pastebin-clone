import { IUserPastesStats } from '@/lib/types';

import UserStatsBox from './UserStatsBox';

const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-zinc-700 rounded animate-pulse ${className}`} />
);

interface OwnerStatsSectionProps {
  username: string;
  stats: IUserPastesStats | undefined;
  isLoading: boolean;
}

export default function OwnerStatsSection({ username, stats, isLoading }: OwnerStatsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-4 w-3/4" />)}
      </div>
    );
  }

  if (!stats) return null;

  return <UserStatsBox username={username} stats={stats} />;
}
