import { createHonoWithDB } from "../factory";
import { getUserSettings } from "../lib/getUserSettings";
import {
  addSource,
  removeSource,
  updateSettings,
} from "../lib/updateUserSettings";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

const settings = createHonoWithDB();

settings.use(clerkMiddleware());
settings.get("/settings", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const userSettings = await getUserSettings({
    userId: auth.userId,
    db: c.var.db,
  });

  return c.json(userSettings);
});

settings.post("/settings", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const reqData = await c.req.json();

  if (reqData.type === "source") {
    const updatedSettings = await addSource({
      userId: auth.userId,
      newSource: reqData.sourceToAdd,
      db: c.var.db,
    });
    return c.json(updatedSettings);
  }

  const updatedSettings = await updateSettings({
    userId: auth.userId,
    newSettings: reqData,
    db: c.var.db,
  });

  return c.json(updatedSettings);
});

settings.delete("/settings", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const settingsData = await c.req.json();

  if (settingsData.type === "source") {
    const updatedSettings = await removeSource({
      userId: auth.userId,
      sourceToRemove: settingsData.sourceToRemove,
      db: c.var.db,
    });
    return c.json(updatedSettings);
  }
});

settings.options("/", (_, next) => next());

export { settings };
