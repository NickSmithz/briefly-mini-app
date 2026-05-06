import { FileWarning } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { formatOptions } from "../data/formatOptions";
import { useAppStore } from "../store/useAppStore";
import type { TaskGenerationMode } from "../types";
export const ImportPreviewScreen = () => {
  const s = useAppStore(); const draft = s.importDrafts.find((d) => d.id === s.activeImportDraftId);
  const mode: TaskGenerationMode = (window.sessionStorage.getItem("gen_mode") as TaskGenerationMode) || "minimal";
  if (!draft) return <EmptyState icon={FileWarning} title="Нет черновика импорта" description="Сначала импортируйте план." actionText="Импортировать план" onAction={() => s.setActiveTab("import")} />;
  return <div className="space-y-3"><h2 className="text-lg font-semibold">Preview импорта</h2>
    {draft.rows.map((r) => <Card key={r.id} className="space-y-2"><Input type="date" value={r.publishDate} onChange={(e) => s.updateImportDraftRow(r.id, { publishDate: e.target.value })} /><Select value={r.format} onChange={(e) => s.updateImportDraftRow(r.id, { format: e.target.value as any })}>{formatOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select><Input value={r.title} onChange={(e) => s.updateImportDraftRow(r.id, { title: e.target.value })} /><Input value={r.notes ?? ""} onChange={(e) => s.updateImportDraftRow(r.id, { notes: e.target.value })} placeholder="Заметки" /><Input value={r.expert ?? ""} onChange={(e) => s.updateImportDraftRow(r.id, { expert: e.target.value })} placeholder="Эксперт" />{(r.confidence ?? 1) < 0.8 ? <div className="text-amber-300 text-xs">Проверь строку</div> : null}{r.errors.map((e) => <div key={e} className="text-rose-300 text-xs">{e}</div>)}<Button variant="danger" size="sm" onClick={() => s.deleteImportDraftRow(r.id)}>Удалить строку</Button></Card>)}
    <Button variant="secondary" onClick={() => s.addImportDraftRow()}>Добавить строку вручную</Button>
    <Select value={mode} onChange={(e) => window.sessionStorage.setItem("gen_mode", e.target.value)}><option value="none">Только публикации</option><option value="minimal">Минимальные задачи</option><option value="full">Подробные задачи</option></Select>
    <Button fullWidth onClick={() => s.createContentPlanFromDraft((window.sessionStorage.getItem("gen_mode") as TaskGenerationMode) || "minimal")} disabled={draft.rows.some((r) => !r.publishDate || !r.title.trim())}>Создать контент-план</Button>
  </div>;
};
