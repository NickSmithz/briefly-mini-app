import type { ContentItem, ContentStatus } from "../types";
import { formatDateShort } from "../utils/dates";
import { getFormatLabel, getImportSourceLabel } from "../utils/status";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { LinkifiedText } from "./LinkifiedText";
import { StatusBadge } from "./StatusBadge";

export function ContentItemCard({ item, tasksCount, onStatus }: { item: ContentItem; tasksCount: number; onStatus?: (status: ContentStatus) => void }) {
  return (
    <Card className="max-w-full min-w-0 overflow-hidden space-y-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap gap-2">
            <Badge color="violet">{getFormatLabel(item.format)}</Badge>
            <Badge>{getImportSourceLabel(item.importSource)}</Badge>
          </div>
          <h3 className="break-words font-bold">{item.title}</h3>
          <p className="text-sm text-slate-400">{formatDateShort(item.publishDate)}{item.expert ? ` · ${item.expert}` : ""}</p>
        </div>
        <StatusBadge status={item.status} type="content" />
      </div>
      <LinkifiedText text={item.notes} collapsedLines={3} />
      <div className="text-xs text-slate-500">Связанных задач: {tasksCount}</div>
      {onStatus && (
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" onClick={() => onStatus("in_work")}>В работе</Button>
          <Button size="sm" variant="secondary" onClick={() => onStatus("review")}>На проверке</Button>
          <Button size="sm" variant="secondary" onClick={() => onStatus("ready")}>Готово</Button>
          <Button size="sm" variant="success" onClick={() => onStatus("published")}>Опубликовано</Button>
        </div>
      )}
    </Card>
  );
}
