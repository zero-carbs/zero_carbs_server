import { createHonoWithDB } from "../factory";
import { getAllData } from "../lib/getAllData";
import { getAuth, clerkMiddleware } from "@hono/clerk-auth";

const data = createHonoWithDB();

data.use(clerkMiddleware());
data.get("/chart-data", async (c) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.notFound();
  }

  try {
    const allData = await getAllData({
      userId: auth.userId,
      db: c.var.db,
      params: {
        sort: "datePurchased",
        order: "desc",
      },
    });

    return c.json(allData);
  } catch (err) {
    return c.notFound();
  }
});

export { data };
