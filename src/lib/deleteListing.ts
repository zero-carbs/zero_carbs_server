import { item, listing, purchase } from "../db/schema";
import { eq, inArray, and } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const deleteListing = async ({
  userId,
  db,
  data,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  data: any;
}) => {
  const itemIds = data?.items?.map((item: any) => item.id);
  const itemPurchaseIds = data?.items?.map((item: any) => item.purchaseId);

  const deleteListingRes = await db.transaction(async (tx) => {
    await tx
      .update(item)
      .set({
        isListed: false,
        isSold: false,
        listingId: null,
        listedSource: null,
        soldDate: null,
      })
      .where(and(eq(item.userId, userId), inArray(item.id, itemIds)));
    await tx
      .update(purchase)
      .set({ soldTotals: 0 })
      .where(
        and(eq(purchase.userId, userId), inArray(purchase.id, itemPurchaseIds)),
      );
    const deleteRes = await tx
      .delete(listing)
      .where(eq(listing.id, data.id))
      .returning();
    return deleteRes;
  });

  return deleteListingRes;
};
