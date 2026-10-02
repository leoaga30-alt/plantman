// Models often wrap their JSON in ```json fences (or add a sentence) despite the prompt.
export function parseJsonResponse(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return JSON.parse(start !== -1 && end > start ? text.slice(start, end + 1) : text);
}
