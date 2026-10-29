-- Per-user app data: one JSON document per user per collection
-- (ledger.v2, keel.v2, keel.board.v1). Scoped by the signed-in user's id.
create table if not exists user_docs (
  user_id text not null,
  key text not null,
  data jsonb not null,
  updated_at bigint not null,
  primary key (user_id, key)
);
