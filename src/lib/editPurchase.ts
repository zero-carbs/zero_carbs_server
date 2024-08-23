import { purchase } from "../db/schema";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const editPurchase = async ({
  userId,
  db,
  data,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  data: any;
}) => {
  const purchaseRes = await db
    .update(purchase)
    .set(data)
    .where(and(eq(purchase.userId, userId), eq(purchase.id, data.id)))
    .returning();

  return purchaseRes;
};
