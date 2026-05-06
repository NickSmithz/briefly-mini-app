import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { formatOptions } from "../data/formatOptions";
import type { TaskGenerationMode } from "../types";
import { useAppStore } from "../store/useAppStore";
import { getImportSourceLabel } from "../utils/status";
import { defaultTemplates } from "../data/defaultTemplates";
import { formatDateShort } from "../utils/dates";

export function ImportPreviewScreen() {
  const state = useAppStore();
  const draft = state.importDrafts.find((item) => item.id === state.activeImportDraftId && item.status === "draft");
  const updateRow = useAppStore((s) => s.updateImportDraftRow);
  const deleteRow = useAppStore((s) => s.deleteImportDraftRow);
  const clearRows = useAppStore((s) => s.clearImportDraftRows);
  const addRow = useAppStore((s) => s.addImportDraftRow);
  const createPlan = useAppStore((s) => s.createContentPlanFromDraft);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const [mode, setMode] = useState<TaskGenerationMode>("minimal");
  if (!draft) return <EmptyState icon={<Upload />} title="Нет активного preview" description="Разберите контент-план, чтобы проверить строки перед созданием." action={<Button onClick={() => setActiveTab("import")}>Импортировать план</Button>} />;
  const project = state.projects.find((item) => item.id === draft.projectId);
  const taskCount = mode === "none" ? 0 : draft.rows.reduce((sum, row) => sum + (defaultTemplates.find((template) => template.format === row.format)?.[mode === "minimal" ? "minimalTasks" : "fullTasks"].length ?? 0), 0);
  const canCreate = draft.rows.length > 0 && draft.rows.every((row) => row.isValid);
  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm text-slate-400">{project?.name} · {getImportSourceLabel(draft.source)}</div>
        <h2 className="text-xl font-black">Preview импорта</h2>
      </Card>
      {draft.rows.map((row, index) => (
        <Card key={row.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold">Строка {index + 1}</div>
            <Button variant="ghost" size="sm" onClick={() => deleteRow(row.id)}><Trash2 size={16} /></Button>
          </div>
          {row.confidence !== undefined && row.confidence < 0.8 && <div className="rounded-2xl bg-amber-500/10 p-2 text-xs text-amber-100">Проверь строку</div>}
          {(row.errors.length > 0 || row.warnings?.length) && <div className="space-y-1 text-xs text-amber-200">{[...row.errors, ...(row.warnings ?? [])].map((error) => <div key={error}>{error}</div>)}</div>}
          {row.memoryWarnings?.length ? (
            <div className="space-y-1 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-100">
              <div className="font-semibold">Project Memory нашла похожие темы</div>
              {row.memoryWarnings.map((warning) => (
                <div key={warning.id}>
                  {warning.message} · {formatDateShort(warning.publishDate)} · совпадение {Math.round(warning.similarity * 100)}%
                </div>
              ))}
            </div>
          ) : null}
          <Input type="date" value={row.publishDate} onChange={(e) => updateRow(row.id, { publishDate: e.target.value, dateRaw: e.target.value })} />
          <Select value={row.format} onChange={(e) => updateRow(row.id, { format: e.target.value as any })}>
            {formatOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </Select>
          <Input value={row.title} onChange={(e) => updateRow(row.id, { title: e.target.value })} placeholder="Название" />
          <Textarea rows={2} value={row.notes ?? ""} onChange={(e) => updateRow(row.id, { notes: e.target.value })} placeholder="Заметки" />
          <Input value={row.expert ?? ""} onChange={(e) => updateRow(row.id, { expert: e.target.value })} placeholder="Эксперт" />
        </Card>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" fullWidth onClick={addRow}><Plus size={18} />Добавить строку</Button>
        <Button variant="danger" fullWidth disabled={!draft.rows.length} onClick={clearRows}>Удалить все</Button>
      </div>
      <Card className="space-y-3">
        <h3 className="font-bold">Генерация задач</h3>
        <Select value={mode} onChange={(e) => setMode(e.target.value as TaskGenerationMode)}>
          <option value="none">Только публикации</option>
          <option value="minimal">Минимальные задачи</option>
          <option value="full">Подробные задачи</option>
        </Select>
        <div className="rounded-2xl bg-slate-950 p-3 text-sm text-slate-300">Будет создано: {draft.rows.length} публикаций, примерно {taskCount} задач</div>
        <Button fullWidth size="lg" disabled={!canCreate} onClick={() => createPlan(mode)}>Создать контент-план</Button>
        {!canCreate && <p className="text-xs text-rose-200">Заполните дату и название во всех строках.</p>}
      </Card>
    </div>
  );
}
