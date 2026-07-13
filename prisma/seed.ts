import "dotenv/config";
import bcrypt from "bcryptjs";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const senhaAdmin = await bcrypt.hash("admin123", 10);
  const senhaOperador = await bcrypt.hash("operador123", 10);

  await db.user.upsert({
    where: { email: "admin@impressao3d.local" },
    update: { username: "admin" },
    create: {
      nome: "Administrador",
      email: "admin@impressao3d.local",
      username: "admin",
      senhaHash: senhaAdmin,
      papel: "ADMIN",
      valorHora: 25,
    },
  });

  await db.user.upsert({
    where: { email: "operador@impressao3d.local" },
    update: { username: "operador" },
    create: {
      nome: "Operador",
      email: "operador@impressao3d.local",
      username: "operador",
      senhaHash: senhaOperador,
      papel: "OPERADOR",
      valorHora: 20,
    },
  });

  await db.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log("Seed concluído.");
  console.log("Login admin:    admin@impressao3d.local (ou usuário: admin) / admin123");
  console.log("Login operador: operador@impressao3d.local (ou usuário: operador) / operador123");
  console.log("Troque essas senhas no primeiro acesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
