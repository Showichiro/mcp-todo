import { err, ok, Result } from "./result.ts";

export enum FetchError {
  InvalidResponse = "InvalidResponse",
  InvalidJSON = "InvalidJSON",
  InvalidStatusCode = "InvalidStatusCode",
}

export type FetchResult<Response> = Result<Response, FetchError>;

/**
 * 指定されたURLに対してHTTPリクエストを行い、そのレスポンスをJSON形式で返す関数。
 *
 * @param url - リクエストを送信するURL
 * @param options - リクエストのオプション
 * @template Response - レスポンスの型
 * @returns レスポンスのJSONデータ
 */
export const fetcher = async <Response>(
  url: string | URL | Request,
  options: RequestInit = {},
): Promise<FetchResult<Response>> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      return err(FetchError.InvalidStatusCode);
    }
    const data = await response.json();

    return ok(data);
  } catch (_error) {
    return err(FetchError.InvalidJSON);
  }
};
