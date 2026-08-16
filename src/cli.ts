import path from "node:path";
import { pathToFileURL } from "node:url";
import { renderGraph } from "./renderGraph.js";
import type { DrawableGraph } from "./types.js";

interface CompiledGraphLike {
  getGraph?: () => DrawableGraph;
  getGraphAsync?: () => Promise<DrawableGraph>;
}

async function main() {
  const arg = process.argv[2];
  if (!arg || arg === "--help" || arg === "-h") {
    printUsage();
    process.exit(arg ? 0 : 1);
  }

  const [modulePath, exportName] = arg.split(":");
  const resolved = path.resolve(process.cwd(), modulePath);
  const mod = (await import(pathToFileURL(resolved).href)) as Record<string, unknown>;

  const candidateNames = exportName ? [exportName] : ["graph", "app", "default"];
  let compiled: CompiledGraphLike | undefined;
  for (const name of candidateNames) {
    const candidate = mod[name] as CompiledGraphLike | undefined;
    if (candidate && (typeof candidate.getGraph === "function" || typeof candidate.getGraphAsync === "function")) {
      compiled = candidate;
      break;
    }
  }

  if (!compiled) {
    console.error(`Could not find a compiled graph export (tried: ${candidateNames.join(", ")}) in ${modulePath}.`);
    console.error(`Pass it explicitly: langgraph-inspector ${modulePath}:yourExportName`);
    process.exit(1);
    return;
  }

  const drawable = compiled.getGraphAsync ? await compiled.getGraphAsync() : compiled.getGraph!();
  console.log(renderGraph(drawable));
}

function printUsage() {
  console.log(`langgraph-inspector — offline ASCII diagram for a compiled LangGraph.js graph

Usage:
  langgraph-inspector <path-to-module>[:exportName]

No network call, no LangSmith account — reads the graph structure straight from
your compiled StateGraph via getGraph()/getGraphAsync().

Examples:
  langgraph-inspector ./dist/graph.js
  langgraph-inspector ./dist/graph.js:app`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
