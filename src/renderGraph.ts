import pc from "picocolors";
import type { DrawableGraph, RenderGraphOptions } from "./types.js";

/** Render a LangGraph.js `compiledGraph.getGraph()` result as plain-text ASCII —
 * no `mermaid.ink` network call, no browser, safe to print in a terminal, CI log,
 * or README code block. Cycles (common in agent graphs with retry/loop edges) are
 * printed as ordinary edges rather than walked recursively, so this never hangs. */
export function renderGraph(graph: DrawableGraph, options: RenderGraphOptions = {}): string {
  const color = options.color ?? Boolean(process.stdout?.isTTY);
  const c = color ? pc : { bold: (s: string) => s, dim: (s: string) => s, cyan: (s: string) => s, magenta: (s: string) => s };

  const nodeIds = orderNodeIds(graph);
  const edgesBySource = new Map<string, DrawableGraph["edges"]>();
  for (const edge of graph.edges) {
    const list = edgesBySource.get(edge.source) ?? [];
    list.push(edge);
    edgesBySource.set(edge.source, list);
  }

  const lines: string[] = [];
  lines.push(c.bold(`nodes (${nodeIds.length})`));
  for (const id of nodeIds) {
    lines.push(`  ${c.cyan(id)}`);
  }

  lines.push("");
  lines.push(c.bold(`edges (${graph.edges.length})`));

  for (const source of nodeIds) {
    const edges = edgesBySource.get(source);
    if (!edges || edges.length === 0) continue;

    const pad = " ".repeat(source.length);
    edges.forEach((edge, i) => {
      const isLast = i === edges.length - 1;
      const prefix = edges.length === 1 ? "──▶" : i === 0 ? "─┬─▶" : isLast ? " └─▶" : " ├─▶";
      const label = edge.conditional ? c.dim(` (${edge.data ?? "conditional"})`) : edge.data ? c.dim(` (${edge.data})`) : "";
      const left = i === 0 ? source : pad;
      lines.push(`  ${c.cyan(left)} ${prefix} ${c.magenta(edge.target)}${label}`);
    });
  }

  return lines.join("\n");
}

function orderNodeIds(graph: DrawableGraph): string[] {
  const ids = Object.keys(graph.nodes);
  const rank = (id: string) => (id === "__start__" ? -1 : id === "__end__" ? 1 : 0);
  return ids.sort((a, b) => rank(a) - rank(b));
}
