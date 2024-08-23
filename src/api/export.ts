import { createHonoWithDB } from "../factory";
import { getExportData } from "../lib/exportData";
import { getAuth, clerkMiddleware } from "@hono/clerk-auth";

const exportData = createHonoWithDB();

exportData.use(clerkMiddleware());
exportData.post("/export", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const params = await c.req.json();

  try {
    const exportedData = await getExportData({
      userId: auth.userId,
      db: c.var.db,
      params: {
        format: params.format,
        tablesToExport: params.tablesToExport,
      },
    });

    return c.json(exportedData);
  } catch (err) {
    return c.notFound();
  }
});

export { exportData };
