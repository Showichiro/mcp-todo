import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getTodoById } from "./get-todo-by-id.ts";
import { createTodo } from "./create-todo.ts";
import type { Todo } from "../types.ts";

describe("getTodoById", () => {
  it("should get a todo by id successfully", async () => {
    const kv = await Deno.openKv(":memory:");

    // First, create a todo
    const todoData: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Test todo",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const createResult = await createTodo(kv, todoData);
    if (!createResult.ok) {
      throw new Error("Failed to create todo for test");
    }

    // Then, get the todo by id
    const result = await getTodoById(kv, createResult.data.id);

    if (!result.ok) {
      throw new Error("Failed to get todo");
    }

    const todo = result.data.todo;
    assertEquals(todo.description, todoData.description);
    assertEquals(todo.projects, todoData.projects);
    assertEquals(todo.contexts, todoData.contexts);
    assertEquals(todo.tags, todoData.tags);
    assertEquals(todo.priority, todoData.priority);
    assertEquals(todo.completed, todoData.completed);

    kv.close();
  });

  it("should return error when todo not found", async () => {
    const kv = await Deno.openKv(":memory:");

    const result = await getTodoById(kv, "non-existent-id");
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(
        result.error.message,
        "Todo with id non-existent-id not found",
      );
    }

    kv.close();
  });

  it("should handle errors gracefully", async () => {
    const kv = await Deno.openKv(":memory:");
    await kv.close(); // Close KV to force an error

    const result = await getTodoById(kv, "some-id");
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertExists(result.error.message);
    }
  });
});
