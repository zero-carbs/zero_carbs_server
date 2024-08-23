import { eq, inArray } from "drizzle-orm";
import { item, listing } from "../db/schema";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const addListing = async ({
  userId,
  db,
  data,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  data: any;
}) => {
  const listingItems = data.listingItems;
  const listingData = {
    userId,
    listingName: data.listingName,
    listingDate: data.listingDate,
    listingSource: data.listingSource,
    listingSourceUrl: data.listingSourceUrl,
    listingNotes: data.listingNotes,
  };

  const itemIds = listingItems.map((item: any) => item.id);

  await db.transaction(async (tx) => {
    const [newListingId] = await tx
      .insert(listing)
      .values(listingData)
      .returning({ id: listing.id });

    await tx
      .update(item)
      .set({
        listingId: newListingId.id,
        isListed: true,
        listedSource: listingData.listingSource,
        listedSourceUrl: listingData.listingSourceUrl,
      })
      .where(inArray(item.id, itemIds));

    const [listings] = await tx
      .select()
      .from(listing)
      .where(eq(listing.id, newListingId.id));

    return listings;
  });
};
