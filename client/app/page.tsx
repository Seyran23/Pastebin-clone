"use client";

import Link from 'next/link';
import Select from 'react-select';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

import InfoBox from '@/components/shared/InfoBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNewPasteForm } from '@/hooks/useNewPasteForm';
import { exposureOptions } from '@/lib/constants/paste-options';
import { customSelectStyles } from '@/lib/constants/select-styles';
import { useAuthStore } from '@/store/useAuthStore';

export default function NewPastePage() {
  const { isAuthenticated } = useAuthStore();
  const {
    formData,
    setFormData,
    categoryOptions,
    syntaxOptions,
    expirationOptions,
    isPending,
    handleChange,
    handleSelect,
    handleSwitch,
    handleSubmit,
  } = useNewPasteForm();

  return (
    <div className="container max-w-4xl mx-auto py-6 text-neutral-200">
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-zinc-700">
          <h1 className="text-xl font-semibold">New Paste</h1>
          <div className="flex items-center gap-2">
            <Label htmlFor="toggle-highlight" className="text-sm text-zinc-400">
              Syntax Preview
            </Label>
            <Switch
              id="toggle-highlight"
              checked={formData.highlightingEnabled}
              onCheckedChange={(on) => setFormData((p) => ({ ...p, highlightingEnabled: on }))}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex flex-col gap-1">
          <Label className="text-sm text-zinc-400">Content</Label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter your paste content here…"
            className="w-full h-64 bg-zinc-900 text-white resize-none p-4 font-mono text-sm rounded-md border border-zinc-700 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Syntax Preview */}
        {formData.highlightingEnabled && (
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-zinc-400">Preview</Label>
            <div className="h-64 overflow-auto border border-zinc-700 rounded-md bg-zinc-900">
              {formData.syntax !== 'none' ? (
                <SyntaxHighlighter
                  language={formData.syntax}
                  style={dracula}
                  wrapLongLines
                  customStyle={{ padding: '1rem', minHeight: '100%', margin: 0, fontSize: '0.8rem' }}
                >
                  {formData.content || '// Your code preview will appear here'}
                </SyntaxHighlighter>
              ) : (
                <pre className="p-4 font-mono text-sm whitespace-pre-wrap break-words text-zinc-300 h-full m-0">
                  {formData.content || 'Your preview will appear here'}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-400">Paste Title</Label>
              <Input
                name="pasteName"
                value={formData.pasteName}
                onChange={handleChange}
                placeholder="Optional title"
                className="bg-zinc-900 border-zinc-700 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-400">Category</Label>
              <Select
                options={categoryOptions}
                value={categoryOptions.find((o) => o.value === formData.category) ?? null}
                styles={customSelectStyles}
                onChange={(o) => o && handleSelect('category', o)}
                placeholder="Select category…"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-400">Syntax Highlight</Label>
              <Select
                options={syntaxOptions}
                value={syntaxOptions.find((o) => o.value === formData.syntax) ?? null}
                styles={customSelectStyles}
                onChange={(o) => o && handleSelect('syntax', o)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-400">Expiration</Label>
              <Select
                options={expirationOptions}
                value={expirationOptions.find((o) => o.value === formData.expiration) ?? null}
                styles={customSelectStyles}
                onChange={(o) => o && setFormData((p) => ({ ...p, expiration: o.value }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-400">Exposure</Label>
              <Select
                options={exposureOptions}
                value={exposureOptions.find((o) => o.value === formData.exposure) ?? null}
                styles={customSelectStyles}
                onChange={(o) => o && handleSelect('exposure', o)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-zinc-400">Password Protection</Label>
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
                  className={`flex-1 bg-zinc-900 border-zinc-700 focus:outline-none focus:ring-0 ${formData.passwordProtection ? 'font-mono text-xs' : ''}`}
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
