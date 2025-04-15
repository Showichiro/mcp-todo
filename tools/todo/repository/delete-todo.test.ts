import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { deleteTodo } from "./delete-todo.ts";
import { createTodo } from "./create-todo.ts";
import { getTodoById } from "./get-todo-by-id.ts";
import type { Todo } from "../types.ts";
import { getTodoKey } from "../utils/get-kv-key.ts";

describe("deleteTodo", () => {
  it("should delete a todo successfully", async () => {
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

    // Verify the todo exists
    const todoBeforeDelete = await getTodoById(kv, createResult.data.id);
    if (!todoBeforeDelete.ok) {
      throw new Error("Todo should exist before deletion");
    }

    // Delete the todo
    const result = await deleteTodo(kv, createResult.data.id);

    if (!result.ok) {
      throw new Error("Failed to delete todo");
    }

    assertEquals(result.data.id, createResult.data.id);

    // Verify the todo was deleted
    const todoAfterDelete = await kv.get(getTodoKey(createResult.data.id));
    assertEquals(todoAfterDelete.value, null);

    kv.close();
  });

  it("should succeed even if todo does not exist", async () => {
    const kv = await Deno.openKv(":memory:");

    const result = await deleteTodo(kv, "non-existent-id");
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
    kv.close(); // Close KV to force an error

    const result = await deleteTodo(kv, "some-id");
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertExists(result.error.message);
    }
  });
});
