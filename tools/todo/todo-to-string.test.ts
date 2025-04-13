import { todoToString } from "./todo-to-string.ts";
import type { Todo } from "./types.ts";
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
