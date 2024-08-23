import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { Client } from "pg";
import * as schema from "./db/schema";
import { Environment } from "square";
import type { Environment as ET } from "square";

export const createHonoWithDB = () => {
  const app = new Hono<{
    Bindings: {
      "zerocarbsdb-transaction": Hyperdrive;
      SQUARE_ACCESS_TOKEN: string;
      SQUARE_ENVIRONMENT: ET;
      SQUARE_LOCATION_ID: string;
      SQUARE_PLAN_VARIATION_ID: string;
    };
    Variables: {
      db: NodePgDatabase<typeof schema>;
      client: Client;
      SQUARE_ACCESS_TOKEN: string;
      SQUARE_ENVIRONMENT: "production" | "sandbox";
      SQUARE_LOCATION_ID: string;
      SQUARE_PLAN_VARIATION_ID: string;
    };
  }>();

  app.use(async (c, next) => {
    const client = new Client({
      connectionString: c.env["zerocarbsdb-transaction"].connectionString,
    });

    await client.connect();

    c.set("client", client);
    c.set("db", drizzle(client, { schema }));
    c.set("SQUARE_ACCESS_TOKEN", c.env.SQUARE_ACCESS_TOKEN);
    c.set(
      "SQUARE_ENVIRONMENT",
      c.var.SQUARE_ENVIRONMENT === "sandbox"
        ? Environment.Sandbox
        : Environment.Production,
    );
    c.set("SQUARE_LOCATION_ID", c.env.SQUARE_LOCATION_ID);
    c.set("SQUARE_PLAN_VARIATION_ID", c.env.SQUARE_PLAN_VARIATION_ID);
    await next();
  });

  return app;
};
