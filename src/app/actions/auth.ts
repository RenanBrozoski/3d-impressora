"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail."),
  senha: z.string().min(1, "Informe a senha."),
});

export type LoginState =
  | { erro: string }
  | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!validated.success) {
    return { erro: "Preencha e-mail e senha." };
  }

  const { email, senha } = validated.data;

  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.ativo) {
    return { erro: "E-mail ou senha inválidos." };
  }

  const senhaValida = await bcrypt.compare(senha, user.senhaHash);
  if (!senhaValida) {
    return { erro: "E-mail ou senha inválidos." };
  }

  await createSession({ userId: user.id, nome: user.nome, papel: user.papel });
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
