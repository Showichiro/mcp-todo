import { Module } from "./types.ts";
import { Server } from "npm:@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "npm:@modelcontextprotocol/sdk/types.js";

export const createServer = (opt: {
  serverName: string;
  version: string;
  modules: Module[];
}) => {
  const server = new Server(
    {
      name: opt.serverName,
      version: opt.version,
    },
    {
      capabilities: {
        resources: {},
        tools: opt.modules.reduce((acc, module) => {
          return { ...acc, [module.tool.name]: module.tool };
        }, {} satisfies Record<string, Tool>),
      },
    },
  );

  server.setRequestHandler(ListResourcesRequestSchema, () => ({
    resources: [],
  }));

  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: opt.modules.map((tool) => tool.tool),
  }));

  server.setRequestHandler(CallToolRequestSchema, (request) => {
    const name = request.params.name;
    const args = request.params.arguments ?? {};
    const tool = opt.modules.find((module) => module.tool.name === name);
    if (!tool) {
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }
    return tool.handler(args);
  });

  return server;
};
