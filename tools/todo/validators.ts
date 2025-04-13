import type { Validator } from "@showichiro/validators";
import { priorities, type Priority } from "./types.ts";

// カスタムバリデーター: 優先度の文字列チェック
export const $priority: Validator<Priority> = (
  val: unknown,
): val is Priority => {
  return typeof val === "string" && priorities.includes(val as Priority);
};
