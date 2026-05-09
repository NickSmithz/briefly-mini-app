import { useEffect } from "react";
import { AppShell } from "./components/AppShell";
import { useAppStore } from "./store/useAppStore";
import { useBackendStore } from "./store/useBackendStore";
import { initTelegram } from "./utils/telegram";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ProjectsScreen } from "./screens/ProjectsScreen";
import { ImportPlanScreen } from "./screens/ImportPlanScreen";
import { ImportPreviewScreen } from "./screens/ImportPreviewScreen";
import { ContentCalendarScreen } from "./screens/ContentCalendarScreen";
import { MyTasksScreen } from "./screens/MyTasksScreen";
import { TeamScreen } from "./screens/TeamScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

export function App() {
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);
  const activeTab = useAppStore((state) => state.activeTab);
  const activeImportDraftId = useAppStore((state) => state.activeImportDraftId);
  const initializeApp = useAppStore((state) => state.initializeApp);
  const isBackendMode = useBackendStore((state) => state.isBackendMode);
  const isAuthenticated = useBackendStore((state) => state.isAuthenticated);
  const loadWorkspace = useBackendStore((state) => state.loadWorkspace);

  useEffect(() => {
    initTelegram();
    initializeApp();
    if (isBackendMode && isAuthenticated) void loadWorkspace();
  }, [initializeApp, isAuthenticated, isBackendMode, loadWorkspace]);

  if (!onboardingCompleted) return <OnboardingScreen />;

  const screen = (() => {
    if (activeTab === "home") return <HomeScreen />;
    if (activeTab === "projects") return <ProjectsScreen />;
    if (activeTab === "import") return activeImportDraftId ? <ImportPreviewScreen /> : <ImportPlanScreen />;
    if (activeTab === "calendar") return <ContentCalendarScreen />;
    if (activeTab === "tasks") return <MyTasksScreen />;
    if (activeTab === "team") return <TeamScreen />;
    return <SettingsScreen />;
  })();

  return <AppShell>{screen}</AppShell>;
}
