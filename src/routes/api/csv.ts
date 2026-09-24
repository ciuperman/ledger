import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 1_500_000;

function filenameOf(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80);
  if (!/^[\w.-]+\.csv$/i.test(cleaned)) return "ledger-transactions.csv";
  return cleaned;
}

export const Route = createFileRoute("/api/csv")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const csv = String(form.get("csv") ?? "");
        if (!csv.trim()) return new Response("Empty spreadsheet", { status: 400 });
        if (new TextEncoder().encode(csv).byteLength > MAX_BYTES) {
          return new Response("Spreadsheet is too large", { status: 413 });
        }
        const filename = filenameOf(String(form.get("filename") ?? ""));
        return new Response(csv, {
          headers: {
            "content-type": "application/octet-stream",
            "content-disposition": `attachment; filename="${filename}"`,
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
