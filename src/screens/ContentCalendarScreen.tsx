import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { useAppStore } from "../store/useAppStore";
import { formatDate } from "../utils/dates";
import { getImportSourceLabel } from "../utils/status";
import { Button } from "../components/Button";
export const ContentCalendarScreen = () => {
  const s = useAppStore(); const items = [...s.contentItems].sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  return <div className="space-y-3"><h2 className="text-lg font-semibold">Контент-календарь</h2>{items.map((item) => <Card key={item.id} className="space-y-2"><div className="text-xs text-slate-400">{formatDate(item.publishDate)} • {getImportSourceLabel(item.importSource)}</div><div className="font-semibold">{item.title}</div><div className="text-sm">{item.notes}</div><StatusBadge status={item.status} /><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => s.updateContentItem(item.id, { status: "in_work" })}>В работе</Button><Button size="sm" variant="ghost" onClick={() => s.updateContentItem(item.id, { status: "review" })}>На проверке</Button><Button size="sm" variant="success" onClick={() => s.updateContentItem(item.id, { status: "ready" })}>Готово</Button><Button size="sm" onClick={() => s.updateContentItem(item.id, { status: "published" })}>Опубликовано</Button></div></Card>)}</div>;
};
