import { Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LockedPasteViewProps {
  password: string;
  unlockError: string;
  isUnlocking: boolean;
  onPasswordChange: (v: string) => void;
  onUnlock: () => void;
}

export default function LockedPasteView({
  password, unlockError, isUnlocking, onPasswordChange, onUnlock,
}: LockedPasteViewProps) {
  return (
    <div className="bg-zinc-800 text-white p-8 max-w-md mx-auto mt-10 rounded-lg border border-zinc-700">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={18} className="text-neutral-400" />
        <h1 className="text-lg font-semibold">Locked Paste</h1>
      </div>
      <Input
        placeholder="Enter password"
        value={password}
        type="password"
        onChange={(e) => onPasswordChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onUnlock()}
        className="mb-3 bg-zinc-900 border-zinc-700"
      />
      {unlockError && <p className="text-red-400 text-sm mb-3">{unlockError}</p>}
      <Button onClick={onUnlock} disabled={isUnlocking} className="w-full">
        {isUnlocking ? 'Unlocking...' : 'Unlock'}
      </Button>
    </div>
  );
}
