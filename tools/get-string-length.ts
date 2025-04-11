import { assert } from "@std/assert";
import { Module } from "../types.ts";
import { $object, $string } from "@showichiro/validators";

const $param = $object(
  {
    input: $string,
  },
  false,
);

export const GetStringLengthModule: Module = {
  tool: {
    name: "getStringLength",
    description: "Get the length of a string",
    inputSchema: {
      type: "object",
      properties: {
        input: { type: "string", description: "The input string" },
      },
      required: ["input"],
    },
  },
  handler: (args: unknown) => {
    if ($param(args)) {
      const { input } = args;
      return {
        content: [
          {
            type: "text",
            text: `${Array.from(input).length}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: "Expected input",
          },
        ],
        isError: true,
      };
    }
  },
};

Deno.test("getStringLength is Defined", () => {
  assert(GetStringLengthModule !== undefined);
  assert(GetStringLengthModule.tool !== undefined);
  assert(GetStringLengthModule.handler !== undefined);
});

Deno.test("getStringLength", async () => {
  const result = await GetStringLengthModule.handler({
    input: "Hello, world!",
  });
  assert(result.content[0].type === "text");
  assert(result.content[0].text === "13");
});
