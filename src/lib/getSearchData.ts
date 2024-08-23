import { purchase, listing, item } from "../db/schema";
import { ilike, and, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const getSearchData = async ({
  userId,
  db,
  params,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  params: {
    q: string;
    sp?: string | boolean;
    sl?: string | boolean;
    si?: string | boolean;
  };
}) => {
  const { q, sp, sl, si } = params;
  const searchData = await db.transaction(async (tx) => {
    const defaultSelection = !sp && !sl && !si;

    const purchaseRes =
      (defaultSelection || sp === "true") &&
      (await tx.query.purchase.findMany({
        where: and(
          eq(purchase.userId, userId),
          ilike(purchase.purchaseName, `%${q}%`),
        ),
        with: { items: true },
      }));

    const listingRes =
      (defaultSelection || sl === "true") &&
      (await tx.query.listing.findMany({
        where: and(
          eq(listing.userId, userId),
          ilike(listing.listingName, `%${q}%`),
        ),
        with: { items: true },
      }));

    const itemRes =
      (defaultSelection || si === "true") &&
      (await tx.query.item.findMany({
        where: and(eq(item.userId, userId), ilike(item.itemName, `%${q}%`)),
      }));

    const searchRes = {
      purchaseRes: purchaseRes || [],
      listingRes: listingRes || [],
      itemRes: itemRes || [],
    };

    return searchRes;
  });

  return searchData;
};
