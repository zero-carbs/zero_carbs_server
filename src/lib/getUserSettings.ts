import { eq } from "drizzle-orm";
import { settings } from "../db/schema";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const getUserSettings = async ({
  userId,
  db,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
}) => {
  const allSettings = await db.transaction(async (tx) => {
    const userData: any = await tx.query.settings.findFirst({
      where: eq(settings.userId, userId),
    });

    const userSources: any = await tx.query.sources.findMany({
      where: eq(settings.userId, userId),
    });

    return { ...userData, sources: userSources };
  });

  return allSettings;
};
