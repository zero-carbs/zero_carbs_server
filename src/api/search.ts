import { createHonoWithDB } from "../factory";
import { getSearchData } from "../lib/getSearchData";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

const search = createHonoWithDB();

search.use(clerkMiddleware());
search.get("/search", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const { q, sp, sl, si } = c.req.query();

  const searchRes = await getSearchData({
    userId: auth.userId,
    db: c.var.db,
    params: {
      q: q,
      sp: sp || false,
      sl: sl || false,
      si: si || false,
    },
  });

  return c.json(searchRes);
});

export { search };
