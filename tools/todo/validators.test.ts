import { priorities } from "./types.ts";
import { $priority } from "./validators.ts";

// Tests
Deno.test("$priority validator - valid priorities", () => {
  priorities.forEach((priority) => {
    if (!$priority(priority)) {
      throw new Error(`Priority ${priority} should be valid`);
    }
  });
});

Deno.test("$priority validator - invalid values", () => {
  const invalidValues = [null, undefined, 123, "invalid", "z", "", [], {}];

  invalidValues.forEach((value) => {
    if ($priority(value)) {
      throw new Error(`Value ${value} should be invalid`);
    }
  });
});
