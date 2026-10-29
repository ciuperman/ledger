import { createFileRoute } from "@tanstack/react-router";

// Per-user JSON documents (ledger.v2, keel.v2, keel.board.v1) in Postgres.
// Every query is scoped to the verified session user id.
const KEYS = new Set(["ledger.v2", "keel.v2", "keel.board.v1"]);
const MAX_BYTES = 5_000_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function authed(): Promise<string | Response> {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  const { requireUserId } = await import("@/lib/auth/verify.server");
  try {
    assertSameSiteRequest();
    return await requireUserId();
  } catch {
    return json({ error: "unauthorized" }, 401);
  }
}

export const Route = createFileRoute("/api/docs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await authed();
        if (userId instanceof Response) return userId;
        const key = new URL(request.url).searchParams.get("key") ?? "";
        if (!KEYS.has(key)) return json({ error: "bad key" }, 400);
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const rows = await sql<{ data: unknown; updated_at: number }>`
          select data, updated_at from user_docs where user_id = ${userId} and key = ${key}`;
        const row = rows[0];
        return json(row ? { data: row.data, updatedAt: Number(row.updated_at) } : null);
      },
      PUT: async ({ request }) => {
        const userId = await authed();
        if (userId instanceof Response) return userId;
        const text = await request.text();
        if (text.length > MAX_BYTES) return json({ error: "too large" }, 413);
        let body: { key?: unknown; data?: unknown; updatedAt?: unknown };
        try {
          body = JSON.parse(text);
        } catch {
          return json({ error: "bad json" }, 400);
        }
        const key = String(body.key ?? "");
        const updatedAt = Number(body.updatedAt);
        if (!KEYS.has(key) || !Number.isFinite(updatedAt) || !body.data || typeof body.data !== "object") {
          return json({ error: "bad request" }, 400);
        }
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        await sql`
          insert into user_docs (user_id, key, data, updated_at)
          values (${userId}, ${key}, ${JSON.stringify(body.data)}::jsonb, ${updatedAt})
          on conflict (user_id, key) do update set data = excluded.data, updated_at = excluded.updated_at`;
        return json({ ok: true });
      },
    },
  },
});
