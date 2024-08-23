import { createHonoWithDB } from "../factory";
import { getPaginatedListings } from "../lib/getPaginatedData";
import { addListing } from "../lib/addListing";
import { deleteListing } from "../lib/deleteListing";
import { editListing } from "../lib/editListing";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

const listings = createHonoWithDB();

interface TableQueryParams {
  p?: string;
  order?: string;
  sort?: string;
  rows?: string;
}

listings.use(clerkMiddleware());

listings.get("/listings", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const { p, order, sort, rows } = c.req.query() as TableQueryParams;

  const paginatedListings = await getPaginatedListings({
    userId: auth.userId,
    db: c.var.db,
    params: {
      sort: sort || "listingDate",
      order: order || "asc",
      page: p || 1,
      numberOfRows: rows || 20,
    },
  });
  return c.json(paginatedListings);
});

listings.post("/listings", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const postData = await c.req.json();

  const addListingRes = await addListing({
    userId: auth.userId,
    db: c.var.db,
    data: postData,
  });

  return c.json({ status: "ok", message: "success", data: { addListingRes } });
});

listings.put("/listings", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const listingData = await c.req.json();

  const editListingRes = await editListing({
    userId: auth.userId,
    db: c.var.db,
    data: listingData,
  });
  return c.json({ status: "ok", message: "success", data: editListingRes });
});

listings.delete("/listings", async (c) => {
  const auth = getAuth(c);
  const listingData = await c.req.json();
  if (!auth?.userId) {
    return c.notFound();
  }

  const deletedListingRes = await deleteListing({
    userId: auth.userId,
    db: c.var.db,
    data: listingData,
  });
  return c.json({ deletedListingRes, status: "ok", message: "success" });
});

export { listings };
