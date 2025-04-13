import { err, ok, type Result } from "../../../utils/result.ts";
import type { Todo } from "../types.ts";
import { getProjectIndexListKey, getTodoKey } from "../utils/get-kv-key.ts";

export type GetTodosByProjectSuccess = {
  todos: Todo[];
};

export type GetTodosByProjectError = {
  message: string;
  cause?: unknown;
};

export const getTodosByProject = async (
  kv: Deno.Kv,
  project: string,
): Promise<Result<GetTodosByProjectSuccess, GetTodosByProjectError>> => {
  try {
    const todoIds = kv.list<string>({
      prefix: getProjectIndexListKey(project),
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
      message: "Unexpected error occurred while getting todos by project",
      cause: error,
    });
  }
};
