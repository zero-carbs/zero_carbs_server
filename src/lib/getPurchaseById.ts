import { purchase } from "../db/schema";
import { and, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const getPurchaseById = async ({
  userId,
  db,
  purchaseId,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  purchaseId: string;
}) => {
  const purchaseData = await db
    .select()
    .from(purchase)
    .where(and(eq(purchase.userId, userId), eq(purchase.id, purchaseId)));

  return purchaseData;
};
