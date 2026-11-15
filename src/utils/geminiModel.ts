export const DEFAULT_PRIMARY_GEMINI_MODEL = 'gemini-4-hydrogen';
export const FALLBACK_GEMINI_MODEL = 'gemini-2.5-flash';

export interface GeminiModelConfig {
  primaryModel: string;
  fallbackModel: string;
}

export function resolveGeminiModelConfig(envModel?: string): GeminiModelConfig {
  const trimmed = typeof envModel === 'string' ? envModel.trim() : '';
  return {
    primaryModel: trimmed || DEFAULT_PRIMARY_GEMINI_MODEL,
    fallbackModel: FALLBACK_GEMINI_MODEL,
  };
}

/**
 * Determines whether a Gemini API error likely indicates an unsupported or unavailable
 * model alias/config so the server can perform a single automatic retry on the fallback model.
 */
export function shouldRetryWithFallbackModel(
  error: unknown,
  attemptedModel: string,
  fallbackModel = FALLBACK_GEMINI_MODEL
): boolean {
  if (!attemptedModel || attemptedModel === fallbackModel) {
    return false;
  }

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : String(error ?? '');
  const msg = rawMessage.toLowerCase();

  if (!msg) return false;

  // Do not retry auth errors or quota/rate limits where model switching will not help
  if (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('permission_denied') ||
    msg.includes('401') ||
    msg.includes('403')
  ) {
    return false;
  }

  return (
    msg.includes('not found') ||
    msg.includes('not supported') ||
    msg.includes('unsupported') ||
    msg.includes('unknown model') ||
    msg.includes('invalid model') ||
    msg.includes('model') && (msg.includes('404') || msg.includes('400') || msg.includes('invalid_argument')) ||
    msg.includes('thinking')
  );
}
