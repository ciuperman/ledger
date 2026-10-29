import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

const KEYS = new Set(["ledger.v2", "keel.v2", "keel.board.v1"]);
const MAX_BYTES = 5_000_000;

function checkKey(key: unknown): string {
  if (typeof key !== "string" || !KEYS.has(key)) throw new Error("Invalid key");
  return key;
}

export const getUserDoc = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { key: string }) => ({ key: checkKey(input?.key) }))
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ data: unknown; updated_at: number }>`
      select data, updated_at from user_docs where user_id = ${context.userId} and key = ${data.key}`;
    const row = rows[0];
    return row ? { json: JSON.stringify(row.data), updatedAt: Number(row.updated_at) } : null;
  });

export const putUserDoc = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { key: string; json: string; updatedAt: number }) => {
    const key = checkKey(input?.key);
    if (typeof input.json !== "string" || input.json.length > MAX_BYTES) throw new Error("Invalid data");
    JSON.parse(input.json);
    const updatedAt = Number(input.updatedAt);
    if (!Number.isFinite(updatedAt)) throw new Error("Invalid updatedAt");
    return { key, json: input.json, updatedAt };
  })
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into user_docs (user_id, key, data, updated_at)
      values (${context.userId}, ${data.key}, ${data.json}::jsonb, ${data.updatedAt})
      on conflict (user_id, key) do update set data = excluded.data, updated_at = excluded.updated_at`;
    return { ok: true };
  });
