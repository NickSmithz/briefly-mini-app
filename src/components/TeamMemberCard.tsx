import type { TeamMember } from "../types";
import { Button } from "./Button";
import { Card } from "./Card";

export function TeamMemberCard({ member, onEdit, onDelete }: { member: TeamMember; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <Card className="flex items-center gap-3 p-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-xl">{member.avatarEmoji || "•"}</div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{member.name}</div>
        <div className="truncate text-xs text-slate-400">{member.roleLabel}{member.username ? ` · @${member.username}` : ""}</div>
      </div>
      {onEdit && <Button variant="ghost" size="sm" onClick={onEdit}>Изм.</Button>}
      {onDelete && <Button variant="ghost" size="sm" onClick={onDelete}>Удал.</Button>}
    </Card>
  );
}
