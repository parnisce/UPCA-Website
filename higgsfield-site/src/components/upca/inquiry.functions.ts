import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "@/lib/bindings.server";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().default(""),
  package: z.string().trim().max(60).optional().default(""),
  area: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  website: z.string().max(200).optional().default(""),
});

// Saves a consultation request. The `website` field is a honeypot for bots.
export const submitInquiry = createServerFn({ method: "POST" })
  .validator(schema)
  .handler(async ({ data }) => {
    if (data.website) return { ok: true };
    const { DB } = bindings();
    if (!DB) return { ok: false, error: "Requests are unavailable right now." };
    await DB.prepare("INSERT INTO inquiries (id, name, email, phone, package, area, message) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), data.name, data.email, data.phone, data.package, data.area, data.message)
      .run();
    return { ok: true };
  });
