import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ label, value, icon: Icon, iconColor = 'text-zinc-400' }: StatCardProps) {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 flex items-center gap-4">
      <div className={`p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{value.toLocaleString()}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
