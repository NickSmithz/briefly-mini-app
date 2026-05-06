import type { Project } from "../types";
import { Card } from "./Card";
export const ProjectCard = ({ project }: { project: Project }) => <Card><div className="font-semibold">{project.name}</div><div className="text-sm text-slate-400">{project.description}</div></Card>;
