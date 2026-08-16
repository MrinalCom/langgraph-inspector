import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { logStream, renderGraph } from "langgraph-inspector";

const State = Annotation.Root({
  docs: Annotation(),
  answer: Annotation(),
});

const app = new StateGraph(State)
  .addNode("retrieve", async () => ({ docs: ["Paris is the capital of France."] }))
  .addNode("generate", async (s) => ({ answer: `The capital of France is Paris.` }))
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END)
  .compile();

console.log(renderGraph(app.getGraph()));
console.log();

const stream = await app.stream({}, { streamMode: "updates" });
for await (const _ of logStream(stream)) {
  // logStream just observes and prints
}
