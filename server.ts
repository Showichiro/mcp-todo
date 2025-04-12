import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server-factory.ts";
import { CreateTodoModule } from "./tools/todo/create-todo-module.ts";
import { GetTodoByIdModule } from "./tools/todo/get-by-id-module.ts";
import { GetAllTodosModule } from "./tools/todo/get-all-todo-module.ts";
import { GetTodosByPriorityModule } from "./tools/todo/get-todos-by-priority-module.ts";
import { GetTodosByContextModule } from "./tools/todo/get-todos-by-context-module.ts";

if (import.meta.main) {
  const server = createServer({
    serverName: "local",
    version: "0.1.0",
    modules: [
      CreateTodoModule,
      GetTodoByIdModule,
      GetAllTodosModule,
      GetTodosByPriorityModule,
      GetTodosByContextModule,
    ],
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
