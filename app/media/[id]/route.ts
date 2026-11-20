import { eq } from "drizzle-orm";
import { getDb, schema as t } from "@/lib/db";

/** Images uploaded in the admin panel, stored in the database. */
export async function GET(_req: Request, ctx: RouteContext<"/media/[id]">) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });
  const db = await getDb();
  const [item] = await db.select().from(t.media).where(eq(t.media.id, id)).limit(1);
  if (!item) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(item.data), {
    headers: { "Content-Type": item.contentType, "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" },
  });
}
