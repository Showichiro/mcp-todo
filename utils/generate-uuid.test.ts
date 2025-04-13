import { generateUUID } from "./generate-uuid.ts";

Deno.test("generateUUID - should generate valid UUID", () => {
  const uuid = generateUUID();
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw new Error(`Generated UUID ${uuid} is not valid`);
  }
});

Deno.test("generateUUID - should generate unique UUIDs", () => {
  const uuids = new Set();
  for (let i = 0; i < 1000; i++) {
    const uuid = generateUUID();
    if (uuids.has(uuid)) {
      throw new Error(`Generated duplicate UUID: ${uuid}`);
    }
    uuids.add(uuid);
  }
});
