import { contact } from "../db/schema";
import * as schema from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const insertContactData = async ({
  userId,
  db,
  contactFormContent,
  typeOfIssue,
  emailAddress,
}: {
  userId: string;
  db: NodePgDatabase<typeof schema>;
  contactFormContent: string;
  typeOfIssue: string;
  emailAddress: string;
}) => {
  try {
    await db.insert(contact).values({
      userId,
      emailAddress,
      type: typeOfIssue,
      contactMessage: contactFormContent,
      date: new Date().toISOString(),
      open: true,
      status: "NEW",

    });

    return { status: "success" };
  } catch (err) {
    return { status: "error", data: err };
  }
};
