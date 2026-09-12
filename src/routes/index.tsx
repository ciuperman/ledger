import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/ledger/dashboard";

export const Route = createFileRoute("/")({
  loader: () => ({ nowIso: new Date().toISOString() }),
  component: Home,
});

function Home() {
  const { nowIso } = Route.useLoaderData();
  return <Dashboard nowIso={nowIso} book="ledger" />;
}
