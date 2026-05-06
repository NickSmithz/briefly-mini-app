import type { ContentStatus, TaskStatus } from "../types";
import { getStatusColor, getTaskStatusLabel, getContentStatusLabel } from "../utils/status";
export const StatusBadge = ({ status }: { status: ContentStatus | TaskStatus }) => <span className={`px-2 py-1 rounded-xl text-xs ${getStatusColor(status)}`}>{(["idea","in_work","review","ready","published"] as string[]).includes(status) ? getContentStatusLabel(status as ContentStatus) : getTaskStatusLabel(status as TaskStatus)}</span>;
