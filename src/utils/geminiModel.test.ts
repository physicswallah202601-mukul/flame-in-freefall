import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PRIMARY_GEMINI_MODEL,
  FALLBACK_GEMINI_MODEL,
  resolveGeminiModelConfig,
  shouldRetryWithFallbackModel,
} from './geminiModel';

describe('Gemini model configuration and retry fallback', () => {
  it('defaults primary model to gemini-4-hydrogen and allows GEMINI_MODEL override', () => {
    const def = resolveGeminiModelConfig(undefined);
    assert.equal(def.primaryModel, DEFAULT_PRIMARY_GEMINI_MODEL);
    assert.equal(def.fallbackModel, FALLBACK_GEMINI_MODEL);

    const custom = resolveGeminiModelConfig('  gemini-2.5-pro  ');
    assert.equal(custom.primaryModel, 'gemini-2.5-pro');
    assert.equal(custom.fallbackModel, 'gemini-2.5-flash');
  });

  it('triggers a single fallback retry only for unsupported model errors on non-fallback models', () => {
    assert.equal(
      shouldRetryWithFallbackModel(
        new Error('404 NOT_FOUND: models/gemini-4-hydrogen is not found for API version v1beta'),
        'gemini-4-hydrogen'
      ),
      true
    );

    assert.equal(
      shouldRetryWithFallbackModel(
        new Error('400 INVALID_ARGUMENT: thinkingConfig is not supported by this model'),
        'gemini-4-hydrogen'
      ),
      true
    );

    // Never loop when already on fallback model
    assert.equal(
      shouldRetryWithFallbackModel(
        new Error('404 NOT_FOUND: model unsupported'),
        'gemini-2.5-flash'
      ),
      false
    );

    // Never retry auth errors where fallback cannot succeed
    assert.equal(
      shouldRetryWithFallbackModel(
        new Error('403 PERMISSION_DENIED: API_KEY_INVALID'),
        'gemini-4-hydrogen'
      ),
      false
    );
  });
});
