import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ProjectsScreen } from "./screens/ProjectsScreen";
import { ImportPlanScreen } from "./screens/ImportPlanScreen";
import { ContentCalendarScreen } from "./screens/ContentCalendarScreen";
import { MyTasksScreen } from "./screens/MyTasksScreen";
import { TeamScreen } from "./screens/TeamScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ImportPreviewScreen } from "./screens/ImportPreviewScreen";
import { ProjectDetailScreen } from "./screens/ProjectDetailScreen";
import { initTelegram } from "./utils/telegram";
import { useAppStore } from "./store/useAppStore";

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { onboardingCompleted, activeTab, selectedProjectId, activeImportDraftId, initializeApp } = useAppStore();
  useEffect(() => { initTelegram(); initializeApp(); }, [initializeApp]);
  const screen = useMemo(() => {
    if (activeImportDraftId) return <ImportPreviewScreen />;
    if (selectedProjectId && activeTab === "projects") return <ProjectDetailScreen />;
    if (showSettings) return <SettingsScreen onClose={() => setShowSettings(false)} />;
    if (activeTab === "home") return <HomeScreen onOpenSettings={() => setShowSettings(true)} />;
    if (activeTab === "projects") return <ProjectsScreen />;
    if (activeTab === "import") return <ImportPlanScreen />;
    if (activeTab === "calendar") return <ContentCalendarScreen />;
    if (activeTab === "tasks") return <MyTasksScreen />;
    return <TeamScreen />;
  }, [activeImportDraftId, selectedProjectId, activeTab, showSettings]);
  if (!onboardingCompleted) return <OnboardingScreen />;
  return <AppShell>{screen}</AppShell>;
}
