import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { purchase, listing, item } from "../db/schema";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";

export const getExportData = async ({
  userId,
  params,
  db,
}: {
  userId: string;
  params: {
    format: "json";
    tablesToExport: ("purchases" | "listings" | "items")[];
  };
  db: NodePgDatabase<typeof schema>;
}) => {
  const { tablesToExport } = params;

  const exportedData = await db.transaction(async (tx) => {
    const purchaseData = async () =>
      await tx.query.purchase.findMany({
        where: eq(purchase.userId, userId),
        with: { items: true },
      });

    const listingData = async () =>
      await tx.query.listing.findMany({
        where: eq(listing.userId, userId),
        with: { items: true },
      });

    const itemData = async () =>
      await tx.query.item.findMany({
        where: eq(item.userId, userId),
      });

    const withNulls = {
      purchases: tablesToExport.includes("purchases")
        ? await purchaseData()
        : null,
      listings: tablesToExport.includes("listings")
        ? await listingData()
        : null,
      items: tablesToExport.includes("items") ? await itemData() : null,
    };

    const removeNulls = (obj: any) =>
      Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null));
    const withoutNulls = removeNulls(withNulls);

    return withoutNulls;
  });

  return exportedData;
};
