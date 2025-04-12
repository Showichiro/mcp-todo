import { err, ok, Result } from "../../../utils/result.ts";
import { Todo } from "../types.ts";
import { byContextKey, todoKey } from "../constants.ts";

export type GetTodosByContextSuccess = {
  todos: Todo[];
};

export type GetTodosByContextError = {
  message: string;
  cause?: unknown;
};

export const getTodosByContext = async (
  kv: Deno.Kv,
  context?: string
): Promise<Result<GetTodosByContextSuccess, GetTodosByContextError>> => {
  try {
    const todos: Todo[] = [];

    if (context) {
      // 特定のコンテキストのTodoを取得
      const entries = kv.list<string>({ prefix: [byContextKey, context] });

      for await (const entry of entries) {
        const todoId = entry.value;
        const todoResult = await kv.get<Todo>([todoKey, todoId]);

        if (todoResult.value) {
          todos.push(todoResult.value);
        }
      }
    } else {
      // すべてのコンテキストのTodoを取得
      const entries = kv.list<string>({ prefix: [byContextKey] });

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
      message: "Unexpected error occurred while getting todos by context",
      cause: error,
    });
  }
};
