import { Mastra } from "@mastra/core";
import { newsAgent } from "./agents/news-agent";

export const mastra = new Mastra({
  agents: {
    newsAgent,
  },
});

export { newsAgent };
