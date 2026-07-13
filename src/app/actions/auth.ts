"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";

const LoginSchema = z.object({
  identificador: z.string().trim().min(1, "Informe o e-mail ou usuário."),
  senha: z.string().min(1, "Informe a senha."),
});

export type LoginState =
  | { erro: string }
  | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    identificador: formData.get("identificador"),
    senha: formData.get("senha"),
  });

  if (!validated.success) {
    return { erro: "Preencha e-mail (ou usuário) e senha." };
  }

  const { identificador, senha } = validated.data;

  const user = await db.user.findFirst({
    where: { OR: [{ email: identificador }, { username: identificador }] },
  });

  if (!user || !user.ativo) {
    return { erro: "Credenciais inválidas." };
  }

  const senhaValida = await bcrypt.compare(senha, user.senhaHash);
  if (!senhaValida) {
    return { erro: "Credenciais inválidas." };
  }

  await createSession({ userId: user.id, nome: user.nome, papel: user.papel });
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
