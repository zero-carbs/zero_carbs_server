import { users } from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

export const getUser = async ({
  userId,
  db,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
}) => {
  const userRes = await db.select().from(users).where(eq(users.userId, userId));

  return userRes[0];
};
