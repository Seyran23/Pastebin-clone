"use client";

import Editor from '@monaco-editor/react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import Select from 'react-select';

import InfoBox from '@/components/shared/InfoBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNewPasteForm } from '@/hooks/useNewPasteForm';
import { exposureOptions } from '@/lib/constants/paste-options';
import { getSelectStyles } from '@/lib/constants/select-styles';
import { useAuthStore } from '@/store/useAuthStore';

export default function NewPastePage() {
  const { theme } = useTheme();
  const selectStyles = getSelectStyles(theme !== 'light');
  const { isAuthenticated } = useAuthStore();
  const {
    formData,
    setFormData,
    categoryOptions,
    syntaxOptions,
    expirationOptions,
    syntaxLanguage,
    isPending,
    handleChange,
    handleSelect,
    handleSwitch,
    handleSubmit,
  } = useNewPasteForm();

  return (
    <div className="container max-w-4xl mx-auto py-6 text-neutral-800 dark:text-neutral-200">
      <div className="flex flex-col gap-6">


        <div className="flex items-center pb-2 border-b border-zinc-300 dark:border-zinc-700">
          <h1 className="text-xl font-semibold">New Paste</h1>
        </div>


        <div className="flex flex-col gap-1">
          <Label className="text-sm text-zinc-400">Content</Label>
          <div className="rounded-md border border-zinc-300 dark:border-zinc-700 overflow-hidden h-72">
            <Editor
              height="100%"
              language={syntaxLanguage}
              theme="vs-dark"
              value={formData.content}
              onChange={(value) => setFormData((p) => ({ ...p, content: value ?? '' }))}
              options={{
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


        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-500 dark:text-zinc-400">Paste Title</Label>
              <Input
                name="pasteName"
                value={formData.pasteName}
                onChange={handleChange}
                placeholder="Optional title"
                className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-500 dark:text-zinc-400">Category</Label>
              <Select
                instanceId="category"
                options={categoryOptions}
                value={categoryOptions.find((o) => String(o.value) === formData.category) ?? null}
                styles={selectStyles}
                onChange={(o) => o && handleSelect('category', o)}
                placeholder="Select category…"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-500 dark:text-zinc-400">Syntax Highlight</Label>
              <Select
                instanceId="syntax"
                options={syntaxOptions}
                value={syntaxOptions.find((o) => String(o.value) === formData.syntax) ?? null}
                styles={selectStyles}
                onChange={(o) => o && handleSelect('syntax', o)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-500 dark:text-zinc-400">Expiration</Label>
              <Select
                instanceId="expiration"
                options={expirationOptions}
                value={expirationOptions.find((o) => o.value === formData.expiration) ?? null}
                styles={selectStyles}
                onChange={(o) => o && setFormData((p) => ({ ...p, expiration: o.value }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-500 dark:text-zinc-400">Exposure</Label>
              <Select
                instanceId="exposure"
                options={exposureOptions}
                value={exposureOptions.find((o) => o.value === formData.exposure) ?? null}
                styles={selectStyles}
                onChange={(o) => o && handleSelect('exposure', o)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-500 dark:text-zinc-400">Password Protection</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.passwordProtection}
                  onCheckedChange={(v) => handleSwitch('passwordProtection', v)}
                />
                <Input
                  name="password"
                  placeholder="Auto-generated password"
                  disabled={!formData.passwordProtection}
                  value={formData.password}
                  onChange={handleChange}
                  className={`flex-1 bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-0 ${formData.passwordProtection ? 'font-mono text-xs' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending}
          loadingText="Creating…"
          isLoading={isPending}
          className="w-full md:w-auto md:self-end"
          size="lg"
        >
          Create Paste
        </Button>

        {!isAuthenticated && (
          <InfoBox>
            You&apos;re not logged in — pastes created as guest may not be saved to your profile.{' '}
            <Link href="/signup" className="text-sky-300 hover:text-sky-400">Sign up</Link>{' '}
            or{' '}
            <Link href="/login" className="text-sky-300 hover:text-sky-400">Log in</Link>.
          </InfoBox>
        )}
      </div>
    </div>
  );
}
