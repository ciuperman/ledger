import { createFileRoute } from "@tanstack/react-router";
import { KeelBoard } from "@/components/keel/board";

export const Route = createFileRoute("/keel")({
  head: () => ({
    meta: [{ title: "Keel" }],
  }),
  component: KeelPage,
});

function KeelPage() {
  return <KeelBoard />;
}
