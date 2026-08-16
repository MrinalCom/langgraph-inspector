import pc from "picocolors";
import { diffState } from "./diff.js";
import { formatDuration, formatValue } from "./format.js";
import type { LogStreamOptions, UpdatesChunk } from "./types.js";

/** Wrap a LangGraph.js `updates`-mode stream so every node's output is printed to the
 * terminal as it runs — node name, elapsed time, and a diff of what it changed in the
 * accumulated state. Pass the stream straight through so callers can keep consuming it
 * normally:
 *
 * ```ts
 * const stream = await app.stream(input, { streamMode: "updates" });
 * for await (const chunk of logStream(stream)) {
 *   // unchanged — logStream only observes and prints
 * }
 * ```
 */
export async function* logStream<T extends UpdatesChunk>(
  source: AsyncIterable<T>,
  options: LogStreamOptions = {},
): AsyncGenerator<T, void, unknown> {
  const { diff = true, timing = true, write = (line: string) => process.stdout.write(`${line}\n`) } = options;
  const color = options.color ?? Boolean(process.stdout?.isTTY);
  const c = color ? pc : noColor;

  const state: Record<string, unknown> = {};
  let stepIndex = 0;
  let lastTimestamp = Date.now();

  for await (const chunk of source) {
    const now = Date.now();
    const elapsed = now - lastTimestamp;
    lastTimestamp = now;

    for (const [nodeName, nodeOutput] of Object.entries(chunk)) {
      stepIndex += 1;
      const header = timing
        ? `${c.dim(`#${stepIndex}`)} ${c.bold(c.cyan(nodeName))} ${c.dim(`(${formatDuration(elapsed)})`)}`
        : `${c.dim(`#${stepIndex}`)} ${c.bold(c.cyan(nodeName))}`;
      write(header);

      const output =
        nodeOutput && typeof nodeOutput === "object" ? (nodeOutput as Record<string, unknown>) : { value: nodeOutput };

      if (diff) {
        const changes = diffState(state, { ...state, ...output });
        if (changes.length === 0) {
          write(`  ${c.dim("(no state change)")}`);
        }
        for (const change of changes) {
          if (change.kind === "added") {
            write(`  ${c.green("+")} ${change.key} ${c.green(formatValue(change.value))}`);
          } else if (change.kind === "removed") {
            write(`  ${c.red("-")} ${change.key}`);
          } else {
            write(`  ${c.yellow("~")} ${change.key} ${c.dim(formatValue(change.before))} ${c.dim("→")} ${formatValue(change.after)}`);
          }
        }
      }

      Object.assign(state, output);
    }

    yield chunk;
  }
}

const identity = (s: string) => s;
const noColor = {
  bold: identity,
  dim: identity,
  cyan: identity,
  green: identity,
  red: identity,
  yellow: identity,
};
