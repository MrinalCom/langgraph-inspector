import { describe, expect, it } from "vitest";
import { diffState } from "../src/diff.js";

describe("diffState", () => {
  it("reports added keys", () => {
    const changes = diffState({}, { messages: ["hi"] });
    expect(changes).toEqual([{ kind: "added", key: "messages", value: ["hi"] }]);
  });

  it("reports removed keys", () => {
    const changes = diffState({ scratch: "x" }, {});
    expect(changes).toEqual([{ kind: "removed", key: "scratch", before: "x" }]);
  });

  it("reports changed keys by value, not reference", () => {
    const changes = diffState({ count: 1 }, { count: 2 });
    expect(changes).toEqual([{ kind: "changed", key: "count", before: 1, after: 2 }]);
  });

  it("treats deep-equal objects as unchanged", () => {
    const changes = diffState({ config: { a: 1 } }, { config: { a: 1 } });
    expect(changes).toEqual([]);
  });

  it("is empty when nothing changed", () => {
    expect(diffState({ a: 1 }, { a: 1 })).toEqual([]);
  });
});
