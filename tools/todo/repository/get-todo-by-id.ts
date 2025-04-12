import { err, ok, Result } from "../../../utils/result.ts";
import { Todo } from "../types.ts";
import { todoKey } from "../constants.ts";

export type GetTodoByIdSuccess = {
  todo: Todo;
};

export type GetTodoByIdError = {
  message: string;
  cause?: unknown;
};

export const getTodoById = async (
  kv: Deno.Kv,
  id: string,
): Promise<Result<GetTodoByIdSuccess, GetTodoByIdError>> => {
  try {
    const result = await kv.get<Todo>([todoKey, id]);

    if (!result.value) {
      return err({
        message: `Todo with id ${id} not found`,
      });
    }

    return ok({ todo: result.value });
  } catch (error) {
    return err({
      message: "Unexpected error occurred while getting todo",
      cause: error,
    });
  }
};
