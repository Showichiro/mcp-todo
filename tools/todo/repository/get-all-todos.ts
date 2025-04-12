import { err, ok, type Result } from "../../../utils/result.ts";
import type { Todo } from "../types.ts";
import { todoKey } from "../constants.ts";

export type GetAllTodosSuccess = {
  todos: Todo[];
};

export type GetAllTodosError = {
  message: string;
  cause?: unknown;
};

export const getAllTodos = async (
  kv: Deno.Kv,
): Promise<Result<GetAllTodosSuccess, GetAllTodosError>> => {
  try {
    const entries = kv.list<Todo>({ prefix: [todoKey] });
    const todos: Todo[] = [];

    for await (const entry of entries) {
      todos.push(entry.value);
    }

    return ok({ todos });
  } catch (error) {
    return err({
      message: "Unexpected error occurred while getting all todos",
      cause: error,
    });
  }
};
