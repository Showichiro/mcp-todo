import { err, ok, type Result } from "../../../utils/result.ts";
import { todoKey } from "../constants.ts";

export type DeleteTodoSuccess = {
  id: string;
};

export type DeleteTodoError = {
  message: string;
  cause?: unknown;
};

import {
  getCompletionIndexListKey,
  getContextIndexListKey,
  getPriorityIndexListKey,
  getProjectIndexListKey,
} from "../utils/get-kv-key.ts";
import { getTodoById } from "./get-todo-by-id.ts";

export const deleteTodo = async (
  kv: Deno.Kv,
  id: string,
): Promise<Result<DeleteTodoSuccess, DeleteTodoError>> => {
  try {
    const getTodoResult = await getTodoById(kv, id);

    if (!getTodoResult.ok) {
      return err({
        message: `Todo with id ${id} not found`,
      });
    }

    const todo = getTodoResult.data.todo;

    const atomic = kv.atomic();

    // Delete the todo
    atomic.delete([todoKey, id]);

    // Delete project indexes
    for (const project of todo.projects) {
      atomic.delete([...getProjectIndexListKey(project), id]);
    }

    // Delete context indexes
    for (const context of todo.contexts) {
      atomic.delete([...getContextIndexListKey(context), id]);
    }

    // Delete priority index
    atomic.delete([...getPriorityIndexListKey(todo.priority), id]);

    // Delete completion index
    atomic.delete([...getCompletionIndexListKey(todo.completed), id]);

    const result = await atomic.commit();

    if (!result.ok) {
      return err({
        message: "Failed to commit transaction",
      });
    }

    return ok({ id });
  } catch (error) {
    return err({
      message: "Unexpected error occurred while deleting todo",
      cause: error,
    });
  }
};
