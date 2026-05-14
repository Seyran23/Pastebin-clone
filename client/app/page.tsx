"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Select from "react-select";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

import InfoBox from '@/components/shared/InfoBox';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCategories } from "@/hooks/useCategories";
import { createPaste, getExpirationTimes, getSyntaxHighlights } from '@/lib/api';
import { CreatePastePayload } from '@/lib/types';
import { generateRandomPassword } from "@/lib/utils";


const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    minHeight: "2rem",
    height: "2rem",
    fontSize: "0.875rem",
  }),
  menu: (base: any) => ({ ...base, backgroundColor: "#1f2937", zIndex: 100 }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
        ? "#374151"
        : "#1f2937",
    color: "#fff",
    fontSize: "0.875rem",
  }),
  singleValue: (base: any) => ({ ...base, color: "#fff" }),
  placeholder: (base: any) => ({ ...base, color: "#9ca3af" }),
};

const exposureOptions = [
  { value: "public", label: "Public" },
  { value: "unlisted", label: "Unlisted" },
  { value: "private", label: "Private" },
];

export default function NewPastePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    content: "",
    category: "none",
    syntax: "none",
    expiration: "never",
    exposure: "public",
    pasteName: "",
    passwordProtection: false,
    password: "",
    highlightingEnabled: false,
  });

  // fetch category list
  const { data: rawCategories = [] } = useCategories();

  // 🆕 Expect rawCategories to be array of { id, category_name }
  const categoryOptions = rawCategories.map((c: { id: number; category_name: string }) => ({
    value: c.id,
    label: c.category_name,
  }));

  // fetch syntax list
  const { data: rawSyntax = [] } = useQuery({
    queryKey: ["syntaxHighlights"],
    queryFn: () => getSyntaxHighlights(), // ← must return [{ id, language }]
    staleTime: 1000 * 60 * 10,
  });

  // 🆕 Expect rawSyntax to be array of { id, language }
  const syntaxOptions = rawSyntax.map((lang: { id: number; language: string }) => ({
    value: lang.id,
    label: lang.language,
  }));

  // add a "none" option
  syntaxOptions.unshift({ value: "none", label: "None" });




  // fetch expiration
  const { data: rawExpirationTimes = [] } = useQuery<string[]>({
    queryKey: ["expirationTimes"],
    queryFn: () => getExpirationTimes(),   // ← make sure you *call* the fn
    staleTime: 1000 * 60 * 10,
  })

  // 2) map it into { value,label } objects:
  const expirationOptions = useMemo(
    () => rawExpirationTimes.map((t) => ({ value: t, label: t })),
    [rawExpirationTimes]
  )


  const createPasteMutation = useMutation({
    mutationFn: (data: CreatePastePayload) => createPaste(data),
    onSuccess: (response) => {

      router.push(`/${response.linkEndpoint}`);
    },
    onError: (error) => {
    },
  });


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSelect = (field: string, opt: any) =>
    setFormData((p) => ({ ...p, [field]: opt.value }));

  const handleSwitch = (field: string, checked: boolean) => {
    if (field === "passwordProtection" && checked) {
      setFormData((p) => ({
        ...p,
        passwordProtection: true,
        password: generateRandomPassword(10),
      }));
    } else {
      setFormData((p) => ({ ...p, [field]: checked }));
    }
  };

  const toggleHighlight = (on: boolean) =>
    setFormData((p) => ({ ...p, highlightingEnabled: on }));

  const handleSubmit = () => {
    const payload: CreatePastePayload = {
      name: formData.pasteName,
      exposure: formData.exposure,
      syntaxHighlight: formData.syntax === "none" ? null : Number(formData.syntax),
      category: formData.category === "none" ? null : Number(formData.category),
      expirationTime: formData.expiration,
      password: formData.passwordProtection ? formData.password : null,
      content: formData.content,
    };

    createPasteMutation.mutate(payload);
  };




  return (
    <div className="container max-w-4xl mx-auto py-6 text-neutral-200">
      <div className="flex flex-col gap-6">
        {/* Header + Toggle */}
        <div className="flex justify-between items-center">
          <Label className="text-xl">New Paste</Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="toggle-highlight" className="text-sm">
              Syntax Highlight
            </Label>
            <Switch
              id="toggle-highlight"
              checked={formData.highlightingEnabled}
              onCheckedChange={toggleHighlight}
            />
          </div>
        </div>

        {/* Editor + Preview (stacked with labels) */}
        <div className="flex flex-col gap-4">
          {/* Raw Input Editor */}
          <div>
            <Label className="mb-1 block text-sm text-neutral-300">Raw Data</Label>
            <div className="h-64">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter your paste here…"
                className="w-full h-full bg-zinc-900 text-white resize-none p-4 font-mono rounded border border-zinc-600"
              />
            </div>
          </div>

          {/* Syntax Highlight Preview */}
          <div>
            <Label className="mb-1 block text-sm text-neutral-300">Preview</Label>
            <div className="h-64 overflow-auto border border-zinc-600 rounded bg-zinc-900">
              {formData.highlightingEnabled && formData.syntax !== "none" ? (
                <SyntaxHighlighter
                  language={formData.syntax}
                  style={dracula}
                  wrapLongLines
                  customStyle={{
                    padding: "1rem",
                    minHeight: "100%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    pointerEvents: "none",
                  }}
                >
                  {formData.content || "Enter your paste here…"}
                </SyntaxHighlighter>
              ) : (
                <pre className="p-4 font-mono text-sm whitespace-pre-wrap break-words text-white h-full m-0">
                  {formData.content || "Enter your paste here…"}
                </pre>
              )}
            </div>
          </div>
        </div>



        {/* Form Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-4">
              <Label>Paste Name</Label>
              <Input
                name="pasteName"
                value={formData.pasteName}
                onChange={handleChange}
                placeholder="Title (optional)"
              />
            </div>

            <div className="space-y-4">
              <Label>Category</Label>
              <Select
                options={categoryOptions}
                value={categoryOptions.find((o) => o.value === formData.category)}
                styles={customSelectStyles}
                onChange={(o) => handleSelect("category", o)}
              />
            </div>

            <div className="space-y-4">
              <Label>Syntax</Label>
              <Select
                options={syntaxOptions}
                value={syntaxOptions.find((o) => o.value === formData.syntax)}
                styles={customSelectStyles}
                onChange={(o) => handleSelect("syntax", o)}
              />
            </div>

            <div className="space-y-4">
              <Label>Expiration</Label>
              <Select
                options={expirationOptions}
                // this keeps the dropdown “controlled” by your formData.expiration
                value={expirationOptions.find(o => o.value === formData.expiration)}
                styles={customSelectStyles}
                onChange={(opt) => {
                  // opt is of shape {value: string; label: string}
                  setFormData((prev) => ({ ...prev, expiration: opt.value }))
                }}
              />

            </div>

            <div className="space-y-4">
              <Label>Exposure</Label>
              <Select
                options={exposureOptions}
                value={exposureOptions.find(
                  (o) => o.value === formData.exposure
                )}
                styles={customSelectStyles}
                onChange={(o) => handleSelect("exposure", o)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Password Protection</Label>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={formData.passwordProtection}
                  onCheckedChange={(v) => handleSwitch("passwordProtection", v)}
                />
                <Input
                  name="password"
                  placeholder="Password"
                  disabled={!formData.passwordProtection}
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createPasteMutation.isPending}
              loadingText="Creating..."
              isLoading={createPasteMutation.isPending}
            >
              Create Paste
            </Button>
          </div>
        </div>
      </div>

      <InfoBox className="mt-6">
        You’re not logged in—pastes won’t be saved.{" "}
        <Link href="/signup" className="text-blue-300">
          Sign up
        </Link>{" "}
        or{" "}
        <Link href="/login" className="text-blue-300">
          Log in
        </Link>
      </InfoBox>
    </div>
  );
}
