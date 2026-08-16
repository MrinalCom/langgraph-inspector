const MAX_VALUE_LENGTH = 120;

/** Render an arbitrary state value as a single-line, human-scannable string,
 * truncated so a long AI message or tool payload doesn't blow up the terminal. */
export function formatValue(value: unknown): string {
  let text: string;

  if (typeof value === "string") {
    text = value;
  } else {
    try {
      text = JSON.stringify(value);
    } catch {
      text = String(value);
    }
  }

  text = text.replace(/\s+/g, " ").trim();

  if (text.length > MAX_VALUE_LENGTH) {
    return `${text.slice(0, MAX_VALUE_LENGTH)}…`;
  }
  return text;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
