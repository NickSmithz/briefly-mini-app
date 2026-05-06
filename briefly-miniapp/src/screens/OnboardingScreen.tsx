import { useState } from "react";
import { ArrowRight, CheckSquare, Eye, MessageCircle, Rows3 } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAppStore } from "../store/useAppStore";

const slides = [
  {
    title: "Контент-план из чата — в задачи за 2 минуты",
    text: "Briefly помогает маленьким контент-командам не терять задачи в Telegram.",
    button: "Дальше",
  },
  {
    title: "Вставь план. Получи календарь и задачи.",
    text: "Импортируй публикации, выбери шаблоны, назначь роли — и каждый участник увидит свой список.",
    button: "Создать демо-команду",
  },
];

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const slide = slides[step];
  return (
    <main className="safe-top flex min-h-screen items-center bg-slate-950 px-4 pb-8">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="mb-8">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500 text-2xl font-black">B</div>
          <div className="text-sm font-semibold text-violet-200">Briefly</div>
        </div>
        <Card className="mb-5">
          <div className="mb-6 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2 text-center text-xs text-slate-300">
            <div className="rounded-2xl bg-slate-950 p-3"><MessageCircle className="mx-auto mb-2" />Сообщение</div>
            <ArrowRight className="mx-auto text-violet-300" />
            <div className="rounded-2xl bg-slate-950 p-3"><Rows3 className="mx-auto mb-2" />План</div>
            <ArrowRight className="mx-auto text-violet-300" />
            <div className="rounded-2xl bg-slate-950 p-3"><Eye className="mx-auto mb-2" />Проверка</div>
            <ArrowRight className="mx-auto text-violet-300" />
            <div className="rounded-2xl bg-slate-950 p-3"><CheckSquare className="mx-auto mb-2" />Задачи</div>
          </div>
          <h1 className="text-3xl font-black leading-tight">{slide.title}</h1>
          <p className="mt-4 text-base text-slate-300">{slide.text}</p>
          <Button className="mt-8" size="lg" fullWidth onClick={() => (step === 0 ? setStep(1) : completeOnboarding())}>{slide.button}</Button>
        </Card>
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => <span key={index} className={`h-2 rounded-full ${index === step ? "w-7 bg-violet-400" : "w-2 bg-slate-700"}`} />)}
        </div>
      </div>
    </main>
  );
}
