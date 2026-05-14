'use client';

import { useState } from 'react';

import { queryClient } from '@/components/layout/QueryProvider';
import api from '@/lib/api/interceptor';
import { IPasteInfo } from '@/lib/types';

export function usePasteUnlock(id: string | string[]) {
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const res = await api.post<IPasteInfo>('/pastes/unlock-paste', { link: id, password });
      queryClient.setQueryData(['paste', id], res);
      setPassword('');
    } catch (err: unknown) {
      setUnlockError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Incorrect password.',
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  return { password, setPassword, unlockError, isUnlocking, handleUnlock };
}
