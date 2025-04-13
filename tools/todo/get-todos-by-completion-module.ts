import type { Module } from "../../types.ts";
import { $boolean, $object } from "@showichiro/validators";
import { getTodosByCompletion } from "./repository/get-todos-by-completion.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";
import { todoToString } from "./todo-to-string.ts";

// 入力バリデーター
const $getTodosByCompletionInput = $object(
  {
    completed: $boolean,
  },
  false,
);

export const GetTodosByCompletionModule: Module = {
  tool: {
    name: "mcp_todo_get_by_completion",
    description: "Get todo items filtered by completion status",
    inputSchema: {
      type: "object",
      properties: {
        completed: {
          type: "boolean",
          description:
            "Filter todos by completion status (true for completed, false for incomplete)",
        },
      },
      required: ["completed"],
    },
  },
  handler: async (args: unknown) => {
    if (!$getTodosByCompletionInput(args)) {
      return {
        content: [
          {
            type: "text",
            text:
              "Invalid input: Please provide a valid completion status (boolean)",
          },
        ],
        isError: true,
      };
    }

    const { completed } = args;

    try {
      const result = await withKv((kv) => getTodosByCompletion(kv, completed));

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

      const { todos } = result.data;

      if (todos.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: completed
                ? "No completed todos found"
                : "No incomplete todos found",
            },
          ],
          isError: false,
        };
      }

      const todoStrings = todos.map((todo) => todoToString(todo));

      return {
        content: [
          {
            type: "text",
            text: completed ? "Completed todos:" : "Incomplete todos:",
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
