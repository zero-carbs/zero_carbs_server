import { createHonoWithDB } from "../factory";
import { createUser } from "../lib/createUser";
import { getAuth } from "@hono/clerk-auth";
import { getUser } from "../lib/getUser";

const user = createHonoWithDB();

user.post("/create-user", async (c) => {
  try {
    const cAuth = c.get("clerk");

    const newUserData = await c.req.json();

    await cAuth.users.getUser(newUserData.data.id);

    const newUserRes = await createUser({
      newUserData: newUserData.data,
      db: c.var.db,
    });

    return c.json(newUserRes);
  } catch (err) {
    return c.json({ status: "error", data: err });
  }
});

user.get("/user", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const userId = auth.userId;
  const userData = await getUser({ userId: userId, db: c.var.db });

  return c.json({ status: "success", data: userData });
});

user.on("OPTIONS", "/user", async (c) => {
  return c.status(200);
});

export { user };
