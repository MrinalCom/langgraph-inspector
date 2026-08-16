/** Minimal shape of `@langchain/core`'s drawable Graph — matches Node/Edge from
 * `@langchain/core/runnables/graph` without importing the package at runtime. */
export interface InspectorNode {
  id: string;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface InspectorEdge {
  source: string;
  target: string;
  data?: string;
  conditional?: boolean;
}

export interface DrawableGraph {
  nodes: Record<string, InspectorNode>;
  edges: InspectorEdge[];
}

/** One step of a LangGraph.js `stream(input, { streamMode: "updates" })` iterable:
 * a map of node name to the partial state it returned. */
export type UpdatesChunk = Record<string, unknown>;

export interface LogStreamOptions {
  /** Print a diff of what each node changed in the accumulated state. Default true. */
  diff?: boolean;
  /** Print per-node elapsed time. Default true. */
  timing?: boolean;
  /** Disable ANSI colors (auto-detected from TTY otherwise). */
  color?: boolean;
  /** Write destination, defaults to process.stdout. */
  write?: (line: string) => void;
}

export interface RenderGraphOptions {
  /** Disable ANSI colors (auto-detected from TTY otherwise). */
  color?: boolean;
}
