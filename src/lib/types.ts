import { LucideIcon } from 'lucide-react';
import React from 'react';

export type ToolCategory = 
  | 'AI'
  | 'Text' 
  | 'Developer' 
  | 'Converters' 
  | 'Generators' 
  | 'QR & Barcode' 
  | 'Color & Image' 
  | 'Calculators' 
  | 'SEO' 
  | 'Utility'
  | 'PDF';

export interface ToolDefinition {
  slug: string; 
  name: string; 
  category: ToolCategory; 
  icon: LucideIcon;
  keywords: string[]; 
  metaTitle: string; 
  metaDescription: string;
  intro: string;            // 60-120 words unique copy
  howTo: string[];          // 4-6 numbered steps
  faq: { q: string; a: string }[];  // 3-5 Q&A per tool
  Component: React.FC;
}
