import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NovoClienteButton } from "./novo-cliente-button";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const customers = await db.customer.findMany({
    where: q
      ? {
          OR: [
            { nome: { contains: q } },
            { telefone: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { nome: "asc" },
    include: { orders: { select: { valorTotal: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Clientes</h1>
        <NovoClienteButton />
      </div>

      <form className="mb-4" method="get">
        <Input name="q" placeholder="Buscar por nome, telefone ou e-mail..." defaultValue={q ?? ""} />
      </form>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 font-medium">Cidade/UF</th>
              <th className="px-4 py-3 font-medium">Pedidos</th>
              <th className="px-4 py-3 font-medium">Total gasto</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {customers.map((customer) => {
              const totalGasto = customer.orders.reduce((sum, o) => sum + o.valorTotal, 0);
              return (
                <tr key={customer.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/clientes/${customer.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">
                      {customer.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {customer.telefone || customer.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {[customer.cidade, customer.estado].filter(Boolean).join("/") || "-"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{customer.orders.length}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatCurrency(totalGasto)}</td>
                  <td className="px-4 py-3">
                    <Badge color={customer.ativo ? "green" : "neutral"}>
                      {customer.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
