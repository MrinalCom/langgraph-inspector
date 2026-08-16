import { describe, expect, it } from "vitest";
import { renderGraph } from "../src/renderGraph.js";
import type { DrawableGraph } from "../src/types.js";

const graph: DrawableGraph = {
  nodes: {
    __start__: { id: "__start__", name: "__start__" },
    retrieve: { id: "retrieve", name: "retrieve" },
    generate: { id: "generate", name: "generate" },
    fallback: { id: "fallback", name: "fallback" },
    __end__: { id: "__end__", name: "__end__" },
  },
  edges: [
    { source: "__start__", target: "retrieve" },
    { source: "retrieve", target: "generate", conditional: true, data: "hasContext" },
    { source: "retrieve", target: "fallback", conditional: true, data: "needsMoreContext" },
    { source: "fallback", target: "retrieve" },
    { source: "generate", target: "__end__" },
  ],
};

describe("renderGraph", () => {
  it("lists every node once", () => {
    const output = renderGraph(graph, { color: false });
    for (const id of Object.keys(graph.nodes)) {
      expect(output).toContain(id);
    }
  });

  it("orders __start__ first and __end__ last", () => {
    const output = renderGraph(graph, { color: false });
    const startIndex = output.indexOf("__start__");
    const endIndex = output.indexOf("__end__");
    expect(startIndex).toBeGreaterThanOrEqual(0);
    expect(endIndex).toBeGreaterThan(startIndex);
  });

  it("labels conditional edges with their branch data", () => {
    const output = renderGraph(graph, { color: false });
    expect(output).toContain("hasContext");
    expect(output).toContain("needsMoreContext");
  });

  it("prints a cyclic edge without recursing infinitely", () => {
    const output = renderGraph(graph, { color: false });
    expect(output).toContain("fallback");
    expect(output).toContain("retrieve");
  });
});
