import { useState } from "react";
import { ArrowDown, ArrowRight, CheckSquare, Eye, MessageCircle, Rows3 } from "lucide-react";
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

const flowItems = [
  { label: "Сообщение", Icon: MessageCircle },
  { label: "План", Icon: Rows3 },
  { label: "Проверка", Icon: Eye },
  { label: "Задачи", Icon: CheckSquare },
];

function OnboardingFlowPreview() {
  return (
    <div className="mb-4 flex min-w-0 flex-col items-stretch gap-1 text-center text-xs text-slate-300 min-[361px]:mb-6 min-[361px]:flex-row min-[361px]:items-center min-[361px]:gap-2 sm:text-sm">
      {flowItems.map(({ label, Icon }, index) => (
        <div key={label} className="contents">
          <div className="flex min-w-0 flex-row items-center justify-center gap-2 rounded-2xl bg-slate-950 px-3 py-2 min-[361px]:min-h-[78px] min-[361px]:flex-1 min-[361px]:flex-col min-[361px]:gap-0 min-[361px]:p-2 sm:p-3">
            <Icon className="shrink-0 text-violet-200 min-[361px]:mb-2" size={18} />
            <span className="min-w-0 whitespace-normal break-words leading-tight">{label}</span>
          </div>
          {index < flowItems.length - 1 && (
            <div className="flex shrink-0 items-center justify-center text-violet-300">
              <ArrowDown className="min-[361px]:hidden" size={16} />
              <ArrowRight className="hidden min-[361px]:block" size={16} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const slide = slides[step];
  return (
    <main className="safe-top flex min-h-screen items-center overflow-x-hidden bg-slate-950 px-3 pb-5 min-[361px]:px-4 min-[361px]:pb-8">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="mb-4 min-[361px]:mb-8">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-2xl font-black min-[361px]:mb-3 min-[361px]:h-14 min-[361px]:w-14">B</div>
          <div className="text-sm font-semibold text-violet-200">Briefly</div>
        </div>
        <Card className="mb-4 p-4 min-[361px]:mb-5">
          <OnboardingFlowPreview />
          <h1 className="text-2xl font-black leading-tight min-[361px]:text-3xl">{slide.title}</h1>
          <p className="mt-3 text-sm text-slate-300 min-[361px]:mt-4 min-[361px]:text-base">{slide.text}</p>
          <Button className="mt-5 min-[361px]:mt-8" size="lg" fullWidth onClick={() => (step === 0 ? setStep(1) : completeOnboarding())}>{slide.button}</Button>
        </Card>
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => <span key={index} className={`h-2 rounded-full ${index === step ? "w-7 bg-violet-400" : "w-2 bg-slate-700"}`} />)}
        </div>
      </div>
    </main>
  );
}
