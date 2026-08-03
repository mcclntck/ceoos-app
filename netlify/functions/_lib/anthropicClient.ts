import Anthropic from '@anthropic-ai/sdk'

/** Returns null (not a thrown error) when the key is unset, so callers can
 *  fold "misconfigured" into their existing error-response path uniformly. */
export function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  return new Anthropic({ apiKey })
}
