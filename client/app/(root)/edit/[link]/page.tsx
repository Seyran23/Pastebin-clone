'use client';

import Editor from '@monaco-editor/react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';

import InfoBox from '@/components/shared/InfoBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getPaste, updatePaste } from '@/lib/api';
import { exposureOptions } from '@/lib/constants/paste-options';
import { getSelectStyles } from '@/lib/constants/select-styles';
import { useAuthStore } from '@/store/useAuthStore';

export default function EditPastePage() {
  const { link } = useParams<{ link: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const selectStyles = getSelectStyles(theme !== 'light');

  const [name, setName] = useState('');
  const [exposure, setExposure] = useState('public');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['paste', link],
    queryFn: () => getPaste(link),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!data?.pasteData) return;
    setName(data.pasteData.title ?? '');
    setExposure(data.pasteData.exposure ?? 'public');
  }, [data]);

  useEffect(() => {
    if (!data || isLoading) return;
    if (!user || data.pasteData?.createdBy !== user.id) {
      router.replace(`/${link}`);
    }
  }, [data, user, link, router, isLoading]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePaste(link, {
        name,
        exposure,
        password: passwordEnabled ? password || undefined : null,
      });
      toast.success('Paste updated!');
      router.push(`/${link}`);
    } catch {
      toast.error('Failed to update paste.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-neutral-400" />
      </div>
    );
  }

  if (data && user && data.pasteData?.createdBy !== user.id) {
    return null;
  }

  if (isError) {
    return <InfoBox variant="error">Paste not found.</InfoBox>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-xl font-semibold pb-2 border-b border-zinc-300 dark:border-zinc-700 mb-6">Edit Paste</h1>

      <InfoBox>
        Only the title, exposure, and password can be changed. Content is immutable once created.
      </InfoBox>

      <div className="space-y-5">
        <div className="flex flex-col gap-1">
          <Label className="text-sm text-zinc-500 dark:text-zinc-400">Title</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Paste title"
            className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm text-zinc-500 dark:text-zinc-400">Exposure</Label>
          <Select
            options={exposureOptions}
            value={exposureOptions.find((o) => o.value === exposure) ?? null}
            styles={selectStyles}
            onChange={(o) => o && setExposure(o.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm text-zinc-500 dark:text-zinc-400">Password Protection</Label>
          <div className="flex items-center gap-3">
            <Switch
              checked={passwordEnabled}
              onCheckedChange={(v) => {
                setPasswordEnabled(v);
                if (!v) setPassword('');
              }}
            />
            <Input
              type="password"
              placeholder="Set a password"
              disabled={!passwordEnabled}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm text-zinc-500 dark:text-zinc-400">Content (read-only)</Label>
          <div className="rounded-md border border-zinc-300 dark:border-zinc-700 overflow-hidden h-64">
            <Editor
              height="100%"
              language={data?.pasteData?.syntaxHighlight?.name?.toLowerCase() ?? 'plaintext'}
              theme="vs-dark"
              value={data?.pasteData?.content ?? ''}
              options={{
                readOnly: true,
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'none',
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/${link}`)}
            className="border-zinc-300 dark:border-zinc-600"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
