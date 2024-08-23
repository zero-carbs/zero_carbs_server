import { item, listing, purchase } from "../db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { removeDuplicates } from "../utils/removeDuplicates";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const editListing = async ({
  userId,
  db,
  data,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  data: any;
}) => {
  const { items: listingItems, ...listingData } = data;

  const {
    listingSold,
    listingSoldDate,
    listingSoldFees,
    listingSoldPrice,
    listingSoldShipping,
  } = listingData;

  const itemIds = listingItems.map((item: any) => item.id);
  const itemPurchaseIds = listingItems.map((item: any) => item.purchaseId);
  const uniqueItemPurchaseIds = removeDuplicates(itemPurchaseIds);

  const updatedValues = {
    ...listingData,
    listingSoldDate: listingSold ? listingSoldDate : null,
    listingSoldFees: listingSold ? listingSoldFees : 0,
    listingSoldPrice: listingSold ? listingSoldPrice : 0,
    listingSoldShipping: listingSold ? listingSoldShipping : 0,
  };

  const defaultListingValues = {
    listingSoldDate: null,
    listingSoldFees: 0,
    listingSoldPrice: 0,
    listingSoldShipping: 0,
    listingSold: false,
  };

  const editListingRes = await db.transaction(async (tx) => {
    const originalListingData = await tx
      .select()
      .from(listing)
      .where(and(eq(listing.userId, userId), eq(listing.id, listingData.id)));

    if (originalListingData[0].listingSold && !listingData.listingSold) {
      // Reset listing values
      await tx
        .update(listing)
        .set(defaultListingValues)
        .where(and(eq(listing.userId, userId), eq(listing.id, data.id)));

      const [totalToUpdate]: any = await tx
        .select()
        .from(purchase)
        .where(
          and(
            eq(purchase.userId, userId),
            inArray(purchase.id, uniqueItemPurchaseIds),
          ),
        );

      const revertedPurchaseValues = () => {
        const { soldTotals: purchaseTotal } = totalToUpdate;
        const originalListingTotal =
          originalListingData[0].listingSoldPrice -
          (originalListingData[0].listingSoldShipping +
            originalListingData[0].listingSoldFees);

        const newSoldTotals = purchaseTotal - originalListingTotal;
        return newSoldTotals;
      };

      // Reset purchase values
      await tx
        .update(purchase)
        .set({ soldTotals: revertedPurchaseValues() })
        .where(
          and(
            eq(purchase.userId, userId),
            inArray(purchase.id, uniqueItemPurchaseIds),
          ),
        );

      await tx
        .update(item)
        .set({
          soldDate: null,
          isSold: false,
          isListed: false,
        })
        .where(and(eq(item.userId, userId), inArray(item.id, itemIds)));

      return {};
    }

    // ─── Outside if ───────────────────────────────────────────────────────────────────

    // Update the listing with new values
    await tx
      .update(listing)
      .set(listingData)
      .where(and(eq(listing.userId, userId), eq(listing.id, data.id)));

    // Get the current sold totals for the purchases from each item in the listing
    const [totalToUpdate]: any = await tx
      .select()
      .from(purchase)
      .where(
        and(
          eq(purchase.userId, userId),
          inArray(purchase.id, uniqueItemPurchaseIds),
        ),
      );

    // Subtract the current listing sold price from the current purchase sold total
    // and then update the purchase sold total with the newly updated listing sold price.
    const updatedTotal = () => {
      const { soldTotals: purchaseTotal } = totalToUpdate;
      const originalListingTotal =
        originalListingData[0].listingSoldPrice -
        (originalListingData[0].listingSoldShipping +
          originalListingData[0].listingSoldFees);

      // 2024-03-19 - Not tested yet. I accidentally marked the wrong listing as sold and when i marked it as
      // unsold the soldTotals of the purchase never got updated. This ternary may fix that.
      const newListingTotal =
        listingSoldPrice - (listingSoldShipping + listingSoldFees);

      const newSoldTotals =
        purchaseTotal - originalListingTotal + newListingTotal;

      return newSoldTotals;
    };

    // Update the soldTotals for all purchases with items in this listing
    await tx
      .update(purchase)
      .set({ soldTotals: updatedTotal() })
      .where(
        and(
          eq(purchase.userId, userId),
          inArray(purchase.id, uniqueItemPurchaseIds),
        ),
      );

    // Update the individual items from this listing
    await tx
      .update(item)
      .set({
        soldDate: updatedValues.listingSoldDate,
        isSold: listingSold,
        isListed: false,
      })
      .where(and(eq(item.userId, userId), inArray(item.id, itemIds)));
  });

  return editListingRes;
};
