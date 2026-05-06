import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { useAppStore } from "../store/useAppStore";
import { createId } from "../utils/ids";
import type { RoleKey } from "../types";
import { getRoleLabel } from "../utils/status";
const roles: RoleKey[] = ["copywriter","designer","reels_maker","stories_maker","publisher","reviewer","project_manager"];
export const TeamScreen = () => {
  const s = useAppStore(); const [name, setName] = useState(""); const projectId = s.selectedProjectId ?? s.projects[0]?.id;
  return <div className="space-y-3"><h2 className="text-lg font-semibold">Команда и роли</h2>
    <Card className="space-y-2"><Input placeholder="Имя участника" value={name} onChange={(e) => setName(e.target.value)} /><Button onClick={() => { if (!name) return; s.addMember({ id: createId("member"), teamId: s.activeTeamId ?? "", name, roleLabel: "Участник", createdAt: new Date().toISOString() }); setName(""); }}>Добавить участника</Button></Card>
    {s.members.map((m) => <Card key={m.id} className="flex justify-between"><div>{m.avatarEmoji} {m.name}</div><Button variant="danger" size="sm" onClick={() => s.removeMember(m.id)}>Удалить</Button></Card>)}
    {projectId ? <Card className="space-y-2">{roles.map((role) => <div key={role}><div className="text-xs text-slate-400 mb-1">{getRoleLabel(role)}</div><Select value={s.roleMappings.find((r) => r.projectId === projectId && r.role === role)?.memberId ?? ""} onChange={(e) => s.setRoleMapping(projectId, role, e.target.value)}><option value="">Не назначено</option>{s.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</Select></div>)}</Card> : null}
  </div>;
};
