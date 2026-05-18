'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useCategories } from '@/hooks/useCategories';
import { createPaste, getExpirationTimes, getSyntaxHighlights } from '@/lib/api';
import { CreatePastePayload } from '@/lib/types';
import { generateRandomPassword } from '@/lib/utils';

export interface PasteFormState {
  content: string;
  category: string;
  syntax: string;
  expiration: string;
  exposure: string;
  pasteName: string;
  passwordProtection: boolean;
  password: string;
  highlightingEnabled: boolean;
}

const initialState: PasteFormState = {
  content: '',
  category: 'none',
  syntax: 'none',
  expiration: 'never',
  exposure: 'public',
  pasteName: '',
  passwordProtection: false,
  password: '',
  highlightingEnabled: false,
};

export function useNewPasteForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<PasteFormState>(initialState);

  const { data: rawCategories = [] } = useCategories();
  const categoryOptions = rawCategories.map((c: { id: number; category_name: string }) => ({
    value: c.id,
    label: c.category_name,
  }));

  const { data: rawSyntax = [] } = useQuery({
    queryKey: ['syntaxHighlights'],
    queryFn: getSyntaxHighlights,
    staleTime: 1000 * 60 * 10,
  });
  const syntaxOptions = useMemo(() => {
    const opts = (rawSyntax as unknown as { id: number; language: string }[]).map((lang) => ({
      value: lang.id as number | string,
      label: lang.language,
    }));
    opts.unshift({ value: 'none', label: 'None' });
    return opts;
  }, [rawSyntax]);

  const { data: rawExpirationTimes = [] } = useQuery<string[]>({
    queryKey: ['expirationTimes'],
    queryFn: getExpirationTimes,
    staleTime: 1000 * 60 * 10,
  });
  const expirationOptions = useMemo(
    () => rawExpirationTimes.map((t) => ({ value: t, label: t })),
    [rawExpirationTimes],
  );

  const createPasteMutation = useMutation({
    mutationFn: (data: CreatePastePayload) => createPaste(data),
    onSuccess: (response) => router.push(`/${response.linkEndpoint}`),
    onError: () => toast.error('Failed to create paste. Please try again.'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSelect = (field: string, opt: { value: string | number }) =>
    setFormData((p) => ({ ...p, [field]: opt.value }));

  const handleSwitch = (field: string, checked: boolean) => {
    if (field === 'passwordProtection' && checked) {
      setFormData((p) => ({ ...p, passwordProtection: true, password: generateRandomPassword(10) }));
    } else {
      setFormData((p) => ({ ...p, [field]: checked }));
    }
  };

  const handleSubmit = () => {
    if (!formData.content.trim()) {
      toast.error('Content cannot be empty.');
      return;
    }
    createPasteMutation.mutate({
      name: formData.pasteName,
      exposure: formData.exposure,
      syntaxHighlight: formData.syntax === 'none' ? null : Number(formData.syntax),
      category: formData.category === 'none' ? null : Number(formData.category),
      expirationTime: formData.expiration,
      password: formData.passwordProtection ? formData.password : null,
      content: formData.content,
    });
  };

  const syntaxLanguage = useMemo(() => {
    if (formData.syntax === 'none') return 'plaintext';
    const found = syntaxOptions.find((o) => String(o.value) === String(formData.syntax));
    return found ? found.label.toLowerCase() : 'plaintext';
  }, [formData.syntax, syntaxOptions]);

  return {
    formData,
    setFormData,
    categoryOptions,
    syntaxOptions,
    expirationOptions,
    syntaxLanguage,
    isPending: createPasteMutation.isPending,
    handleChange,
    handleSelect,
    handleSwitch,
    handleSubmit,
  };
}
