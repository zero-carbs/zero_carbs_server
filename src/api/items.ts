import { createHonoWithDB } from "../factory";
import { getAllItems } from "../lib/getData";
import { getPaginatedItems } from "../lib/getPaginatedData";
import { getAuth, clerkMiddleware } from "@hono/clerk-auth";
import { editItem } from "../lib/editItem";

const items = createHonoWithDB();

interface TableQueryParams {
  p?: string;
  order?: string;
  sort?: string;
  rows?: string;
}

items.use(clerkMiddleware());
items.get("/all-items", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const allItems = await getAllItems({ userId: auth.userId, db: c.var.db });
  return c.json(allItems);
});

items.get("/items", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const { p, order, sort, rows } = c.req.query() as TableQueryParams;

  const paginatedItems = await getPaginatedItems({
    userId: auth.userId,
    db: c.var.db,
    params: {
      sort: sort || "itemName",
      order: order || "desc",
      page: p || 1,
      numberOfRows: rows || 20,
    },
  });
  return c.json(paginatedItems);
});

items.put("/items", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const editedItemData = await c.req.json();
  const editItemRes = await editItem({
    userId: auth.userId,
    db: c.var.db,
    data: editedItemData,
  });

  return c.json({ status: "ok", message: "success", data: editItemRes });
});

export { items };
