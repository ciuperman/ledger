import { createFileRoute } from "@tanstack/react-router";

const MAX_IMAGE_CHARS = 500_000;
const MAX_TEXT_CHARS = 12_000;

function normalizeAmount(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0 && value < 1_000_000_000) {
    return Math.round(value * 100) / 100;
  }
  if (typeof value !== "string") return undefined;
  let s = value.trim().replace(/\s/g, "");
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = Number(s.replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n) || n <= 0 || n >= 1_000_000_000) return undefined;
  return Math.round(n * 100) / 100;
}

function normalizeDate(value: unknown, today = new Date()): string | undefined {
  if (typeof value !== "string") return undefined;
  let iso: string | undefined;
  const full = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (full) iso = calendarDate(Number(full[1]), Number(full[2]), Number(full[3]));
  if (!iso) {
    const dmy = value.match(/(\d{1,2})[./](\d{1,2})[./](\d{2,4})/);
    if (dmy) {
      let year = Number(dmy[3]);
      if (year < 100) year += 2000;
      iso = calendarDate(year, Number(dmy[2]), Number(dmy[1]));
    }
  }
  return iso ? thisYearIfMisread(iso, today) : undefined;
}

function calendarDate(year: number, month: number, day: number): string | undefined {
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function thisYearIfMisread(iso: string, today: Date): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const year = Number(match[1]);
  const current = today.getFullYear();
  if (year !== current - 1) return iso;
  const shifted = `${current}-${match[2]}-${match[3]}`;
  const shiftedTime = new Date(`${shifted}T12:00:00`).getTime();
  const endToday = new Date(current, today.getMonth(), today.getDate(), 23, 59, 59).getTime();
  return shiftedTime <= endToday ? shifted : iso;
}

function clip(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.replace(/\s+/g, " ").trim().slice(0, max);
  return text || undefined;
}

function readItems(value: unknown): { name: string; quantity?: number; unit?: number; price?: number }[] {
  if (!Array.isArray(value)) return [];
  const items: { name: string; quantity?: number; unit?: number; price?: number }[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const record = row as {
      name?: unknown;
      quantity?: unknown;
      qty?: unknown;
      unit?: unknown;
      unitPrice?: unknown;
      pret?: unknown;
      price?: unknown;
      total?: unknown;
      value?: unknown;
    };
    const name = clip(record.name, 80);
    if (!name) continue;
    const quantity = normalizeAmount(record.quantity ?? record.qty);
    const unit = normalizeAmount(record.unit ?? record.unitPrice ?? record.pret);
    const price = normalizeAmount(record.price ?? record.total ?? record.value);
    items.push({
      name,
      quantity: quantity && quantity > 0 && quantity <= 1_000_000 ? quantity : undefined,
      unit,
      price: price ?? unit,
    });
    if (items.length >= 30) break;
  }
  return items;
}

function parseModelJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse(fenced?.[1] ?? trimmed);
}

const ORDER_RULES =
  "This may be a paper receipt or an online order. Read every product line, not only the total. Use the amount actually paid (TOTAL / TOTAL DE PLATA), not a line item. Dates may be YYYY-MM-DD or DD.MM.YYYY. Amounts may use a comma decimal. Payee is the shop. Category is 1-2 words. Items are the products. For each item read the printed unit price (PRET / pret unitar) as unit, and the line amount (VALOARE) as price. Quantity is how many, or 1 if not printed. If only one amount is printed, put it in both unit and price. Skip tax, discount summary, subtotal, and the grand total. At most 30 items.";

async function completeOrder(
  key: string,
  model: string,
  categories: string[],
  userContent: unknown,
  signal: AbortSignal,
): Promise<Response> {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const known = categories.length
    ? `Reuse one of these categories when it fits: ${categories.join(", ")}.`
    : "Otherwise invent a short 1-2 word category.";
  return fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: `${ORDER_RULES} Today is ${todayIso}. The current year is ${today.getFullYear()}. Use ${today.getFullYear()} unless the receipt clearly prints another year. A 2-digit year 26 means ${today.getFullYear()}. ${known} Reply with only JSON: {"amount": number, "date": string, "payee": string, "category": string, "note": string, "items": [{"name": string, "quantity": number, "unit": number, "price": number}]}.`,
        },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2200,
    }),
  });
}

export const Route = createFileRoute("/api/scan-receipt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.XAI_API_KEY;
        if (!key) return new Response("Receipt scan is unavailable.", { status: 503 });

        const body = await request.json().catch(() => null);
        const image = typeof body?.image === "string" ? body.image : "";
        const orderText = typeof body?.text === "string" ? body.text.trim() : "";
        const categories = Array.isArray(body?.categories)
          ? body.categories
              .filter((name: unknown): name is string => typeof name === "string")
              .map((name: string) => name.slice(0, 40))
              .slice(0, 40)
          : [];
        if (!image && orderText.length < 8) {
          return new Response("Photo or order text required.", { status: 400 });
        }
        if (image && !image.startsWith("data:image/")) {
          return new Response("Photo required.", { status: 400 });
        }
        if (image.length > MAX_IMAGE_CHARS || orderText.length > MAX_TEXT_CHARS) {
          return new Response("That photo is too large. Crop closer to the total.", { status: 413 });
        }

        const userContent = image
          ? [
              { type: "text", text: "Extract the receipt or online order." },
              { type: "image_url", image_url: { url: image, detail: "high" } },
            ]
          : `Extract this online order confirmation:\n${orderText.slice(0, MAX_TEXT_CHARS)}`;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 22_000);
        try {
          let res = await completeOrder(key, "grok-4.5", categories, userContent, controller.signal);
          if (res.status === 429 || res.status === 404) {
            res = await completeOrder(key, "grok-4", categories, userContent, controller.signal);
          }
          if (res.status === 429 || res.status === 503) {
            return new Response("Scanner is busy. Try again in a minute.", { status: 503 });
          }
          if (!res.ok) return new Response("Could not read that order.", { status: 502 });

          const data = await res.json().catch(() => null);
          const text = data?.choices?.[0]?.message?.content ?? "";
          let raw: unknown;
          try {
            raw = parseModelJson(typeof text === "string" ? text : "{}");
          } catch {
            return new Response("Could not read that order.", { status: 422 });
          }
          const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
          const parsed = {
            amount: normalizeAmount(row.amount ?? row.total),
            date: normalizeDate(row.date),
            payee: clip(row.payee ?? row.merchant ?? row.vendor, 80),
            category: clip(row.category, 40),
            note: clip(row.note, 160),
            items: readItems(row.items ?? row.products ?? row.lines),
          };
          if (!parsed.amount) {
            return new Response("Couldn't read the total. Crop the bottom of the receipt.", { status: 422 });
          }
          return Response.json(parsed);
        } catch {
          return new Response("Scanner is busy. Try again in a minute.", { status: 503 });
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
