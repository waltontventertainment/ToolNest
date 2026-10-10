import { ToolDefinition, ToolCategory } from './types';
import { ToolOverride } from './siteSettings';

export interface EffectiveTool extends ToolDefinition {
  isCustomized?: boolean;
  customBadge?: string;
  disabled?: boolean;
  customCode?: string;
}

/**
 * Merge base tool definition with any admin overrides
 */
export function getEffectiveTool(
  tool: ToolDefinition, 
  overrides?: Record<string, ToolOverride>
): EffectiveTool {
  if (!overrides || !overrides[tool.slug]) {
    return { ...tool, disabled: false };
  }

  const o = overrides[tool.slug];
  const isCustomized = !!(
    o.customName || 
    o.customCategory || 
    o.customDescription || 
    o.customBadge || 
    o.disabled !== undefined || 
    o.customCode
  );

  return {
    ...tool,
    name: o.customName || tool.name,
    category: (o.customCategory as ToolCategory) || tool.category,
    intro: o.customDescription || tool.intro,
    customBadge: o.customBadge,
    disabled: o.disabled || false,
    customCode: o.customCode,
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
