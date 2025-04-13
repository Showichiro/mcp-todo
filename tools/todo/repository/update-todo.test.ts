import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { updateTodo } from "./update-todo.ts";
import { createTodo } from "./create-todo.ts";
import { getTodoById } from "./get-todo-by-id.ts";
import type { Todo } from "../types.ts";

describe("updateTodo", () => {
  it("should update a todo successfully", async () => {
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

    // Update the todo
    const updateData = {
      description: "Updated todo",
      priority: "B" as const,
      projects: ["updated-project"],
      contexts: ["updated-context"],
      tags: { "updated-tag": "updated-value" },
    };

    const result = await updateTodo(kv, createResult.data.id, updateData);

    if (!result.ok) {
      throw new Error("Failed to update todo");
    }

    // Verify the todo was updated
    const updatedTodo = result.data.todo;
    assertEquals(updatedTodo.description, updateData.description);
    assertEquals(updatedTodo.priority, updateData.priority);
    assertEquals(updatedTodo.projects, updateData.projects);
    assertEquals(updatedTodo.contexts, updateData.contexts);
    assertEquals(updatedTodo.tags, updateData.tags);
    assertEquals(updatedTodo.completed, todoData.completed);
    assertEquals(updatedTodo.createdAt.getTime(), todoData.createdAt.getTime());

    // Verify the todo was updated in KV
    const getTodoResult = await getTodoById(kv, createResult.data.id);
    if (!getTodoResult.ok) {
      throw new Error("Failed to get updated todo");
    }
    assertEquals(getTodoResult.data.todo, updatedTodo);

    await kv.close();
  });

  it("should handle completion status changes correctly", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create an uncompleted todo
    const todoData: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Test todo",
      projects: [],
      contexts: [],
      tags: {},
    };

    const createResult = await createTodo(kv, todoData);
    if (!createResult.ok) {
      throw new Error("Failed to create todo for test");
    }

    // Mark as completed
    const completeResult = await updateTodo(kv, createResult.data.id, {
      completed: true,
    });

    if (!completeResult.ok) {
      throw new Error("Failed to complete todo");
    }

    assertEquals(completeResult.data.todo.completed, true);
    assertExists(completeResult.data.todo.completedAt);

    // Mark as uncompleted
    const uncompletedResult = await updateTodo(kv, createResult.data.id, {
      completed: false,
    });

    if (!uncompletedResult.ok) {
      throw new Error("Failed to uncompleted todo");
    }

    assertEquals(uncompletedResult.data.todo.completed, false);
    assertEquals(uncompletedResult.data.todo.completedAt, undefined);

    await kv.close();
  });

  it("should return error when todo does not exist", async () => {
    const kv = await Deno.openKv(":memory:");

    const result = await updateTodo(kv, "non-existent-id", {
      description: "Updated description",
    });
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(
        result.error.message,
        "Todo not found with id: non-existent-id",
      );
    }

    await kv.close();
  });

  it("should handle errors gracefully", async () => {
    const kv = await Deno.openKv(":memory:");
    await kv.close(); // Close KV to force an error

    const result = await updateTodo(kv, "some-id", {
      description: "Updated description",
    });
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertExists(result.error.message);
    }
  });
});
