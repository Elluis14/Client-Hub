import { Router, type IRouter } from "express";
import { desc, gte } from "drizzle-orm";
import { db, projectsTable, designRequestsTable, projectFilesTable, messagesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable);
  const requests = await db.select().from(designRequestsTable);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) =>
    p.status === "in_progress" || p.status === "review"
  ).length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const pendingRequests = requests.filter((r) => r.status === "new" || r.status === "reviewing").length;
  const newRequestsThisWeek = requests.filter(
    (r) => r.createdAt >= oneWeekAgo
  ).length;

  res.json({
    totalProjects,
    activeProjects,
    pendingRequests,
    completedProjects,
    newRequestsThisWeek,
  });
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const [projects, requests, files, messages] = await Promise.all([
    db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt)).limit(5),
    db.select().from(designRequestsTable).orderBy(desc(designRequestsTable.createdAt)).limit(5),
    db.select().from(projectFilesTable).orderBy(desc(projectFilesTable.uploadedAt)).limit(5),
    db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt)).limit(5),
  ]);

  const activity = [
    ...projects.map((p) => ({
      id: `project-created-${p.id}`,
      type: "project_created" as const,
      description: `New project created: "${p.title}" for ${p.clientName}`,
      projectId: p.id,
      projectTitle: p.title,
      createdAt: p.createdAt.toISOString(),
    })),
    ...requests.map((r) => ({
      id: `request-submitted-${r.id}`,
      type: "request_submitted" as const,
      description: `Design request submitted by ${r.clientName}: "${r.title}"`,
      projectId: r.projectId ?? null,
      projectTitle: null,
      createdAt: r.createdAt.toISOString(),
    })),
    ...files.map((f) => ({
      id: `file-uploaded-${f.id}`,
      type: "file_uploaded" as const,
      description: `File uploaded: "${f.fileName}"`,
      projectId: f.projectId,
      projectTitle: null,
      createdAt: f.uploadedAt.toISOString(),
    })),
    ...messages.map((m) => ({
      id: `message-sent-${m.id}`,
      type: "message_sent" as const,
      description: `${m.author} sent a message`,
      projectId: m.projectId,
      projectTitle: null,
      createdAt: m.createdAt.toISOString(),
    })),
  ];

  activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(activity.slice(0, 10));
});

export default router;
