import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { decrypt, getSessionCookie } from "@/lib/session";
import { db } from "@/lib/db";

export const verifySession = cache(async () => {
  const cookie = await getSessionCookie();
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, nome: true, email: true, papel: true, valorHora: true, ativo: true },
  });

  if (!user || !user.ativo) {
    redirect("/login");
  }

  return user;
});

export function isAdmin(papel: string) {
  return papel === "ADMIN";
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user.papel)) {
    redirect("/dashboard");
  }
  return user;
}
