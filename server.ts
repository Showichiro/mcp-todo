import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server-factory.ts";
import { GetStringLengthModule } from "./tools/get-string-length.ts";
import { GenerateUUIDsModule } from "./tools/generate-uuids.ts";

if (import.meta.main) {
  const server = createServer({
    serverName: "local",
    version: "0.1.0",
    modules: [GetStringLengthModule, GenerateUUIDsModule],
  });

  // シグナルハンドリング
  Deno.addSignalListener("SIGINT", async () => {
    console.warn("SIGINT received");
    await server.close();
    Deno.exit(0);
  });

  await server.connect(new StdioServerTransport());
  console.warn("Server is running");
}
