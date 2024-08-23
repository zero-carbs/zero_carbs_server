import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { purchase, listing, item } from "../db/schema";
import { asc, desc, sql, eq } from "drizzle-orm";
import * as schema from "../db/schema";

export const getAllData = async ({
  userId,
  params,
  db,
}: {
  userId: string;
  params: { sort: string; order: string };
  db: NodePgDatabase<typeof schema>;
}) => {
  const sortOrder = params.order === "desc" ? asc : desc;
  const allTableData = await db.transaction(async (tx) => {
    const dbPurchaseData = await tx.query.purchase.findMany({
      where: eq(purchase.userId, userId),
      with: { items: true },
      orderBy: [sortOrder(sql.identifier(params.sort))],
    });

    const dbListingData = await tx.query.listing.findMany({
      where: eq(listing.userId, userId),
      with: { items: true },
      orderBy: [asc(listing.id)],
    });

    const dbAllItems = await tx.query.item.findMany({
      where: eq(item.userId, userId),
    });

    return { dbPurchaseData, dbListingData, dbAllItems };
  });

  return { allTableData, order: params.order };
};
