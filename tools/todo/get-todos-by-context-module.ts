import { Module } from "../../types.ts";
import { $object, $optional, $string } from "@showichiro/validators";
import { getTodosByContext } from "./repository/get-todos-by-context.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";
import { todoToString } from "./todo-to-string.ts";

// 入力バリデーター
const $getTodosByContextInput = $object(
  {
    context: $optional($string),
  },
  false,
);

export const GetTodosByContextModule: Module = {
  tool: {
    name: "mcp_todo_get_by_context",
    description: "Get todo items filtered by context",
    inputSchema: {
      type: "object",
      properties: {
        context: {
          type: "string",
          description:
            "Context to filter todos by (e.g., 'home', 'work'). If not provided, returns todos from all contexts.",
        },
      },
    },
  },
  handler: async (args: unknown) => {
    if (!$getTodosByContextInput(args)) {
      return {
        content: [
          {
            type: "text",
            text:
              "Invalid input: Please provide a valid context string or omit for all contexts",
          },
        ],
        isError: true,
      };
    }

    const { context } = args as { context?: string };

    try {
      const result = await withKv((kv) => getTodosByContext(kv, context));

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
              text: context
                ? `No todos found with context @${context}`
                : "No todos found in any context",
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
            text: context
              ? `Todos with context @${context}:`
              : "All todos by context:",
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
