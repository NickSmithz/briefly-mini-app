import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { useAppStore } from "../store/useAppStore";
import { useState } from "react";
const SAMPLE = `5.05 | reels | Про ретинол | Ксения Андреевна, точечное/массовое нанесение
6.05 | reels | Тулиевый лазер |
7.05 | carousel | До/после | прислать материалы, акне + постакне, сторителлинг
8.05 | reels | Отзыв акне |
9.05 | reels | Юмор про фототерапию | Ольга Алексеевна`;
export const ImportPlanScreen = () => {
  const s = useAppStore(); const [text, setText] = useState(""); const [projectId, setProjectId] = useState(s.selectedProjectId ?? s.projects[0]?.id ?? "");
  return <div className="space-y-3"><h2 className="text-lg font-semibold">Импорт контент-плана</h2><Card className="space-y-2">
    <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>{s.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
    <Textarea placeholder="5.05 | reels | Тема | заметки" value={text} onChange={(e) => setText(e.target.value)} />
    <div className="flex gap-2"><Button variant="secondary" onClick={() => setText(SAMPLE)}>Вставить пример</Button><Button variant="ghost" onClick={() => setText("")}>Очистить</Button></div>
    <Card className="text-sm text-slate-400">AI-импорт скоро: позже Briefly сможет сам разбирать свободный текст. Сейчас используйте быстрый формат.</Card>
    <Button fullWidth onClick={() => s.parseImportText(projectId, text)}>Разобрать план</Button>
  </Card></div>;
};
