import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { PlanLimitBanner } from "../components/PlanLimitBanner";
import { Select } from "../components/Select";
import { TeamMemberCard } from "../components/TeamMemberCard";
import { roleLabels } from "../utils/status";
import type { RoleKey } from "../types";
import { getUsageForActiveTeam, selectActiveSubscription, useAppStore } from "../store/useAppStore";
import { hapticFeedback } from "../utils/telegram";

const roles: RoleKey[] = ["copywriter", "designer", "reels_maker", "stories_maker", "publisher", "reviewer", "project_manager"];

export function TeamScreen() {
  const state = useAppStore();
  const addMember = useAppStore((s) => s.addMember);
  const removeMember = useAppStore((s) => s.removeMember);
  const setRoleMapping = useAppStore((s) => s.setRoleMapping);
  const assignExistingTasksByRole = useAppStore((s) => s.assignExistingTasksByRole);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", roleLabel: "", avatarEmoji: "" });
  const sub = selectActiveSubscription(state);
  const usage = getUsageForActiveTeam(state);
  const selectedProjectId = state.selectedProjectId;
  const unassignedRoleTasksCount = selectedProjectId ? state.getUnassignedRoleTasksCount(selectedProjectId) : 0;
  const assignUnassignedTasks = () => {
    if (!selectedProjectId) return;
    const count = assignExistingTasksByRole(selectedProjectId);
    useAppStore.setState({ lastSuccessMessage: `Назначено ${count} задач` });
    hapticFeedback("success");
  };
  return (
    <div className="space-y-4">
      <Button fullWidth onClick={() => setOpen(true)}>Добавить участника</Button>
      {sub && <PlanLimitBanner label="Участники" used={usage.members} limit={sub.membersLimit} />}
      <section className="space-y-2">
        <h2 className="text-xl font-black">Команда</h2>
        {state.members.map((member) => <TeamMemberCard key={member.id} member={member} onDelete={() => removeMember(member.id)} />)}
      </section>
      <Card className="space-y-3">
        <h3 className="font-bold">Роли проекта</h3>
        <Select value={state.selectedProjectId ?? ""} onChange={(e) => setSelectedProject(e.target.value)}>
          {state.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </Select>
        {unassignedRoleTasksCount > 0 && (
          <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-100">
            <div className="text-sm font-bold">Есть задачи без исполнителей</div>
            <p className="text-xs text-amber-100/80">{unassignedRoleTasksCount} задач можно назначить по текущим ролям проекта.</p>
            <Button size="sm" variant="secondary" onClick={assignUnassignedTasks}>Назначить автоматически</Button>
          </div>
        )}
        {roles.map((role) => {
          const mapping = state.roleMappings.find((item) => item.projectId === state.selectedProjectId && item.role === role);
          return (
            <label key={role} className="block space-y-1 text-sm text-slate-300">
              <span>{roleLabels[role]}</span>
              <Select value={mapping?.memberId ?? ""} onChange={(e) => state.selectedProjectId && setRoleMapping(state.selectedProjectId, role, e.target.value)}>
                <option value="">Не назначено</option>
                {state.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </Select>
            </label>
          );
        })}
      </Card>
      {open && (
        <Modal title="Новый участник" onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Input placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <Input placeholder="Роль" value={form.roleLabel} onChange={(e) => setForm({ ...form, roleLabel: e.target.value })} />
            <Input placeholder="Emoji" value={form.avatarEmoji} onChange={(e) => setForm({ ...form, avatarEmoji: e.target.value })} />
            <Button fullWidth disabled={!form.name.trim()} onClick={() => { addMember(form); setForm({ name: "", username: "", roleLabel: "", avatarEmoji: "" }); setOpen(false); }}>Добавить</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
