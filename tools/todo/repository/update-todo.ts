import { err, isErr, ok, type Result } from "../../../utils/result.ts";
import type { Todo } from "../types.ts";
import { getTodoById } from "./get-todo-by-id.ts";
import { todoKey } from "../constants.ts";

type UpdateTodoInput = Partial<Omit<Todo, "id" | "createdAt" | "completedAt">>;

export type UpdateTodoSuccess = {
  todo: Todo;
};

export type UpdateTodoError = {
  message: string;
  cause?: unknown;
};

export const updateTodo = async (
  kv: Deno.Kv,
  id: string,
  input: UpdateTodoInput,
): Promise<Result<UpdateTodoSuccess, UpdateTodoError>> => {
  try {
    const getTodoResult = await getTodoById(kv, id);
    if (isErr(getTodoResult)) {
      return err({
        message: `Todo not found with id: ${id}`,
        cause: getTodoResult.error,
      });
    }

    const todo = getTodoResult.data.todo;
    const now = new Date();

    // Update todo with new values
    const updatedTodo: Todo = {
      id: todo.id,
      description: input.description ?? todo.description,
      contexts: input.contexts ?? todo.contexts,
      projects: input.projects ?? todo.projects,
      priority: input.priority ?? todo.priority,
      completed: input.completed ?? todo.completed,
      tags: input.tags ?? todo.tags,
      createdAt: todo.createdAt,
      completedAt: input.completed === true
        ? todo.completedAt || now
        : input.completed === false
        ? undefined
        : todo.completedAt,
    };

    // Save the updated todo
    await kv.set([todoKey, id], updatedTodo);

    return ok({
      todo: updatedTodo,
    });
  } catch (error) {
    return err({
      message: "Unexpected error occurred while updating todo",
      cause: error,
    });
  }
};
