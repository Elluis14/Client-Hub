import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, designRequestsTable } from "@workspace/db";
import {
  ListRequestsQueryParams,
  CreateRequestBody,
  GetRequestParams,
  GetRequestResponse,
  UpdateRequestParams,
  UpdateRequestBody,
  DeleteRequestParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/requests", async (req, res): Promise<void> => {
  const query = ListRequestsQueryParams.safeParse(req.query);
  let requests = await db.select().from(designRequestsTable).orderBy(desc(designRequestsTable.createdAt));
  if (query.success && query.data.status) {
    requests = requests.filter((r) => r.status === query.data.status);
  }
  res.json(requests.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/requests", async (req, res): Promise<void> => {
  const parsed = CreateRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [request] = await db.insert(designRequestsTable).values(parsed.data).returning();
  res.status(201).json(GetRequestResponse.parse({
    ...request,
    createdAt: request.createdAt.toISOString(),
  }));
});

router.get("/requests/:id", async (req, res): Promise<void> => {
  const params = GetRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [request] = await db
    .select()
    .from(designRequestsTable)
    .where(eq(designRequestsTable.id, params.data.id));
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.json(GetRequestResponse.parse({
    ...request,
    createdAt: request.createdAt.toISOString(),
  }));
});

router.patch("/requests/:id", async (req, res): Promise<void> => {
  const params = UpdateRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [request] = await db
    .update(designRequestsTable)
    .set(parsed.data)
    .where(eq(designRequestsTable.id, params.data.id))
    .returning();
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.json({
    ...request,
    createdAt: request.createdAt.toISOString(),
  });
});

router.delete("/requests/:id", async (req, res): Promise<void> => {
  const params = DeleteRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [request] = await db
    .delete(designRequestsTable)
    .where(eq(designRequestsTable.id, params.data.id))
    .returning();
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
