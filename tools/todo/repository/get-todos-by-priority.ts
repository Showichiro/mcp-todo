import { err, ok, type Result } from "../../../utils/result.ts";
import type { Priority, Todo } from "../types.ts";
import { byPriorityKey, todoKey } from "../constants.ts";

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
    const todos: Todo[] = [];

    if (priority) {
      // 特定の優先度のTodoを取得
      const entries = kv.list<string>({ prefix: [byPriorityKey, priority] });

      for await (const entry of entries) {
        const todoId = entry.value;
        const todoResult = await kv.get<Todo>([todoKey, todoId]);

        if (todoResult.value) {
          todos.push(todoResult.value);
        }
      }
    } else {
      // すべての優先度のTodoを取得（空の優先度も含む）
      const entries = kv.list<string>({ prefix: [byPriorityKey] });

      for await (const entry of entries) {
        const todoId = entry.value;
        const todoResult = await kv.get<Todo>([todoKey, todoId]);

        if (todoResult.value) {
          todos.push(todoResult.value);
        }
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
