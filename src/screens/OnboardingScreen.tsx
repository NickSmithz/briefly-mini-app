import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAppStore } from "../store/useAppStore";
export const OnboardingScreen = () => {
  const [step, setStep] = useState(0); const { completeOnboarding } = useAppStore();
  const slides = [
    { title: "Контент-план из чата — в задачи за 2 минуты", text: "Briefly помогает маленьким контент-командам не терять задачи в Telegram.", cta: "Дальше" },
    { title: "Вставь план. Получи календарь и задачи.", text: "Импортируй публикации, выбери шаблоны, назначь роли — и каждый участник увидит свой список.", cta: "Создать демо-команду" },
  ];
  const s = slides[step];
  return <div className="max-w-[480px] mx-auto min-h-screen px-4 py-8 bg-slate-950"><Card className="space-y-4 text-center"><div className="text-2xl font-bold">Briefly</div><div className="text-sm text-violet-300">Сообщение → План → Задачи</div><h1 className="text-xl">{s.title}</h1><p className="text-slate-300">{s.text}</p><Button fullWidth onClick={() => step === 0 ? setStep(1) : completeOnboarding()}>{s.cta}</Button></Card></div>;
};
