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
  for (const project of todo.projects) {
    parts.push(`+${project}`);
  }

  // Add contexts
  for (const context of todo.contexts) {
    parts.push(`@${context}`);
  }

  // Add tags
  for (const [key, value] of Object.entries(todo.tags)) {
    parts.push(`${key}:${value}`);
  }

  return parts.join(" ");
};

// Tests
Deno.test("todoToString - basic todo without optional fields", () => {
  const todo: Todo = {
    id: "123",
    completed: false,
    createdAt: new Date("2024-01-01"),
    description: "Test todo",
    projects: [],
    contexts: [],
    tags: {},
  };

  const expected = "#id:123 2024-01-01 Test todo";
  const result = todoToString(todo);

  if (result !== expected) {
    throw new Error(`Expected "${expected}" but got "${result}"`);
  }
});

Deno.test("todoToString - completed todo with all fields", () => {
  const todo: Todo = {
    id: "456",
    completed: true,
    completedAt: new Date("2024-02-01"),
    createdAt: new Date("2024-01-01"),
    priority: "A",
    description: "Complete todo",
    projects: ["work", "coding"],
    contexts: ["office", "computer"],
    tags: { due: "2024-03-01", category: "dev" },
  };

  const expected =
    "#id:456 x (A) 2024-02-01 2024-01-01 Complete todo +work +coding @office @computer due:2024-03-01 category:dev";
  const result = todoToString(todo);

  if (result !== expected) {
    throw new Error(`Expected "${expected}" but got "${result}"`);
  }
});

Deno.test("todoToString - todo with priority but not completed", () => {
  const todo: Todo = {
    id: "789",
    completed: false,
    createdAt: new Date("2024-01-01"),
    priority: "B",
    description: "Priority todo",
    projects: ["personal"],
    contexts: ["home"],
    tags: {},
  };

  const expected = "#id:789 (B) 2024-01-01 Priority todo +personal @home";
  const result = todoToString(todo);

  if (result !== expected) {
    throw new Error(`Expected "${expected}" but got "${result}"`);
  }
});
