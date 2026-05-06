import { Card } from "./Card";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-3">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </Card>
  );
}
