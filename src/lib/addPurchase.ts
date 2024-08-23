import { item, purchase, sources } from "../db/schema";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const addPurchase = async ({
  userId,
  db,
  data,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  data: any;
}) => {
  const { items, ...purchaseData } = data;

  const updatedItem = {
    userId: userId,
    itemName: purchaseData.purchaseName,
    soldPriceTotal: 0,
    soldPriceShipping: 0,
    soldPriceFees: 0,
    isSold: false,
    isListed: false,
  };

  const purchaseRes = await db.transaction(async (tx) => {
    // Add purchase to db
    const purchaseRes = await tx
      .insert(purchase)
      .values({
        ...purchaseData,
        userId,
        source: purchaseData.source.sourceLabel,
      })
      .returning({ id: purchase.id });

    // Get the user's current sources
    const sourceList = await tx
      .select()
      .from(sources)
      .where(eq(sources.userId, userId));

    // Check if this purchase's source is unique
    const isNewSource = !Boolean(
      sourceList.find((i: any) => i.sourceName === data.source.sourceName),
    );

    // Add source to db if unique
    if (isNewSource) {
      const newSource = {
        userId,
        sourceName: purchaseData.source.sourceName,
        sourceLabel: purchaseData.source.sourceLabel,
      };
      await tx.insert(sources).values(newSource);
    }

    // Create an array of items from this purchase and add
    // the purchaseId. If purchase is only one item, set the
    // purchase name as the item name.
    const itemArray: any = [];

    items.map((item: any) => {
      const newItem = {
        ...item,
        ...updatedItem,
        purchaseId: purchaseRes[0].id,
        itemName: !purchaseData.multipleItems
          ? purchaseData.purchaseName
          : item.itemName,
      };
      itemArray.push(newItem);
    });

    // Add the item to the items table
    const itemRes = await db.insert(item).values(itemArray).returning();

    return itemRes;
  });

  return purchaseRes;
};
