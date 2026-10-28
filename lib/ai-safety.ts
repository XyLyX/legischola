/** Server-side operational safeguards. Not a substitute for durable wallet metering. */
export const AI_PROVIDER_TIMEOUT_MS = 25_000;
export const AI_TUTOR_MAX_OUTPUT_TOKENS = 850;
export const AI_RESEARCH_MAX_OUTPUT_TOKENS = 1_200;

export function aiServiceEnabled(): boolean {
  return process.env.LEGISCHOLA_AI_ENABLED !== "false";
}

export function aiDisabledResponseMessage(): string {
  return "AI features are temporarily paused. Your non-AI study materials remain available.";
}

/** Cost control fails closed when the owner explicitly pauses AI calls. */
export function assertAiProviderConfigured(): string | null {
  if (!aiServiceEnabled()) return null;
  return process.env.ANTHROPIC_API_KEY || null;
}
