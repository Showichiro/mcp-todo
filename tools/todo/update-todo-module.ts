import type { Module } from "../../types.ts";
import {
  $array,
  $boolean,
  $object,
  $optional,
  $record,
  $string,
} from "@showichiro/validators";
import { updateTodo } from "./repository/update-todo.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";
import { todoToString } from "./todo-to-string.ts";
import { priorities } from "./types.ts";
import { $priority } from "./validators.ts";

// 入力バリデーター
const $updateTodoInput = $object(
  {
    id: $string,
    completed: $optional($boolean),
    priority: $optional($priority),
    description: $optional($string),
    projects: $optional($array($string)),
    contexts: $optional($array($string)),
    tags: $optional($record($string)),
  },
  false,
);

export const UpdateTodoModule: Module = {
  tool: {
    name: "mcp_todo_update",
    description: "Update a todo item by its ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the todo item to update",
        },
        completed: {
          type: "boolean",
          description: "Whether the todo is completed",
        },
        priority: {
          type: "string",
          enum: priorities,
          description: "Priority of the todo (A-Z)",
        },
        description: {
          type: "string",
          description: "The main description of the todo item",
        },
        projects: {
          type: "array",
          items: {
            type: "string",
          },
          description: "List of projects associated with the todo",
        },
        contexts: {
          type: "array",
          items: {
            type: "string",
          },
          description: "List of contexts associated with the todo",
        },
        tags: {
          type: "object",
          additionalProperties: {
            type: "string",
          },
          description: "Key-value pairs of tags",
        },
      },
      required: ["id"],
    },
  },
  handler: async (args: unknown) => {
    if (!$updateTodoInput(args)) {
      return {
        content: [
          {
            type: "text",
            text: "Invalid input: Please provide valid todo update data",
          },
        ],
        isError: true,
      };
    }

    const { id, ...input } = args;

    try {
      const result = await withKv((kv) =>
        updateTodo(kv, id, {
          completed: input.completed ?? undefined,
          contexts: input.contexts ?? undefined,
          tags: input.tags ?? undefined,
          projects: input.projects ?? undefined,
          description: input.description ?? undefined,
          priority: input.priority ?? undefined,
        })
      );

      if (isErr(result)) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to update todo: ${result.error.message}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "Todo updated successfully:",
          },
          {
            type: "text",
            text: todoToString(result.data.todo),
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
