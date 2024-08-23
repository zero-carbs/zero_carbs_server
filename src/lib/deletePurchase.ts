import { item, purchase } from "../db/schema";
import { eq, inArray, and } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const deletePurchase = async ({
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

  const deletePurchaseRes = await db.transaction(async (tx) => {
    itemIds.length > 0 &&
      (await tx
        .delete(item)
        .where(and(eq(item.userId, userId), inArray(item.id, itemIds))));

    itemIds.length > 0 &&
      (await tx
        .update(purchase)
        .set({ soldTotals: 0 })
        .where(
          and(
            eq(purchase.userId, userId),
            inArray(purchase.id, itemPurchaseIds),
          ),
        ));

    const deleteRes = await tx
      .delete(purchase)
      .where(and(eq(purchase.userId, userId), eq(purchase.id, data.id)))
      .returning();

    return deleteRes;
  });

  return deletePurchaseRes;
};
