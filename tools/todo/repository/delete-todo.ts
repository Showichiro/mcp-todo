import { err, ok, type Result } from "../../../utils/result.ts";
import { todoKey } from "../constants.ts";

export type DeleteTodoSuccess = {
  id: string;
};

export type DeleteTodoError = {
  message: string;
  cause?: unknown;
};

export const deleteTodo = async (
  kv: Deno.Kv,
  id: string,
): Promise<Result<DeleteTodoSuccess, DeleteTodoError>> => {
  try {
    // Delete the todo
    await kv.delete([todoKey, id]);

    return ok({
      id,
    });
  } catch (error) {
    return err({
      message: "Unexpected error occurred while deleting todo",
      cause: error,
    });
  }
};
