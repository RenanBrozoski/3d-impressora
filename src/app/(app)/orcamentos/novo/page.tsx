import { db } from "@/lib/db";
import { getItemEditorRefs } from "@/lib/item-refs";
import { QuoteForm } from "../quote-form";

export default async function NovoOrcamentoPage() {
  const [refs, customers] = await Promise.all([
    getItemEditorRefs(),
    db.customer.findMany({ where: { ativo: true }, select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">Novo orçamento</h1>
      <QuoteForm refs={refs} customers={customers} />
    </div>
  );
}
