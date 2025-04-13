import { err, ok, type Result } from "../../../utils/result.ts";
import type { Todo } from "../types.ts";
import { getCompletionIndexListKey, getTodoKey } from "../utils/get-kv-key.ts";

export type GetTodosByCompletionSuccess = {
  todos: Todo[];
};

export type GetTodosByCompletionError = {
  message: string;
  cause?: unknown;
};

export const getTodosByCompletion = async (
  kv: Deno.Kv,
  completed: boolean,
): Promise<Result<GetTodosByCompletionSuccess, GetTodosByCompletionError>> => {
  try {
    const todoIds = kv.list<string>({
      prefix: getCompletionIndexListKey(completed),
    });
    const todos: Todo[] = [];

    for await (const entry of todoIds) {
      const todoId = entry.value;
      const todo = await kv.get<Todo>(getTodoKey(todoId));

      if (todo.value) {
        todos.push(todo.value);
      }
    }

    return ok({ todos });
  } catch (error) {
    return err({
      message:
        "Unexpected error occurred while getting todos by completion status",
      cause: error,
    });
  }
};
