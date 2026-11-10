import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { getShellData } from "@/lib/data";

export const instant = false;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const shell = await getShellData();
  return <AppShell shell={shell}>{children}</AppShell>;
}
