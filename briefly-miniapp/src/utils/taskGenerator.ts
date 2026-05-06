import type { ContentItem, ContentTemplate, RoleMapping, Task, TaskGenerationMode } from "../types";
import { addDaysToISO } from "./dates";
import { createId } from "./ids";

export function generateTasksForContentItem(params: {
  contentItem: ContentItem;
  projectId: string;
  teamId: string;
  roleMappings: RoleMapping[];
  generationMode: TaskGenerationMode;
  templates: ContentTemplate[];
}): Task[] {
  const { contentItem, projectId, teamId, roleMappings, generationMode, templates } = params;
  if (generationMode === "none") return [];
  const template = templates.find((item) => item.format === contentItem.format) ?? templates.find((item) => item.format === "other");
  if (!template) return [];
  const now = new Date().toISOString();
  const tasks = generationMode === "minimal" ? template.minimalTasks : template.fullTasks;
  return tasks.map((templateTask) => ({
    id: createId("task"),
    teamId,
    projectId,
    contentItemId: contentItem.id,
    title: templateTask.title.replace("{title}", contentItem.title),
    assigneeId: roleMappings.find((mapping) => mapping.projectId === projectId && mapping.role === templateTask.role)?.memberId,
    role: templateTask.role,
    dueDate: addDaysToISO(contentItem.publishDate, templateTask.dueOffsetDays),
    status: "todo",
    priority: templateTask.priority ?? "normal",
    createdAt: now,
    updatedAt: now,
  }));
}
