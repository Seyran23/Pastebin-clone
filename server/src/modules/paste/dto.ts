import type { Paste } from '@/db/models/paste';
import type { PasteCategory } from '@/db/models/pastecategory';
import type { SyntaxHighlights } from '@/db/models/syntaxhighlights';

export class PasteDto {
  id: string;
  createdBy: string;
  title: string;
  linkEndpoint: string;
  exposure: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  expirationTime: number | null;
  size: number;
  category: { id: number; name: string } | null;
  syntaxHighlight: { id: number; name: string } | null;

  constructor(
    paste: Paste & { category?: PasteCategory | null; syntaxHighlight?: SyntaxHighlights | null },
  ) {
    this.id = paste.id;
    this.createdBy = paste.createdBy;
    this.title = paste.name;
    this.linkEndpoint = paste.link_endpoint;
    this.exposure = paste.exposure;
    this.createdAt = paste.createdAt;
    this.updatedAt = paste.updatedAt;
    this.expirationTime = paste.expiration_time;
    this.size = paste.size;
    this.category = paste.category
      ? { id: paste.category.id, name: paste.category.category_name }
      : null;
    this.syntaxHighlight = paste.syntaxHighlight
      ? { id: paste.syntaxHighlight.id, name: paste.syntaxHighlight.language }
      : null;
  }
}
