import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createTodo } from "./create-todo.ts";
import type { Todo } from "../types.ts";
import {
  getCompletionIndexListKey,
  getContextIndexListKey,
  getPriorityIndexListKey,
  getProjectIndexListKey,
  getTodoKey,
} from "../utils/get-kv-key.ts";

describe("createTodo", () => {
  it("should create a todo successfully", async () => {
    const kv = await Deno.openKv(":memory:");

    const todoData: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Test todo",
      projects: ["test-project"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const result = await createTodo(kv, todoData);

    if (!result.ok) {
      throw new Error("Failed to create todo");
    }

    assertExists(result.data.id);

    // Verify the todo was stored in KV
    const storedTodo = await kv.get(getTodoKey(result.data.id));
    const todo = storedTodo.value as Todo;
    assertEquals(todo.description, todoData.description);
    assertEquals(todo.projects, todoData.projects);
    assertEquals(todo.contexts, todoData.contexts);
    assertEquals(todo.tags, todoData.tags);
    assertEquals(todo.priority, todoData.priority);
    assertEquals(todo.completed, todoData.completed);

    // Verify indexes were created
    const projectIndex = await kv.get([
      ...getProjectIndexListKey("test-project"),
      result.data.id,
    ]);
    const contextIndex = await kv.get([
      ...getContextIndexListKey("test-context"),
      result.data.id,
    ]);
    const priorityIndex = await kv.get([
      ...getPriorityIndexListKey("A"),
      result.data.id,
    ]);
    const completionIndex = await kv.get([
      ...getCompletionIndexListKey(false),
      result.data.id,
    ]);

    assertExists(projectIndex.value);
    assertExists(contextIndex.value);
    assertExists(priorityIndex.value);
    assertExists(completionIndex.value);

    await kv.close();
  });

  it("should handle errors gracefully", async () => {
    const kv = await Deno.openKv(":memory:");
    kv.close(); // Close KV to force an error

    const todoData: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Test todo",
      projects: [],
      contexts: [],
      tags: {},
    };

    const result = await createTodo(kv, todoData);
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertExists(result.error.message);
    }
  });
});
