import type { Module } from "../../types.ts";
import { $object, $optional, type Validator } from "@showichiro/validators";
import { getTodosByPriority } from "./repository/get-todos-by-priority.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";
import { todoToString } from "./todo-to-string.ts";
import { priorities, type Priority } from "./types.ts";

// カスタムバリデーター: 優先度の文字列チェック
const $priority: Validator<Priority> = (val: unknown): val is Priority => {
  return typeof val === "string" && priorities.includes(val as Priority);
};

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

    const { priority } = args as { priority?: Priority };

    try {
      const result = await withKv((kv) => getTodosByPriority(kv, priority));

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
              text: priority
                ? `No todos found with priority ${priority}`
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
            text: priority
              ? `Todos with priority ${priority}:`
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
