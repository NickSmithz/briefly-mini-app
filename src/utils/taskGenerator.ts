import type { ContentTemplate, RoleMapping, Task, TaskGenerationMode } from "../types";
import type { ContentItem } from "../types";
import { addDaysToISO } from "./dates";
import { createId } from "./ids";

type Params = {
  contentItem: ContentItem;
  projectId: string;
  teamId: string;
  roleMappings: RoleMapping[];
  generationMode: TaskGenerationMode;
  templates: ContentTemplate[];
};

export const generateTasksForContentItem = ({ contentItem, projectId, teamId, roleMappings, generationMode, templates }: Params): Task[] => {
  if (generationMode === "none") return [];
  const template = templates.find((t) => t.format === contentItem.format);
  if (!template) return [];
  const now = new Date().toISOString();
  const base = generationMode === "minimal" ? template.minimalTasks : template.fullTasks.length ? template.fullTasks : template.minimalTasks;
  return base.map((task) => {
    const mapping = roleMappings.find((rm) => rm.projectId === projectId && rm.role === task.role);
    return {
      id: createId("task"),
      teamId,
      projectId,
      contentItemId: contentItem.id,
      title: task.title.replace("{title}", contentItem.title),
      role: task.role,
      assigneeId: mapping?.memberId,
      dueDate: addDaysToISO(contentItem.publishDate, task.dueOffsetDays),
      status: "todo",
      priority: task.priority ?? "normal",
      createdAt: now,
      updatedAt: now,
    };
  });
};
