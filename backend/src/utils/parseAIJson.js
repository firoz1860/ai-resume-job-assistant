export function parseAIJson(text, fallback) {
  try {
    const cleaned = String(text).replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}
