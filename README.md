# mcp-todo

todo.txt形式に基づいたTodo管理ツールをMCP（Model Context
Protocol）サーバーとして提供します。 データは
[deno kv](https://docs.deno.com/deploy/kv/manual/)
を利用してローカルに保持されます。

## 必要条件

- [deno](https://deno.com/)

## セットアップ

### MCPサーバー設定

Clineなどのクライアントツールで使用するために、MCPサーバー設定を構成します。
以下の設定をMCPサーバ設定に追加してください。

```json
{
  "mcpServers": {
    "mcp-todo": {
      "command": "deno",
      "args": [
        "run",
        "-A",
        "--unstable-kv",
        "jsr:@showichiro/mcp-todo"
      ]
    }
  }
}
```

注意:
`/path/to/mcp-todo/server.ts`は、クローンしたリポジトリの実際のパスに置き換えてください。

## 機能

このMCPサーバーは以下のツールを提供します（開発中で随時追加予定）：

### Todoツール

- `mcp_todo_create`: 新しいTodoアイテムを作成
- `mcp_todo_get_by_id`: IDによってTodoアイテムを取得
- `mcp_todo_get_all`: すべてのTodoアイテムを取得
- `mcp_todo_get_by_priority`: 優先度によってTodoアイテムをフィルタリング
- `mcp_todo_get_by_context`: コンテキストによってTodoアイテムをフィルタリング

## Todo形式

このツールは[todo.txt形式](https://github.com/todotxt/todo.txt)に基づいています。Todoアイテムは以下の要素を含むことができます：

- 完了状態（完了した場合は「x」で始まる）
- 優先度（A-Zの文字、括弧で囲まれる）
- 作成日（YYYY-MM-DD形式）
- 完了日（完了している場合、YYYY-MM-DD形式）
- 説明（Todoの内容）
- プロジェクト（「+」で始まる）
- コンテキスト（「@」で始まる）
- タグ（「key:value」形式）

例：

```
x (A) 2023-04-01 2023-03-15 レポートを完成させる +仕事 @オフィス 締切:2023-04-01
```

## 使用例

### 新しいTodoの作成

```json
{
  "description": "買い物に行く",
  "priority": "B",
  "projects": ["個人"],
  "contexts": ["外出"],
  "tags": {
    "締切": "2023-04-15"
  }
}
```

### 優先度によるTodoの取得

```json
{
  "priority": "A"
}
```

### コンテキストによるTodoの取得

```json
{
  "context": "仕事"
}
```

### すべてのTodoの取得

```json
{
  "random_string": "dummy"
}
```
