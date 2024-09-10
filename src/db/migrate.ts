import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import "dotenv/config";
import { Client } from 'pg';
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const db = drizzle(pool);

async function main() {
  console.log("Migration started...");
  await migrate(db, { migrationsFolder: "drizzle" });

  if (process.env.IS_DOCKER === "true") {
    console.log('***** DOCKER DB SETUP *****')
    const client = new Client({
      connectionString: process.env.DB_URL,
    });

    await client.connect();
    const f = drizzle(client, { schema });


    // Check if there are any rows in the 'users' table
    const rows = await f.query.users.findMany();
    const userCount = rows.length;

    // Create a user if table is empty
    if (userCount === 0) {
      await f.insert(schema.users).values({
      //@ts-ignore
        userId: process.env.CLERK_USER_ID,
        emailAddress: process.env.CLERK_EMAIL_ADDRESS,
        createdAt: new Date(),
        primaryEmailAddressId: "selfhosted",
        updatedAt: new Date(),
        isSubscribed: true,
        squareId: "selfhosted",
        subscriptionId: "selfhosted",
        subscriptionCreatedAt: new Date(),
        subscriptionStatus: "ACTIVE"
      })

      console.log(`User ${process.env.CLERK_USER_ID} created`);
    }
  }

  console.log("Migration done.");
  process.exit(0);
}

main().catch((err) => {
  console.log(err);
  process.exit(0);
});

