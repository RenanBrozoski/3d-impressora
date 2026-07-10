import { Download } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { SettingsForm } from "./settings-form";
import { UsersSection } from "./users-section";

const DEFAULT_SETTINGS = {
  nomeLoja: "Minha Impressão 3D",
  contatoTelefone: null,
  contatoEmail: null,
  enderecoOrcamento: null,
  valorPadraoKwh: 0.95,
  potenciaPadraoW: 200,
  valorHoraPadraoMaoDeObra: 20,
  margemLucroPadraoPercent: 30,
  taxaMinimaPedido: 0,
  percentualDesperdicioPadrao: 5,
};

export default async function ConfiguracoesPage() {
  await requireAdmin();

  const [settings, users] = await Promise.all([
    db.settings.findUnique({ where: { id: 1 } }),
    db.user.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Configurações</h1>
        <a
          href="/api/backup"
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <Download size={16} />
          Baixar backup do banco
        </a>
      </div>

      <SettingsForm settings={settings ?? DEFAULT_SETTINGS} />
      <UsersSection users={users} />
    </div>
  );
}
