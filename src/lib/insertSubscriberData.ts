import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const insertNewSubscriberData = async ({
  userId,
  db,
  squareId,
  subscriptionId,
  subscriptionCreatedAt,
  subscriptionStatus,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  squareId: string;
  subscriptionId: string;
  subscriptionCreatedAt: string;
  subscriptionStatus: string;
}) => {
  const updateSubscriptionRes = await db
    .update(users)
    .set({
      squareId,
      subscriptionId,
      subscriptionCreatedAt,
      subscriptionStatus,
      isSubscribed: true,
    })
    .where(eq(users.userId, userId));

  return { status: "success", data: updateSubscriptionRes };
};
