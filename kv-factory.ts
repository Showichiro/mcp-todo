/**
 * KVストアを開くためのファクトリ関数
 * @param path KVストアのパス
 * @returns Promise<Deno.Kv>
 * @throws Error KVストアを開けない場合
 */
export const createKv = async (): Promise<Deno.Kv> => {
  try {
    return await Deno.openKv();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to open KV store ${message}`);
  }
};

/**
 * KVストアのライフサイクルを管理する関数
 * @param path KVストアのパス
 * @param fn KVストアを使用する処理
 * @returns Promise<T> 処理の結果
 */
export const withKv = async <T>(
  fn: (kv: Deno.Kv) => Promise<T>,
): Promise<T> => {
  const kv = await createKv();
  try {
    return await fn(kv);
  } finally {
    kv.close();
  }
};
