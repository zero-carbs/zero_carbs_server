import { createHonoWithDB } from "../factory";
import { getPaginatedPurchases } from "../lib/getPaginatedData";
import { addPurchase } from "../lib/addPurchase";
import { deletePurchase } from "../lib/deletePurchase";
import { editPurchase } from "../lib/editPurchase";
import { getPurchaseById } from "../lib/getPurchaseById";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

const purchases = createHonoWithDB();

interface TableQueryParams {
  p?: string;
  order?: string;
  sort?: string;
  rows?: string;
}

purchases.use(clerkMiddleware());

purchases.get("/purchases", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const { p, order, sort, rows } = c.req.query() as TableQueryParams;

  const paginatedPurchases = await getPaginatedPurchases({
    userId: auth.userId,
    db: c.var.db,
    params: {
      sort: sort || "datePurchased",
      order: order || "asc",
      page: p || 1,
      numberOfRows: rows || 20,
    },
  });
  return c.json(paginatedPurchases);
});

purchases.get("/purchase", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const { id } = c.req.query();
  const purchaseData = await getPurchaseById({
    userId: auth.userId,
    db: c.var.db,
    purchaseId: id,
  });

  return c.json({ status: "ok", message: "success", data: purchaseData });
});

purchases.post("/purchases", async (c) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.notFound();
  }

  const purchaseData = await c.req.json();

  const addPurchaseRes = await addPurchase({
    userId: auth.userId,
    db: c.var.db,
    data: purchaseData,
  });

  return c.json({ status: "ok", message: "success", data: addPurchaseRes });
});

purchases.put("/purchases", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const purchaseData = await c.req.json();

  const editPurchaseRes = await editPurchase({
    userId: auth.userId,
    db: c.var.db,
    data: purchaseData,
  });
  return c.json({ status: "ok", message: "success", data: editPurchaseRes });
});

purchases.delete("/purchases", async (c) => {
  const auth = getAuth(c);
  const purchaseData = await c.req.json();

  if (!auth?.userId) {
    return c.notFound();
  }

  const deletedPurchaseRes = await deletePurchase({
    userId: auth.userId,
    db: c.var.db,
    data: purchaseData,
  });

  return c.json({
    deletedPurchaseRes: deletedPurchaseRes,
    status: "ok",
    message: "success",
  });
});

export { purchases };
