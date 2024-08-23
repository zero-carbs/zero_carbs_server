import { purchase, item } from "../db/schema";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const getData = async ({
  userId,
  db,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
}) => {
  const allData = await db.query.purchase.findMany({
    where: eq(purchase.userId, userId),
  });

  return allData;
};

export const getAllItems = async ({
  userId,
  db,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
}) => {
  const allItems = await db.query.item.findMany({
    where: eq(item.userId, userId),
  });

  return allItems;
};
