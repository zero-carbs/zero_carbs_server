import { item } from "../db/schema";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const editItem = async ({
  userId,
  db,
  data,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  data: any;
}) => {
  const itemRes = await db
    .update(item)
    .set(data)
    .where(and(eq(item.userId, userId), eq(item.id, data.id)))
    .returning();

  return itemRes;
};
