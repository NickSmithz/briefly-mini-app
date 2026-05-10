import { useState } from "react";
import { Database } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { PlanLimitBanner } from "../components/PlanLimitBanner";
import { Select } from "../components/Select";
import { TeamMemberCard } from "../components/TeamMemberCard";
import { useBrieflyData } from "../store/useBrieflyData";
import { roleLabels } from "../utils/status";
import type { RoleKey } from "../types";
import { hapticFeedback } from "../utils/telegram";

const roles: RoleKey[] = ["copywriter", "designer", "reels_maker", "stories_maker", "publisher", "reviewer", "project_manager"];

export function TeamScreen() {
  const data = useBrieflyData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", roleLabel: "", avatarEmoji: "" });
  const projects = data.projects.filter((project) => project.teamId === data.activeTeamId && !project.archived);
  const members = data.members.filter((member) => member.teamId === data.activeTeamId);
  const selectedProjectId = data.selectedProjectId ?? projects[0]?.id ?? null;
  const unassignedRoleTasksCount = selectedProjectId ? data.actions.getUnassignedRoleTasksCount(selectedProjectId) : 0;

  if (data.isBackendMode && !data.isBackendReady) {
    return (
      <EmptyState
        icon={<Database />}
        title="Team sync mode не подключён"
        description="Войдите через Telegram в настройках, чтобы видеть общую команду."
        action={<Button onClick={() => data.actions.setActiveTab("settings")}>Открыть настройки</Button>}
      />
    );
  }

  const assignUnassignedTasks = () => {
    if (!selectedProjectId) return;
    data.actions.assignExistingTasksByRole(selectedProjectId);
    hapticFeedback("success");
  };

  const addMember = () => {
    const name = form.name.trim();
    if (!name) return;
    data.actions.addMember({
      name,
      username: form.username.trim() || undefined,
      roleLabel: form.roleLabel.trim() || "Участник",
      avatarEmoji: form.avatarEmoji.trim() || undefined,
    });
    setForm({ name: "", username: "", roleLabel: "", avatarEmoji: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <Button fullWidth onClick={() => setOpen(true)}>
        Добавить участника
      </Button>
      {data.subscription && <PlanLimitBanner label="Участники" used={data.usage.members} limit={data.subscription.membersLimit} />}

      <section className="space-y-2">
        <h2 className="text-xl font-black">Команда</h2>
        {members.length ? (
          members.map((member) => <TeamMemberCard key={member.id} member={member} onDelete={() => data.actions.removeMember(member.id)} />)
        ) : (
          <p className="text-sm text-slate-500">В команде пока нет участников.</p>
        )}
      </section>

      <Card className="space-y-3">
        <h3 className="font-bold">Роли проекта</h3>
        {projects.length ? (
          <Select value={selectedProjectId ?? ""} onChange={(event) => data.actions.setSelectedProject(event.target.value)}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        ) : (
          <p className="text-sm text-slate-500">Создайте проект, чтобы настроить роли.</p>
        )}

        {unassignedRoleTasksCount > 0 && (
          <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-100">
            <div className="text-sm font-bold">Есть задачи без исполнителей</div>
            <p className="text-xs text-amber-100/80">{unassignedRoleTasksCount} задач можно назначить по текущим ролям проекта.</p>
            <Button size="sm" variant="secondary" onClick={assignUnassignedTasks}>
              Назначить автоматически
            </Button>
          </div>
        )}

        {roles.map((role) => {
          const mapping = data.roleMappings.find((item) => item.projectId === selectedProjectId && item.role === role);
          return (
            <label key={role} className="block space-y-1 text-sm text-slate-300">
              <span>{roleLabels[role]}</span>
              <Select value={mapping?.memberId ?? ""} onChange={(event) => selectedProjectId && data.actions.setRoleMapping(selectedProjectId, role, event.target.value)}>
                <option value="">Не назначено</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Select>
            </label>
          );
        })}
      </Card>

      {open && (
        <Modal title="Новый участник" onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Input placeholder="Имя" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input placeholder="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
            <Input placeholder="Роль" value={form.roleLabel} onChange={(event) => setForm({ ...form, roleLabel: event.target.value })} />
            <Input placeholder="Emoji" value={form.avatarEmoji} onChange={(event) => setForm({ ...form, avatarEmoji: event.target.value })} />
            <Button fullWidth disabled={!form.name.trim()} onClick={addMember}>
              Добавить
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
