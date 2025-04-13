import type { Todo } from "./types.ts";

export const todoToString = (todo: Todo) => {
  const parts: string[] = [];

  // Add ID
  parts.push(`#id:${todo.id}`);

  // Add completion status
  if (todo.completed) {
    parts.push("x");
  }

  // Add priority if exists
  if (todo.priority) {
    parts.push(`(${todo.priority})`);
  }

  // Add completion date if completed
  if (todo.completed && todo.completedAt) {
    parts.push(todo.completedAt.toISOString().split("T")[0]);
  }

  // Add creation date
  parts.push(todo.createdAt.toISOString().split("T")[0]);

  // Add description
  parts.push(todo.description);

  // Add projects
  todo.projects.forEach((project) => {
    parts.push(`+${project}`);
  });

  // Add contexts
  todo.contexts.forEach((context) => {
    parts.push(`@${context}`);
  });

  // Add tags
  Object.entries(todo.tags).forEach(([key, value]) => {
    parts.push(`${key}:${value}`);
  });

  return parts.join(" ");
};
