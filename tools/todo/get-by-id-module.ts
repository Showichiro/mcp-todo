import type { Module } from "../../types.ts";
import { $object, $string } from "@showichiro/validators";
import { getTodoById } from "./repository/get-todo-by-id.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";

// 入力バリデーター
const $getTodoByIdInput = $object(
  {
    id: $string,
  },
  false,
);

export const GetTodoByIdModule: Module = {
  tool: {
    name: "mcp_todo_get_by_id",
    description: "Get a todo item by its ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the todo item to retrieve",
        },
      },
    },
  },
  handler: async (args: unknown) => {
    if (!$getTodoByIdInput(args)) {
      return {
        content: [
          {
            type: "text",
            text: "Invalid input: Please provide a valid todo ID as a string",
          },
        ],
        isError: true,
      };
    }

    const { id } = args;

    try {
      const result = await withKv((kv) => getTodoById(kv, id));

      if (isErr(result)) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get todo: ${result.error.message}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "Todo found:",
          },
          {
            type: "json",
            json: result.data.todo,
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
