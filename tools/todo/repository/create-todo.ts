import { generateUUID } from "../../../utils/generate-uuid.ts";
import { err, ok, type Result } from "../../../utils/result.ts";
import type { Todo } from "../types.ts";
import {
  getCompletionIndexListKey,
  getContextIndexListKey,
  getPriorityIndexListKey,
  getProjectIndexListKey,
  getTodoKey,
} from "../utils/get-kv-key.ts";

export type CreateTodoSuccess = {
  id: string;
};

export type CreateTodoError = {
  message: string;
  cause?: unknown;
};

export const createTodo = async (
  kv: Deno.Kv,
  todo: Omit<Todo, "id">,
): Promise<Result<CreateTodoSuccess, CreateTodoError>> => {
  try {
    const id = generateUUID();
    const todoWithId: Todo = { ...todo, id };

    const atomic = kv.atomic();

    // メインのTodoエントリー
    atomic.set(getTodoKey(id), todoWithId);

    // プロジェクトごとのインデックス
    for (const project of todo.projects) {
      atomic.set([...getProjectIndexListKey(project), id], id);
    }

    // コンテキストごとのインデックス
    for (const context of todo.contexts) {
      atomic.set([...getContextIndexListKey(context), id], id);
    }

    // 優先度のインデックス
    atomic.set([...getPriorityIndexListKey(todo.priority), id], id);

    // 完了状態のインデックス
    atomic.set([...getCompletionIndexListKey(todo.completed), id], id);

    const result = await atomic.commit();

    if (!result.ok) {
      return err({
        message: "Failed to commit transaction",
      });
    }

    return ok({ id });
  } catch (error) {
    return err({
      message: "Unexpected error occurred while creating todo",
      cause: error,
    });
  }
};
