import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getTodosByContext } from "./get-todos-by-context.ts";
import { createTodo } from "./create-todo.ts";
import type { Todo } from "../types.ts";

describe("getTodosByContext", () => {
  it("should get todos by context successfully", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create todos with different contexts
    const todoWithContext1: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with context 1",
      projects: ["test-project"],
      contexts: ["context-1"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const todoWithContext2: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with context 2",
      projects: ["test-project"],
      contexts: ["context-2"],
      tags: { "test-tag": "test-value" },
      priority: "B",
    };

    const createResult1 = await createTodo(kv, todoWithContext1);
    const createResult2 = await createTodo(kv, todoWithContext2);

    if (!createResult1.ok || !createResult2.ok) {
      throw new Error("Failed to create todos for test");
    }

    // Get todos with context-1
    const result = await getTodosByContext(kv, "context-1");

    if (!result.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result.data.todos.length, 1);
    assertEquals(
      result.data.todos[0].description,
      todoWithContext1.description,
    );
    assertEquals(result.data.todos[0].contexts, todoWithContext1.contexts);

    await kv.close();
  });

  it("should get all todos when context is not provided", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create todos with different contexts
    const todoWithContext1: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with context 1",
      projects: ["test-project"],
      contexts: ["context-1"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const todoWithContext2: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with context 2",
      projects: ["test-project"],
      contexts: ["context-2"],
      tags: { "test-tag": "test-value" },
      priority: "B",
    };

    const createResult1 = await createTodo(kv, todoWithContext1);
    const createResult2 = await createTodo(kv, todoWithContext2);

    if (!createResult1.ok || !createResult2.ok) {
      throw new Error("Failed to create todos for test");
    }

    // Get all todos
    const result = await getTodosByContext(kv);

    if (!result.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result.data.todos.length, 2);

    // Sort todos by description to make comparison stable
    const sortedTodos = result.data.todos.sort((a, b) =>
      a.description.localeCompare(b.description)
    );

    assertEquals(sortedTodos[0].description, todoWithContext1.description);
    assertEquals(sortedTodos[0].contexts, todoWithContext1.contexts);
    assertEquals(sortedTodos[1].description, todoWithContext2.description);
    assertEquals(sortedTodos[1].contexts, todoWithContext2.contexts);

    await kv.close();
  });

  it("should return empty array when no todos with specified context exist", async () => {
    const kv = await Deno.openKv(":memory:");

    const result = await getTodosByContext(kv, "non-existent-context");
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.data.todos.length, 0);
    }

    await kv.close();
  });

  it("should handle errors gracefully", async () => {
    const kv = await Deno.openKv(":memory:");
    await kv.close(); // Close KV to force an error

    const result = await getTodosByContext(kv, "some-context");
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertExists(result.error.message);
    }
  });
});
