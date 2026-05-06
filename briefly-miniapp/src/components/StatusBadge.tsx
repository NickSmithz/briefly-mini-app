import type { ContentStatus, TaskStatus } from "../types";
import { getContentStatusLabel, getStatusColor, getTaskStatusLabel } from "../utils/status";
import { Badge } from "./Badge";

export function StatusBadge({ status, type }: { status: ContentStatus | TaskStatus; type: "content" | "task" }) {
  const label = type === "content" ? getContentStatusLabel(status as ContentStatus) : getTaskStatusLabel(status as TaskStatus);
  return <Badge color={getStatusColor(status) as any}>{label}</Badge>;
}
