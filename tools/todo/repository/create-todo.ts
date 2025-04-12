import { generateUUID } from "../../../utils/generate-uuid.ts";
import {
  byCompletion,
  byContextKey,
  byPriorityKey,
  byProjectKey,
  todoKey,
} from "../constants.ts";
import { err, ok, Result } from "../../../utils/result.ts";
import { Todo } from "../types.ts";

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
    atomic.set([todoKey, id], todoWithId);

    // プロジェクトごとのインデックス
    for (const project of todo.projects) {
      atomic.set([byProjectKey, project, id], id);
    }

    // コンテキストごとのインデックス
    for (const context of todo.contexts) {
      atomic.set([byContextKey, context, id], id);
    }

    // 優先度のインデックス
    atomic.set([byPriorityKey, todo.priority ?? "", id], id);

    // 完了状態のインデックス
    atomic.set([byCompletion, todo.completed, id], id);

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
