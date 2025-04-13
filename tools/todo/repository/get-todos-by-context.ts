import { err, ok, type Result } from "../../../utils/result.ts";
import type { Todo } from "../types.ts";
import { getContextIndexListKey, getTodoKey } from "../utils/get-kv-key.ts";
import { getAllTodos } from "./get-all-todos.ts";

export type GetTodosByContextSuccess = {
  todos: Todo[];
};

export type GetTodosByContextError = {
  message: string;
  cause?: unknown;
};

export const getTodosByContext = async (
  kv: Deno.Kv,
  context?: string,
): Promise<Result<GetTodosByContextSuccess, GetTodosByContextError>> => {
  try {
    if (!context) {
      const result = await getAllTodos(kv);
      if (!result.ok) {
        return err({
          message: result.error.message,
          cause: result.error.cause,
        });
      }
      return result;
    }

    const todos: Todo[] = [];
    const entries = kv.list<string>({
      prefix: getContextIndexListKey(context),
    });

    for await (const entry of entries) {
      const todoId = entry.value;
      const todoResult = await kv.get<Todo>(getTodoKey(todoId));

      if (todoResult.value) {
        todos.push(todoResult.value);
      }
    }

    return ok({ todos });
  } catch (error) {
    return err({
      message: "Unexpected error occurred while getting todos by context",
      cause: error,
    });
  }
};
