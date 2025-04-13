import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getTodosByPriority } from "./get-todos-by-priority.ts";
import { createTodo } from "./create-todo.ts";
import type { Todo } from "../types.ts";

describe("getTodosByPriority", () => {
  it("should get todos by priority successfully", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create todos with different priorities
    const todoWithPriorityA: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with priority A",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const todoWithPriorityB: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with priority B",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "B",
    };

    const createResult1 = await createTodo(kv, todoWithPriorityA);
    const createResult2 = await createTodo(kv, todoWithPriorityB);

    if (!createResult1.ok || !createResult2.ok) {
      throw new Error("Failed to create todos for test");
    }

    // Get todos with priority A
    const result = await getTodosByPriority(kv, "A");

    if (!result.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result.data.todos.length, 1);
    assertEquals(
      result.data.todos[0].description,
      todoWithPriorityA.description,
    );
    assertEquals(result.data.todos[0].priority, todoWithPriorityA.priority);

    await kv.close();
  });

  it("should get all todos when priority is not provided", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create todos with different priorities
    const todoWithPriorityA: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with priority A",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const todoWithPriorityB: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with priority B",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "B",
    };

    const createResult1 = await createTodo(kv, todoWithPriorityA);
    const createResult2 = await createTodo(kv, todoWithPriorityB);

    if (!createResult1.ok || !createResult2.ok) {
      throw new Error("Failed to create todos for test");
    }

    // Get all todos
    const result = await getTodosByPriority(kv);

    if (!result.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result.data.todos.length, 2);

    // Sort todos by description to make comparison stable
    const sortedTodos = result.data.todos.sort((a, b) =>
      a.description.localeCompare(b.description)
    );

    assertEquals(sortedTodos[0].description, todoWithPriorityA.description);
    assertEquals(sortedTodos[0].priority, todoWithPriorityA.priority);
    assertEquals(sortedTodos[1].description, todoWithPriorityB.description);
    assertEquals(sortedTodos[1].priority, todoWithPriorityB.priority);

    await kv.close();
  });

  it("should return empty array when no todos with specified priority exist", async () => {
    const kv = await Deno.openKv(":memory:");

    const result = await getTodosByPriority(kv, "C");
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.data.todos.length, 0);
    }

    await kv.close();
  });

  it("should handle errors gracefully", async () => {
    const kv = await Deno.openKv(":memory:");
    await kv.close(); // Close KV to force an error

    const result = await getTodosByPriority(kv, "A");
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertExists(result.error.message);
    }
  });
});
