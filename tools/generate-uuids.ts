import { Module } from "../types.ts";
import { $number, $object } from "@showichiro/validators";

export const GenerateUUIDsModule: Module = {
  tool: {
    name: "generateUUIDs",
    description: "Generate a specified number of UUIDs",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "The number of UUIDs to generate",
        },
      },
      required: ["count"],
    },
  },
  handler: (args: unknown) => {
    const $param = $object(
      {
        count: $number,
      },
      false,
    );

    if ($param(args)) {
      const { count } = args;

      const uuids = Array.from({ length: count }, () => crypto.randomUUID());

      return {
        content: uuids.map((uuid) => ({ type: "text", text: uuid })),
        isError: false,
      };
    } else {
      return {
        content: [{ type: "text", text: "Invalid count" }],
        isError: true,
      };
    }
  },
};
