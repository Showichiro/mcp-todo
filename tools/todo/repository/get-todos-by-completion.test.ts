import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getTodosByCompletion } from "./get-todos-by-completion.ts";
import { createTodo } from "./create-todo.ts";
import type { Todo } from "../types.ts";

describe("getTodosByCompletion", () => {
  it("should get completed todos successfully", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create completed and uncompleted todos
    const completedTodo: Omit<Todo, "id"> = {
      completed: true,
      completedAt: new Date(),
      createdAt: new Date(),
      description: "Completed todo",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const uncompletedTodo: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Uncompleted todo",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "B",
    };

    const createResult1 = await createTodo(kv, completedTodo);
    const createResult2 = await createTodo(kv, uncompletedTodo);

    if (!createResult1.ok || !createResult2.ok) {
      throw new Error("Failed to create todos for test");
    }

    // Get completed todos
    const result = await getTodosByCompletion(kv, true);

    if (!result.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result.data.todos.length, 1);
    assertEquals(result.data.todos[0].description, completedTodo.description);
    assertEquals(result.data.todos[0].completed, true);

    await kv.close();
  });

  it("should get uncompleted todos successfully", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create completed and uncompleted todos
    const completedTodo: Omit<Todo, "id"> = {
      completed: true,
      completedAt: new Date(),
      createdAt: new Date(),
      description: "Completed todo",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const uncompletedTodo: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Uncompleted todo",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "B",
    };

    const createResult1 = await createTodo(kv, completedTodo);
    const createResult2 = await createTodo(kv, uncompletedTodo);

    if (!createResult1.ok || !createResult2.ok) {
      throw new Error("Failed to create todos for test");
    }

    // Get uncompleted todos
    const result = await getTodosByCompletion(kv, false);

    if (!result.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result.data.todos.length, 1);
    assertEquals(result.data.todos[0].description, uncompletedTodo.description);
    assertEquals(result.data.todos[0].completed, false);

    await kv.close();
  });

  it("should return empty array when no todos with specified completion status exist", async () => {
    const kv = await Deno.openKv(":memory:");

    const result = await getTodosByCompletion(kv, true);
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.data.todos.length, 0);
    }

    await kv.close();
  });

  it("should handle errors gracefully", async () => {
    const kv = await Deno.openKv(":memory:");
    await kv.close(); // Close KV to force an error

    const result = await getTodosByCompletion(kv, true);
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertExists(result.error.message);
    }
  });
});
