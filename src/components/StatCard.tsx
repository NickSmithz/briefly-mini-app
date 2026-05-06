import { Card } from "./Card";
export const StatCard = ({ label, value }: { label: string; value: number | string }) => <Card><div className="text-xs text-slate-400">{label}</div><div className="text-2xl font-bold">{value}</div></Card>;
