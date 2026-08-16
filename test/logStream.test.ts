import { describe, expect, it } from "vitest";
import { logStream } from "../src/logStream.js";

async function* fakeStream() {
  yield { retrieve: { docs: ["a", "b"] } };
  yield { generate: { answer: "hello" } };
}

describe("logStream", () => {
  it("passes every chunk through unchanged", async () => {
    const seen: unknown[] = [];
    for await (const chunk of logStream(fakeStream(), { write: () => {} })) {
      seen.push(chunk);
    }
    expect(seen).toEqual([{ retrieve: { docs: ["a", "b"] } }, { generate: { answer: "hello" } }]);
  });

  it("logs one header line per node plus a diff line per changed key", async () => {
    const lines: string[] = [];
    for await (const _ of logStream(fakeStream(), { write: (l) => lines.push(l), color: false })) {
      // draining is enough to trigger logging
    }
    expect(lines.some((l) => l.includes("retrieve"))).toBe(true);
    expect(lines.some((l) => l.includes("generate"))).toBe(true);
    expect(lines.some((l) => l.includes("docs"))).toBe(true);
    expect(lines.some((l) => l.includes("answer"))).toBe(true);
  });

  it("can run with diff and timing disabled", async () => {
    const lines: string[] = [];
    for await (const _ of logStream(fakeStream(), { write: (l) => lines.push(l), diff: false, timing: false, color: false })) {
      // draining
    }
    expect(lines.length).toBe(2);
  });
});
