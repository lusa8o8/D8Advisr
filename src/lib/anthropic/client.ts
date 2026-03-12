import AnthropicClient from "@anthropic-ai/sdk";

const key = process.env.ANTHROPIC_API_KEY;

if (!key) {
  throw new Error("Missing ANTHROPIC_API_KEY");
}

export const anthropicClient = new AnthropicClient({
  apiKey: key,
});

type TokenCost = { input: number; output: number };

const COST_RATES: Record<string, TokenCost> = {
  "claude-sonnet-4-20250514": {
    input: 3 / 1_000_000,
    output: 15 / 1_000_000,
  },
};

export function logApiCost(model: string, inputTokens: number, outputTokens: number) {
  const rate = COST_RATES[model];
  const costUsd =
    (inputTokens * (rate?.input ?? 0)) + (outputTokens * (rate?.output ?? 0));

  const logEntry = {
    model,
    inputTokens,
    outputTokens,
    costUsd,
    timestamp: new Date().toISOString(),
  };

  // TODO: persist to `api_cost_logs` once the Supabase schema is ready.
  console.log("[api_cost_logs]", logEntry);
}
