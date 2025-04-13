import type { Module } from "../../types.ts";
import { $object, $string } from "@showichiro/validators";
import { deleteTodo } from "./repository/delete-todo.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";

// 入力バリデーター
const $deleteTodoInput = $object(
  {
    id: $string,
  },
  false,
);

export const DeleteTodoModule: Module = {
  tool: {
    name: "mcp_todo_delete",
    description: "Delete a todo item by its ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the todo item to delete",
        },
      },
      required: ["id"],
    },
  },
  handler: async (args: unknown) => {
    if (!$deleteTodoInput(args)) {
      return {
        content: [
          {
            type: "text",
            text: "Invalid input: Please provide a valid todo ID",
          },
        ],
        isError: true,
      };
    }

    const { id } = args;

    try {
      const result = await withKv((kv) => deleteTodo(kv, id));

      if (isErr(result)) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to delete todo: ${result.error.message}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Todo with ID ${result.data.id} deleted successfully`,
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
