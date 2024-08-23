import { settings, sources } from "../db/schema";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const updateSettings = async ({
  userId,
  newSettings,
  db,
}: {
  userId: string;
  newSettings: schema.DbUserSettings;
  db: NodePgDatabase<typeof schema>;
}) => {
  const updatedSettings = await db
    .update(settings)
    .set({ ...newSettings })
    .where(eq(settings.userId, userId))
    .returning();

  return updatedSettings;
};

export const addSource = async ({
  userId,
  newSource,
  db,
}: {
  userId: string;
  newSource: { sourceName: string; sourceLabel: string };
  db: NodePgDatabase<typeof schema>;
}) => {
  const sourceToAdd = { userId, ...newSource };
  const addSourceRes = await db.transaction(async (tx) => {
    await tx.insert(sources).values(sourceToAdd);

    const allSettings = await tx
      .select()
      .from(settings)
      .where(eq(settings.userId, userId));

    return allSettings;
  });
  return addSourceRes;
};

export const removeSource = async ({
  userId,
  sourceToRemove,
  db,
}: {
  userId: string;
  sourceToRemove: { sourceName: string; sourceLabel: string };
  db: NodePgDatabase<typeof schema>;
}) => {
  const removeSourceRes = await db.transaction(async (tx) => {
    await tx
      .delete(sources)
      .where(
        and(
          eq(sources.userId, userId),
          eq(sources.sourceName, sourceToRemove.sourceName),
        ),
      );

    const allSettings = await tx
      .select()
      .from(settings)
      .where(eq(settings.userId, userId));

    return allSettings;
  });
  return removeSourceRes;
};
