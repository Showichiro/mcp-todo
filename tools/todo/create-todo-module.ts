import type { Module } from "../../types.ts";
import {
  $array,
  $object,
  $optional,
  $record,
  $string,
  type Validator,
} from "@showichiro/validators";
import { priorities, type Priority } from "./types.ts";
import { createTodo } from "./repository/create-todo.ts";
import { isErr } from "../../utils/result.ts";
import { withKv } from "../../kv-factory.ts";

// カスタムバリデーター: 優先度の文字列チェック
const $priority: Validator<Priority> = (val: unknown): val is Priority => {
  return typeof val === "string" && priorities.includes(val as Priority);
};

// 入力バリデーター
const $createTodoInput = $object(
  {
    description: $string,
    priority: $optional($priority),
    projects: $optional($array($string)),
    contexts: $optional($array($string)),
    tags: $optional($record($string)),
  },
  true,
);

export const CreateTodoModule: Module = {
  tool: {
    name: "mcp_todo_create",
    description: "Create a new todo item following the todo.txt format",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "The main description of the todo item",
        },
        priority: {
          type: "string",
          enum: priorities,
          description: "Priority of the todo (A-Z)",
        },
        projects: {
          type: "array",
          items: { type: "string" },
          description: "List of projects associated with the todo",
          default: [],
        },
        contexts: {
          type: "array",
          items: { type: "string" },
          description: "List of contexts associated with the todo",
          default: [],
        },
        tags: {
          type: "object",
          additionalProperties: { type: "string" },
          description: "Key-value pairs of tags",
          default: {},
        },
      },
      required: ["description"],
    },
  },
  handler: async (args: unknown) => {
    if (!$createTodoInput(args)) {
      return {
        content: [
          {
            type: "text",
            text: "Invalid input: Please check your input format",
          },
        ],
        isError: true,
      };
    }

    const {
      description,
      priority,
      projects = [],
      contexts = [],
      tags = {},
    } = args;

    try {
      const result = await withKv((kv) =>
        createTodo(kv, {
          completed: false,
          createdAt: new Date(),
          description,
          priority: priority ?? undefined,
          projects: projects ?? [],
          contexts: contexts ?? [],
          tags: tags ?? {},
        })
      );

      if (isErr(result)) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to create todo: ${result.error.message}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Successfully created todo with ID: ${result.data.id}`,
          },
        ],
        isError: false,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to process todo: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },
};
