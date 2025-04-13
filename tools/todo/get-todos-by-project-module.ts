import type { Module } from "../../types.ts";
import { $object, $string } from "@showichiro/validators";
import { getTodosByProject } from "./repository/get-todos-by-project.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";
import { todoToString } from "./todo-to-string.ts";

// 入力バリデーター
const $getTodosByProjectInput = $object(
  {
    project: $string,
  },
  false,
);

export const GetTodosByProjectModule: Module = {
  tool: {
    name: "mcp_todo_get_by_project",
    description: "Get todo items filtered by project",
    inputSchema: {
      type: "object",
      properties: {
        project: {
          type: "string",
          description: "Project to filter todos by (e.g., 'work', 'personal')",
        },
      },
      required: ["project"],
    },
  },
  handler: async (args: unknown) => {
    if (!$getTodosByProjectInput(args)) {
      return {
        content: [
          {
            type: "text",
            text: "Invalid input: Please provide a valid project string",
          },
        ],
        isError: true,
      };
    }

    const { project } = args;

    try {
      const result = await withKv((kv) => getTodosByProject(kv, project));

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
              text: `No todos found for project +${project}`,
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
            text: `Todos for project +${project}:`,
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
