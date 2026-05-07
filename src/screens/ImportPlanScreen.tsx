import { useRef, useState } from "react";
import { Brain, ClipboardPaste, KeyboardOff } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { useAppStore } from "../store/useAppStore";

const example = `5.05 | reels | Про ретинол | Ксения Андреевна, точечное/массовое нанесение
6.05 | reels | Тулиевый лазер |
7.05 | carousel | До/после | прислать материалы, акне + постакне, сторителлинг
8.05 | reels | Отзыв акне |
9.05 | reels | Юмор про фототерапию | Ольга Алексеевна`;

export function ImportPlanScreen() {
  const projects = useAppStore((state) => state.projects.filter((p) => !p.archived));
  const selectedProjectId = useAppStore((state) => state.selectedProjectId);
  const setSelectedProject = useAppStore((state) => state.setSelectedProject);
  const parseImportText = useAppStore((state) => state.parseImportText);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const planTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState("");
  const projectId = selectedProjectId ?? projects[0]?.id ?? "";

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-black">Импорт контент-плана</h2>
        <p className="mt-1 text-sm text-slate-400">Вставьте сообщение из чата, Briefly разложит его на публикации.</p>
      </Card>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Проект</span>
        <Select value={projectId} onChange={(e) => setSelectedProject(e.target.value)}>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </Select>
      </label>

      <div>
        <Textarea
          ref={planTextareaRef}
          rows={10}
          value={text}
          enterKeyHint="enter"
          onChange={(e) => setText(e.target.value)}
          placeholder="5.05 | reels | Про ретинол | заметки"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>Каждая строка — отдельная публикация</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-8 px-2 text-xs text-slate-400 hover:text-white"
            onClick={() => planTextareaRef.current?.blur()}
          >
            <KeyboardOff size={15} />
            Скрыть клавиатуру
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => setText(example)}><ClipboardPaste size={17} />Вставить пример</Button>
        <Button variant="ghost" onClick={() => setText("")}>Очистить</Button>
      </div>

      <Card className="text-sm text-slate-300">
        <b>Формат:</b>
        <p className="mt-2 text-slate-400">date | format | title | notes<br />или date - format - title - notes</p>
      </Card>

      <Card className="border-violet-500/20 bg-violet-500/10">
        <div className="flex gap-3">
          <Brain className="text-violet-200" />
          <div>
            <h3 className="font-bold">AI-импорт скоро</h3>
            <p className="text-sm text-violet-100/80">Позже Briefly сможет сам разбирать свободный текст. Сейчас используйте быстрый формат.</p>
          </div>
        </div>
      </Card>

      <Button fullWidth size="lg" disabled={!projectId || !text.trim()} onClick={() => { parseImportText(projectId, text); setActiveTab("import"); }}>Разобрать план</Button>
    </div>
  );
}
