import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const updateUserAfterCancel = async ({
  subscriptionId,
  db,
  newSubscriptionStatus,
  canceledDate,
}: {
  subscriptionId: string;
  db: NodePgDatabase<typeof schema>;
  newSubscriptionStatus: string;
  canceledDate: string;
}) => {
  const cancelRes = await db
    .update(users)
    .set({
      isSubscribed: false,
      subscriptionStatus: newSubscriptionStatus,
      subscriptionCanceledDate: canceledDate,
    })
    .where(eq(users.subscriptionId, subscriptionId))
    .returning();

  return cancelRes;
};
