import {
  byCompletion,
  byContextKey,
  byPriorityKey,
  byProjectKey,
  todoKey,
} from "../constants.ts";
import type { Todo } from "../types.ts";

export const getTodoKey = (id: string) => {
  return [todoKey, id] as const;
};

export const getProjectIndexListKey = (project: Todo["projects"][number]) => {
  return [byProjectKey, project] as const;
};

export const getContextIndexListKey = (context: Todo["contexts"][number]) => {
  return [byContextKey, context] as const;
};

export const getPriorityIndexListKey = (priority: Todo["priority"]) => {
  return [byPriorityKey, priority ?? ""] as const;
};

export const getCompletionIndexListKey = (completed: Todo["completed"]) => {
  return [byCompletion, completed] as const;
};
