import type { TeamMember } from "../types";
import { Card } from "./Card";
export const TeamMemberCard = ({ member }: { member: TeamMember }) => <Card>{member.avatarEmoji} {member.name} · {member.roleLabel}</Card>;
