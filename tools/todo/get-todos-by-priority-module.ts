import type { Module } from "../../types.ts";
import { $object, $optional } from "@showichiro/validators";
import { getTodosByPriority } from "./repository/get-todos-by-priority.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";
import { todoToString } from "./todo-to-string.ts";
import { priorities } from "./types.ts";
import { $priority } from "./validators.ts";

// 入力バリデーター
const $getTodosByPriorityInput = $object(
  {
    priority: $optional($priority),
  },
  false,
);

export const GetTodosByPriorityModule: Module = {
  tool: {
    name: "mcp_todo_get_by_priority",
    description: "Get todo items filtered by priority",
    inputSchema: {
      type: "object",
      properties: {
        priority: {
          type: "string",
          enum: priorities,
          description:
            "Priority to filter todos by (A-Z). If not provided, returns todos of all priorities.",
        },
      },
    },
  },
  handler: async (args: unknown) => {
    if (!$getTodosByPriorityInput(args)) {
      return {
        content: [
          {
            type: "text",
            text:
              "Invalid input: Please provide a valid priority (A-Z) or omit for all priorities",
          },
        ],
        isError: true,
      };
    }

    const { priority } = args;
    const validPriority = priority === null ? undefined : priority;

    try {
      const result = await withKv((kv) =>
        getTodosByPriority(kv, validPriority)
      );

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
              text: validPriority
                ? `No todos found with priority ${validPriority}`
                : "No todos found",
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
            text: validPriority
              ? `Todos with priority ${validPriority}:`
              : "All todos by priority:",
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
