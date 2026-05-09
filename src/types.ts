export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

export type PlanType = "free" | "pro" | "agency";
export type SubscriptionStatus = "trial" | "active" | "expired" | "none";

export type Team = { id: string; name: string; createdAt: string; plan: PlanType };

export type Subscription = {
  id: string;
  teamId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt?: string;
  aiImportsLimit: number;
  aiImportsUsed: number;
  projectsLimit: number;
  membersLimit: number;
  contentItemsLimit: number;
};

export type Project = {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  archived?: boolean;
};

export type TeamMember = {
  id: string;
  teamId: string;
  name: string;
  username?: string;
  roleLabel: string;
  avatarEmoji?: string;
  createdAt: string;
};

export type RoleKey =
  | "copywriter"
  | "designer"
  | "reels_maker"
  | "stories_maker"
  | "publisher"
  | "reviewer"
  | "project_manager"
  | "other";

export type RoleMapping = { id: string; teamId: string; projectId: string; role: RoleKey; memberId: string };

export type ContentFormat = "reels" | "stories" | "post" | "carousel" | "video" | "article" | "other";
export type ContentStatus = "idea" | "in_work" | "review" | "ready" | "published";
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";
export type ImportSource = "manual" | "quick_import" | "ai";

export type ContentItem = {
  id: string;
  teamId: string;
  projectId: string;
  title: string;
  format: ContentFormat;
  publishDate: string;
  topic?: string;
  notes?: string;
  expert?: string;
  status: ContentStatus;
  importSource: ImportSource;
  sourceImportId?: string;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
};

export type MemoryWarning = {
  id: string;
  type: "similar_topic";
  message: string;
  contentItemId: string;
  contentTitle: string;
  publishDate: string;
  similarity: number;
};

export type ProjectMemoryItem = {
  id: string;
  teamId: string;
  projectId: string;
  contentItemId: string;
  title: string;
  format: ContentFormat;
  publishDate: string;
  normalizedText: string;
  keywords: string[];
  sourceImportId?: string;
  createdAt: string;
};

export type Task = {
  id: string;
  teamId: string;
  projectId: string;
  contentItemId?: string;
  title: string;
  description?: string;
  assigneeId?: string;
  role?: RoleKey;
  dueDate?: string;
  status: TaskStatus;
  priority: "low" | "normal" | "high";
  createdAt: string;
  updatedAt: string;
};

export type ImportedPlanRow = {
  id: string;
  raw: string;
  dateRaw: string;
  publishDate: string;
  format: ContentFormat;
  title: string;
  topic?: string;
  notes?: string;
  expert?: string;
  isValid: boolean;
  errors: string[];
  source: ImportSource;
  confidence?: number;
  warnings?: string[];
  memoryWarnings?: MemoryWarning[];
};

export type ImportDraft = {
  id: string;
  teamId: string;
  projectId: string;
  source: ImportSource;
  rawText: string;
  rows: ImportedPlanRow[];
  createdAt: string;
  status: "draft" | "confirmed" | "discarded";
};

export type TemplateTask = { title: string; role: RoleKey; dueOffsetDays: number; priority?: "low" | "normal" | "high" };
export type ContentTemplate = { format: ContentFormat; label: string; minimalTasks: TemplateTask[]; fullTasks: TemplateTask[] };
export type TaskGenerationMode = "none" | "minimal" | "full";
export type AppTab = "home" | "projects" | "import" | "calendar" | "tasks" | "team" | "settings";

export type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: { user?: TelegramUser };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  HapticFeedback?: {
    impactOccurred: (type: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  MainButton?: {
    text: string;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}
