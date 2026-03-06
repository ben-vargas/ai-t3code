import {
  CODEX_REASONING_EFFORT_OPTIONS,
  DEFAULT_MODEL_BY_PROVIDER,
  MODEL_OPTIONS_BY_PROVIDER,
  MODEL_SLUG_ALIASES_BY_PROVIDER,
  type CodexReasoningEffort,
  type ModelSlug,
  type ProviderKind,
} from "@t3tools/contracts";

type CatalogProvider = keyof typeof MODEL_OPTIONS_BY_PROVIDER;

const MODEL_SLUG_SET_BY_PROVIDER: Record<CatalogProvider, ReadonlySet<ModelSlug>> = {
  codex: new Set(MODEL_OPTIONS_BY_PROVIDER.codex.map((option) => option.slug)),
  claudeCode: new Set(MODEL_OPTIONS_BY_PROVIDER.claudeCode.map((option) => option.slug)),
  cursor: new Set(MODEL_OPTIONS_BY_PROVIDER.cursor.map((option) => option.slug)),
};
const CURSOR_DISTINCT_MODEL_SLUGS = new Set<ModelSlug>(
  [...MODEL_SLUG_SET_BY_PROVIDER.cursor].filter(
    (slug) =>
      !MODEL_SLUG_SET_BY_PROVIDER.codex.has(slug) && !MODEL_SLUG_SET_BY_PROVIDER.claudeCode.has(slug),
  ),
);

export function getModelOptions(provider: ProviderKind = "codex") {
  return MODEL_OPTIONS_BY_PROVIDER[provider];
}

export function getDefaultModel(provider: ProviderKind = "codex"): ModelSlug {
  return DEFAULT_MODEL_BY_PROVIDER[provider];
}

export function normalizeModelSlug(
  model: string | null | undefined,
  provider: ProviderKind = "codex",
): ModelSlug | null {
  if (typeof model !== "string") {
    return null;
  }

  const trimmed = model.trim();
  if (!trimmed) {
    return null;
  }

  const aliases = MODEL_SLUG_ALIASES_BY_PROVIDER[provider] as Record<string, ModelSlug>;
  const aliased = aliases[trimmed];
  return typeof aliased === "string" ? aliased : (trimmed as ModelSlug);
}

export function resolveModelSlug(
  model: string | null | undefined,
  provider: ProviderKind = "codex",
): ModelSlug {
  const normalized = normalizeModelSlug(model, provider);
  if (!normalized) {
    return getDefaultModel(provider);
  }

  return MODEL_SLUG_SET_BY_PROVIDER[provider].has(normalized)
    ? normalized
    : getDefaultModel(provider);
}

export function resolveModelSlugForProvider(
  provider: ProviderKind,
  model: string | null | undefined,
): ModelSlug {
  return resolveModelSlug(model, provider);
}

export function inferProviderFromModel(
  model: string | null | undefined,
): ProviderKind | null {
  if (typeof model !== "string") {
    return null;
  }

  const trimmed = model.trim();
  if (!trimmed) {
    return null;
  }

  const normalizedCursor = normalizeModelSlug(trimmed, "cursor");
  if (normalizedCursor && CURSOR_DISTINCT_MODEL_SLUGS.has(normalizedCursor)) {
    return "cursor";
  }

  const normalizedClaude = normalizeModelSlug(trimmed, "claudeCode");
  if (normalizedClaude && MODEL_SLUG_SET_BY_PROVIDER.claudeCode.has(normalizedClaude)) {
    return "claudeCode";
  }

  const normalizedCodex = normalizeModelSlug(trimmed, "codex");
  if (normalizedCodex && MODEL_SLUG_SET_BY_PROVIDER.codex.has(normalizedCodex)) {
    return "codex";
  }

  if (
    trimmed.startsWith("composer-") ||
    trimmed.startsWith("gemini-") ||
    trimmed.startsWith("cursor/") ||
    trimmed.endsWith("-thinking")
  ) {
    return "cursor";
  }

  if (trimmed.startsWith("claude-") || trimmed.startsWith("claude/")) {
    return "claudeCode";
  }

  return null;
}

export function getReasoningEffortOptions(
  provider: ProviderKind = "codex",
): ReadonlyArray<CodexReasoningEffort> {
  return provider === "codex" ? CODEX_REASONING_EFFORT_OPTIONS : [];
}

export function getDefaultReasoningEffort(provider: "codex"): CodexReasoningEffort;
export function getDefaultReasoningEffort(provider: ProviderKind): CodexReasoningEffort | null;
export function getDefaultReasoningEffort(
  provider: ProviderKind = "codex",
): CodexReasoningEffort | null {
  return provider === "codex" ? "high" : null;
}

export { CODEX_REASONING_EFFORT_OPTIONS };
