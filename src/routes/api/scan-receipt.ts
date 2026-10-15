import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Receipt = z.object({
  amount: z.number().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  payee: z.string().max(80).optional(),
  note: z.string().max(160).optional(),
  currency: z.string().optional(),
});

export const Route = createFileRoute("/api/scan-receipt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.XAI_API_KEY;
        if (!key) return new Response("Vision not configured", { status: 503 });

        const body = await request.json().catch(() => null);
        const image = typeof body?.image === "string" ? body.image : "";
        if (!image.startsWith("data:image/")) {
          return new Response("Image required", { status: 400 });
        }

        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "grok-4",
            messages: [
              {
                role: "system",
                content: "Extract the total amount (number), date (YYYY-MM-DD), merchant/payee name, and a short note from this receipt. Currency is usually RON. Reply with only valid JSON matching the schema."
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Extract receipt data." },
                  { type: "image_url", image_url: { url: image, detail: "high" } }
                ]
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
          }),
        });

        if (!res.ok) {
          return new Response("Scan failed", { status: 502 });
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content ?? "{}";
        let parsed;
        try {
          parsed = Receipt.parse(JSON.parse(text));
        } catch {
          return new Response("Could not parse receipt", { status: 422 });
        }

        return Response.json(parsed);
      },
    },
  },
});
