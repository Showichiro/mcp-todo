import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getAllTodos } from "./get-all-todos.ts";
import { createTodo } from "./create-todo.ts";
import type { Todo } from "../types.ts";

describe("getAllTodos", () => {
  it("should get all todos successfully", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create multiple todos
    const todoData1: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Test todo 1",
      projects: ["test-project-1"],
      contexts: ["test-context-1"],
      tags: { "test-tag-1": "test-value-1" },
      priority: "A",
    };

    const todoData2: Omit<Todo, "id"> = {
      completed: true,
      createdAt: new Date(),
      description: "Test todo 2",
      projects: ["test-project-2"],
      contexts: ["test-context-2"],
      tags: { "test-tag-2": "test-value-2" },
      priority: "B",
    };

    const createResult1 = await createTodo(kv, todoData1);
    const createResult2 = await createTodo(kv, todoData2);

    if (!createResult1.ok || !createResult2.ok) {
      throw new Error("Failed to create todos for test");
    }

    // Get all todos
    const result = await getAllTodos(kv);

    if (!result.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result.data.todos.length, 2);

    // Sort todos by description to make comparison stable
    const sortedTodos = result.data.todos.sort((a, b) =>
      a.description.localeCompare(b.description)
    );

    assertEquals(sortedTodos[0].description, todoData1.description);
    assertEquals(sortedTodos[0].projects, todoData1.projects);
    assertEquals(sortedTodos[0].contexts, todoData1.contexts);
    assertEquals(sortedTodos[0].tags, todoData1.tags);
    assertEquals(sortedTodos[0].priority, todoData1.priority);
    assertEquals(sortedTodos[0].completed, todoData1.completed);

    assertEquals(sortedTodos[1].description, todoData2.description);
    assertEquals(sortedTodos[1].projects, todoData2.projects);
    assertEquals(sortedTodos[1].contexts, todoData2.contexts);
    assertEquals(sortedTodos[1].tags, todoData2.tags);
    assertEquals(sortedTodos[1].priority, todoData2.priority);
    assertEquals(sortedTodos[1].completed, todoData2.completed);

    await kv.close();
  });

  it("should return empty array when no todos exist", async () => {
    const kv = await Deno.openKv(":memory:");

    const result = await getAllTodos(kv);
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.data.todos.length, 0);
    }

    await kv.close();
  });

  it("should handle errors gracefully", async () => {
    const kv = await Deno.openKv(":memory:");
    await kv.close(); // Close KV to force an error

    const result = await getAllTodos(kv);
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertExists(result.error.message);
    }
  });
});
