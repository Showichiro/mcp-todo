import { err, isErr, isOk, ok } from "./result.ts";

Deno.test("ok - should create Ok result", () => {
  const data = "test data";
  const result = ok(data);

  if (!result.ok) {
    throw new Error("Result should be ok");
  }
  if (result.data !== data) {
    throw new Error(`Data should be "${data}" but got "${result.data}"`);
  }
});

Deno.test("err - should create Err result", () => {
  const error = new Error("test error");
  const result = err(error);

  if (result.ok) {
    throw new Error("Result should be error");
  }
  if (result.error !== error) {
    throw new Error("Error object does not match");
  }
});

Deno.test("isOk - should correctly identify Ok results", () => {
  const okResult = ok("test");
  const errResult = err("error");

  if (!isOk(okResult)) {
    throw new Error("Should identify Ok result");
  }
  if (isOk(errResult)) {
    throw new Error("Should not identify Err as Ok");
  }
});

Deno.test("isErr - should correctly identify Err results", () => {
  const okResult = ok("test");
  const errResult = err("error");

  if (!isErr(errResult)) {
    throw new Error("Should identify Err result");
  }
  if (isErr(okResult)) {
    throw new Error("Should not identify Ok as Err");
  }
});
