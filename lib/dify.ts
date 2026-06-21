export type MealMacroAnalysis = {
  protein: number;
  carbs: number;
  fat: number;
  calories?: number;
};

type MealPromptInput = {
  meal_number?: number;
  custom_name?: string;
  description?: string;
  weight?: string;
  meal_type?: string;
};

function difyConfig() {
  const apiKey = process.env.DIFY_API_KEY?.trim();
  const baseUrl = (process.env.DIFY_API_URL ?? "https://api.dify.ai/v1").replace(/\/$/, "");
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl,
    mode: (process.env.DIFY_APP_MODE ?? "workflow") as "workflow" | "chat",
    inputKey: process.env.DIFY_INPUT_KEY ?? "meal_prompt",
  };
}

export function isDifyConfigured(): boolean {
  return difyConfig() != null;
}

export function buildMealPrompt(meal: MealPromptInput): string {
  const lines: string[] = [];
  const name =
    meal.custom_name?.trim() ||
    (meal.meal_number ? `Meal ${meal.meal_number}` : "Meal");
  lines.push(`Meal: ${name}`);
  if (meal.description?.trim()) {
    lines.push(`Description: ${meal.description.trim()}`);
  }
  if (meal.weight?.trim()) {
    lines.push(`Weight: ${meal.weight.trim()} g`);
  }
  return lines.join("\n");
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseMacroObject(value: unknown): MealMacroAnalysis | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const protein =
    asNumber(obj.protein) ??
    asNumber(obj.protein_g) ??
    asNumber(obj.Protein);
  const carbs =
    asNumber(obj.carbs) ??
    asNumber(obj.carb) ??
    asNumber(obj.carbohydrates) ??
    asNumber(obj.Carb);
  const fat =
    asNumber(obj.fat) ??
    asNumber(obj.fats) ??
    asNumber(obj.Fat);
  if (protein == null || carbs == null || fat == null) return null;
  const calories = asNumber(obj.calories) ?? asNumber(obj.kcal) ?? undefined;
  return { protein, carbs, fat, calories };
}

function extractJsonObject(text: string): MealMacroAnalysis | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return parseMacroObject(JSON.parse(text.slice(start, end + 1)));
  } catch {
    return null;
  }
}

function parseDifyOutputs(outputs: unknown): MealMacroAnalysis | null {
  if (!outputs || typeof outputs !== "object") return null;
  const direct = parseMacroObject(outputs);
  if (direct) return direct;

  const record = outputs as Record<string, unknown>;
  for (const value of Object.values(record)) {
    if (typeof value === "string") {
      const fromText = extractJsonObject(value);
      if (fromText) return fromText;
      continue;
    }
    const nested = parseMacroObject(value);
    if (nested) return nested;
  }
  return null;
}

export async function analyzeMealWithDify(
  meal: MealPromptInput,
  userId: string
): Promise<MealMacroAnalysis | null> {
  return analyzePromptWithDify(buildMealPrompt(meal), userId);
}

export async function analyzePromptWithDify(
  prompt: string,
  userId: string
): Promise<MealMacroAnalysis | null> {
  const config = difyConfig();
  if (!config) return null;

  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  let response: Response;
  if (config.mode === "chat") {
    response = await fetch(`${config.baseUrl}/chat-messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: {},
        query: prompt,
        response_mode: "blocking",
        user: userId,
      }),
    });
  } else {
    response = await fetch(`${config.baseUrl}/workflows/run`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: { [config.inputKey]: prompt },
        response_mode: "blocking",
        user: userId,
      }),
    });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Dify request failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  if (config.mode === "chat") {
    const answer = typeof payload.answer === "string" ? payload.answer : "";
    return extractJsonObject(answer);
  }

  const data = payload.data as Record<string, unknown> | undefined;
  return parseDifyOutputs(data?.outputs);
}
