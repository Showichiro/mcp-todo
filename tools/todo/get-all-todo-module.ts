import type { Module } from "../../types.ts";
import { getAllTodos } from "./repository/get-all-todos.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";
import { todoToString } from "./todo-to-string.ts";

export const GetAllTodosModule: Module = {
  tool: {
    name: "mcp_todo_get_all",
    description: "Get all todo items",
    inputSchema: {
      type: "object",
      properties: {
        random_string: {
          type: "string",
          description: "Dummy parameter for no-parameter tools",
        },
      },
      required: ["random_string"],
    },
  },
  handler: async () => {
    try {
      const result = await withKv((kv) => getAllTodos(kv));

      if (isErr(result)) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get todos: ${result.error.message}`,
            },
          ],
          isError: true,
        };
      }

      const todoStrings = result.data.todos.map((todo) => todoToString(todo));

      return {
        content: [
          {
            type: "text",
            text: "All todos:",
          },
          {
            type: "text",
            text: todoStrings.join("\n"),
          },
        ],
        isError: false,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to process request: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },
};
