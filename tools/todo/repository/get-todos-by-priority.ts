import { err, ok, type Result } from "../../../utils/result.ts";
import type { Priority, Todo } from "../types.ts";
import { getPriorityIndexListKey, getTodoKey } from "../utils/get-kv-key.ts";
import { getAllTodos } from "./get-all-todos.ts";

export type GetTodosByPrioritySuccess = {
  todos: Todo[];
};

export type GetTodosByPriorityError = {
  message: string;
  cause?: unknown;
};

export const getTodosByPriority = async (
  kv: Deno.Kv,
  priority?: Priority,
): Promise<Result<GetTodosByPrioritySuccess, GetTodosByPriorityError>> => {
  try {
    if (!priority) {
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
      prefix: getPriorityIndexListKey(priority),
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
      message: "Unexpected error occurred while getting todos by priority",
      cause: error,
    });
  }
};
