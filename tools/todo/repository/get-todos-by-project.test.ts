import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getTodosByProject } from "./get-todos-by-project.ts";
import { createTodo } from "./create-todo.ts";
import type { Todo } from "../types.ts";

describe("getTodosByProject", () => {
  it("should get todos by project successfully", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create todos with different projects
    const todoWithProject1: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with project 1",
      projects: ["project-1"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const todoWithProject2: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with project 2",
      projects: ["project-2"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "B",
    };

    const createResult1 = await createTodo(kv, todoWithProject1);
    const createResult2 = await createTodo(kv, todoWithProject2);

    if (!createResult1.ok || !createResult2.ok) {
      throw new Error("Failed to create todos for test");
    }

    // Get todos with project-1
    const result = await getTodosByProject(kv, "project-1");

    if (!result.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result.data.todos.length, 1);
    assertEquals(
      result.data.todos[0].description,
      todoWithProject1.description,
    );
    assertEquals(result.data.todos[0].projects, todoWithProject1.projects);

    await kv.close();
  });

  it("should get todos with multiple projects", async () => {
    const kv = await Deno.openKv(":memory:");

    // Create a todo with multiple projects
    const todoWithMultipleProjects: Omit<Todo, "id"> = {
      completed: false,
      createdAt: new Date(),
      description: "Todo with multiple projects",
      projects: ["project-1", "project-2"],
      contexts: ["test-context"],
      tags: { "test-tag": "test-value" },
      priority: "A",
    };

    const createResult = await createTodo(kv, todoWithMultipleProjects);

    if (!createResult.ok) {
      throw new Error("Failed to create todo for test");
    }

    // Get todos with project-1
    const result1 = await getTodosByProject(kv, "project-1");

    if (!result1.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result1.data.todos.length, 1);
    assertEquals(
      result1.data.todos[0].description,
      todoWithMultipleProjects.description,
    );
    assertEquals(
      result1.data.todos[0].projects,
      todoWithMultipleProjects.projects,
    );

    // Get todos with project-2
    const result2 = await getTodosByProject(kv, "project-2");

    if (!result2.ok) {
      throw new Error("Failed to get todos");
    }

    assertEquals(result2.data.todos.length, 1);
    assertEquals(
      result2.data.todos[0].description,
      todoWithMultipleProjects.description,
    );
    assertEquals(
      result2.data.todos[0].projects,
      todoWithMultipleProjects.projects,
    );

    await kv.close();
  });

  it("should return empty array when no todos with specified project exist", async () => {
    const kv = await Deno.openKv(":memory:");

    const result = await getTodosByProject(kv, "non-existent-project");
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.data.todos.length, 0);
    }

    await kv.close();
  });

  it("should handle errors gracefully", async () => {
    const kv = await Deno.openKv(":memory:");
    await kv.close(); // Close KV to force an error

    const result = await getTodosByProject(kv, "some-project");
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertExists(result.error.message);
    }
  });
});
