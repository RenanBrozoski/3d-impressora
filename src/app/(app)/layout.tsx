import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const settings = await db.settings.findUnique({ where: { id: 1 } });

  return (
    <AppShell user={user} nomeLoja={settings?.nomeLoja ?? "Impressão 3D"} logoPath={settings?.logoPath}>
      {children}
    </AppShell>
  );
}
