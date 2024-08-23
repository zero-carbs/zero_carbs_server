import { purchase, listing, item } from "../db/schema";
import { asc, desc, sql, eq, count } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

// ── Purchases ───────────────────────────────────────────────────────
export const getPaginatedPurchases = async ({
  userId,
  db,
  params,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  params: {
    sort: string;
    order: string;
    page: string | number;
    numberOfRows: string | number;
  };
}) => {
  const sortOrder = params.order === "desc" ? asc : desc;
  const data = await db.transaction(async (tx) => {
    const [total] = await tx
      .select({ purchaseId: count() })
      .from(purchase)
      .where(eq(purchase.userId, userId));

    const purchases = await tx.query.purchase.findMany({
      where: eq(purchase.userId, userId),
      with: { items: true },
      orderBy: [sortOrder(sql.identifier(params.sort || "datePurchased"))],
      limit: Number(params.numberOfRows),
      offset: (Number(params.page) - 1) * Number(params.numberOfRows),
    });

    return { total: total.purchaseId, purchases };
  });

  const isLastPage =
    data.total - Number(params.numberOfRows) * Number(params.page) <= 0;

  return { paginatedPurchaseData: data.purchases, isLastPage };
};

// ── Listings ────────────────────────────────────────────────────────
export const getPaginatedListings = async ({
  userId,
  db,
  params,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  params: {
    sort: string;
    order: string;
    page: string | number;
    numberOfRows: string | number;
  };
}) => {
  const sortOrder = params.order === "desc" ? asc : desc;
  const data = await db.transaction(async (tx) => {
    const [total] = await tx
      .select({ listingId: count() })
      .from(listing)
      .where(eq(listing.userId, userId));

    const listings = await tx.query.listing.findMany({
      where: eq(listing.userId, userId),
      with: { items: true },
      orderBy: [sortOrder(sql.identifier(params.sort || "listingDate"))],
      limit: Number(params.numberOfRows),
      offset: (Number(params.page) - 1) * Number(params.numberOfRows),
    });

    return { total: total.listingId, listings };
  });

  const isLastPage =
    data.total - Number(params.numberOfRows) * Number(params.page) <= 0;

  return { paginatedListingData: data.listings, isLastPage };
};

// ── Items ───────────────────────────────────────────────────────────
export const getPaginatedItems = async ({
  userId,
  db,
  params,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  params: {
    sort: string;
    order: string;
    page: string | number;
    numberOfRows: string | number;
  };
}) => {
  const sortOrder = params.order === "desc" ? asc : desc;
  const data = await db.transaction(async (tx) => {
    const [total] = await tx
      .select({ itemId: count() })
      .from(item)
      .where(eq(item.userId, userId));

    const items = await tx.query.item.findMany({
      where: eq(item.userId, userId),
      orderBy: [sortOrder(sql.identifier(params.sort || "id"))],
      limit: Number(params.numberOfRows),
      offset: (Number(params.page) - 1) * Number(params.numberOfRows),
    });

    return { total: total.itemId, items };
  });

  const isLastPage =
    data.total - Number(params.numberOfRows) * Number(params.page) <= 0;

  return { paginatedItemData: data.items, isLastPage };
};
