import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, projectsTable, projectFilesTable } from "@workspace/db";
import {
  ListProjectsQueryParams,
  CreateProjectBody,
  GetProjectParams,
  GetProjectResponse,
  UpdateProjectParams,
  UpdateProjectBody,
  DeleteProjectParams,
  ListProjectFilesParams,
  AddProjectFileParams,
  AddProjectFileBody,
  DeleteProjectFileParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects/by-status", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable);
  const counts: Record<string, number> = {};
  for (const p of projects) {
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  }
  const result = Object.entries(counts).map(([status, count]) => ({ status, count }));
  res.json(result);
});

router.get("/projects", async (req, res): Promise<void> => {
  const query = ListProjectsQueryParams.safeParse(req.query);
  let projects = await db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));
  if (query.success && query.data.status) {
    projects = projects.filter((p) => p.status === query.data.status);
  }
  res.json(projects.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  })));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db.insert(projectsTable).values(parsed.data).returning();
  res.status(201).json(GetProjectResponse.parse({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db
    .update(projectsTable)
    .set(parsed.data)
    .where(eq(projectsTable.id, params.data.id))
    .returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  });
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [project] = await db
    .delete(projectsTable)
    .where(eq(projectsTable.id, params.data.id))
    .returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/projects/:id/files", async (req, res): Promise<void> => {
  const params = ListProjectFilesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const files = await db
    .select()
    .from(projectFilesTable)
    .where(eq(projectFilesTable.projectId, params.data.id))
    .orderBy(desc(projectFilesTable.uploadedAt));
  res.json(files.map((f) => ({
    ...f,
    uploadedAt: f.uploadedAt.toISOString(),
  })));
});

router.post("/projects/:id/files", async (req, res): Promise<void> => {
  const params = AddProjectFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AddProjectFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [file] = await db
    .insert(projectFilesTable)
    .values({ ...parsed.data, projectId: params.data.id })
    .returning();
  res.status(201).json({
    ...file,
    uploadedAt: file.uploadedAt.toISOString(),
  });
});

router.delete("/projects/:id/files/:fileId", async (req, res): Promise<void> => {
  const params = DeleteProjectFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [file] = await db
    .delete(projectFilesTable)
    .where(eq(projectFilesTable.id, params.data.fileId))
    .returning();
  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
