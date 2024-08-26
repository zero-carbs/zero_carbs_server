import { createHonoWithDB } from "../factory";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { insertContactData } from "../lib/insertContactData";

const contact = createHonoWithDB();

contact.use(clerkMiddleware());

contact.post("/contact", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const clerkData = c.get("clerk");
  const userData = await clerkData.users.getUser(auth.userId);

  const { contactFormContent, typeOfIssue } = await c.req.json();
  const emailAddress = userData.emailAddresses[0].emailAddress;

  const insertContactDataRes = await insertContactData({
    userId: auth.userId,
    db: c.var.db,
    contactFormContent,
    typeOfIssue,
    emailAddress,
  });

  if (insertContactDataRes.status !== "success") {
    return c.json({ status: "error" });
  }

  return c.json({ status: "success" });
});

export { contact };
