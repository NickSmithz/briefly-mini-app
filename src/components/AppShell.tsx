import type { PropsWithChildren } from "react";
import { BottomNav } from "./BottomNav";
export const AppShell = ({ children }: PropsWithChildren) => <div className="max-w-[480px] mx-auto min-h-screen safe-pt pb-24 px-4 bg-slate-950">{children}<BottomNav /></div>;
