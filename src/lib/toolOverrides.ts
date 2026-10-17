import { ToolDefinition, ToolCategory } from './types';
import { ToolOverride } from './siteSettings';
import { getEffectiveToolKeywords } from './seoKeywordsDatabase';

export interface EffectiveTool extends ToolDefinition {
  isCustomized?: boolean;
  customBadge?: string;
  disabled?: boolean;
  customCode?: string;
  customKeywords?: string[];
}

/**
 * Merge base tool definition with any admin overrides
 */
export function getEffectiveTool(
  tool: ToolDefinition, 
  overrides?: Record<string, ToolOverride>
): EffectiveTool {
  const o = overrides?.[tool.slug];
  const effectiveKeywords = getEffectiveToolKeywords(
    tool.slug, 
    tool.keywords || [], 
    o?.customKeywords
  );

  if (!o) {
    return { ...tool, disabled: false, keywords: effectiveKeywords };
  }

  const isCustomized = !!(
    o.customName || 
    o.customCategory || 
    o.customDescription || 
    o.customBadge || 
    o.disabled !== undefined || 
    o.customCode ||
    (o.customKeywords && o.customKeywords.length > 0)
  );

  return {
    ...tool,
    name: o.customName || tool.name,
    category: (o.customCategory as ToolCategory) || tool.category,
    intro: o.customDescription || tool.intro,
    customBadge: o.customBadge,
    disabled: o.disabled || false,
    customCode: o.customCode,
    customKeywords: o.customKeywords,
    keywords: effectiveKeywords,
    isCustomized
  };
}

/**
 * Filter and map all tools taking into account admin overrides
 */
export function getEffectiveTools(
  tools: ToolDefinition[], 
  overrides?: Record<string, ToolOverride>,
  includeDisabled: boolean = false
): EffectiveTool[] {
  return tools
    .map(t => getEffectiveTool(t, overrides))
    .filter(t => includeDisabled || !t.disabled);
}
