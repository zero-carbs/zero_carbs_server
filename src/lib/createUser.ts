import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { settings, users } from "../db/schema";
import * as schema from "../db/schema";

export const createUser = async ({
  newUserData,
  db,
}: {
  newUserData: any;
  db: NodePgDatabase<typeof schema>;
}) => {
  const {
    id,
    created_at: createdAt,
    email_addresses: emailAddress,
    primary_email_address_id: primaryEmailAddressId,
    updated_at: updatedAt,
  } = newUserData;

  const addUserToDbRes = await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({
        userId: id,
        createdAt: new Date(createdAt),
        emailAddress: emailAddress[0].email_address,
        primaryEmailAddressId: primaryEmailAddressId,
        updatedAt: new Date(updatedAt),
      })
      .returning();

    const [newUserSettings] = await tx
      .insert(settings)
      .values({ userId: id })
      .returning();

    return { newUser, newUserSettings };
  });

  return addUserToDbRes;
};
