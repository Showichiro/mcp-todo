import type { Content, Tool } from "npm:@modelcontextprotocol/sdk@1.9.0";

export type Module = {
  tool: Tool;
  handler: (args: unknown) =>
    | {
      content: Content[];
      isError: boolean;
    }
    | Promise<{
      content: Content[];
      isError: boolean;
    }>;
};
