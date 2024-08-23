import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";

export const getAllItems = async ({
  userId,
  db,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
}) => {
  if (!userId) {
    return;
  }
  const allItems = await db.query.item.findMany();
  return allItems;
};
