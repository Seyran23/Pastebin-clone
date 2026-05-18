'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/useAuthStore';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { saveAccessToken, saveRefreshToken, setUserInfo } = useAuthStore();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));

      if (!payload.exp || Date.now() / 1000 > payload.exp) {
        router.replace('/login?error=oauth_expired');
        return;
      }

      setUserInfo({
        id: payload.id,
        username: payload.username,
        email: payload.email,
        isActivated: payload.isActivated,
        hasPassword: payload.hasPassword ?? false,
        avatar: payload.avatar ?? '',
        location: payload.location ?? '',
        createdAt: payload.createdAt,
      });
    } catch {
      router.replace('/login?error=oauth_failed');
      return;
    }

    saveAccessToken(accessToken);
    saveRefreshToken(refreshToken);
    router.replace('/');
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-zinc-400">
      <Loader2 className="animate-spin w-8 h-8" />
      <p className="text-sm">Completing sign-in…</p>
    </div>
  );
}
