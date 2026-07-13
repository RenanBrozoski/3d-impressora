import Link from "next/link";
import { Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { getRecomendacoes, CATEGORIA_LABEL, type Recommendation } from "@/lib/recommendations";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

const NIVEL_COLOR: Record<Recommendation["nivel"], "red" | "yellow" | "green"> = {
  alerta: "red",
  atencao: "yellow",
  oportunidade: "green",
};

const NIVEL_LABEL: Record<Recommendation["nivel"], string> = {
  alerta: "Atenção",
  atencao: "Fique de olho",
  oportunidade: "Oportunidade",
};

const NIVEL_ICON: Record<Recommendation["nivel"], typeof AlertTriangle> = {
  alerta: AlertTriangle,
  atencao: AlertTriangle,
  oportunidade: TrendingUp,
};

export default async function RecomendacoesPage() {
  await requireAdmin();

  const recomendacoes = await getRecomendacoes();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Lightbulb size={22} className="text-[var(--accent)]" />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Recomendações</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Insights gerados a partir dos seus próprios pedidos, produção e estoque.
          </p>
        </div>
      </div>

      {recomendacoes.length === 0 ? (
        <EmptyState title="Ainda não há dados suficientes pra gerar recomendações. Volte depois de alguns pedidos." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {recomendacoes.map((r) => {
            const Icon = NIVEL_ICON[r.nivel];
            return (
              <div key={r.id} className="card flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge color={NIVEL_COLOR[r.nivel]}>
                    <Icon size={12} />
                    {NIVEL_LABEL[r.nivel]}
                  </Badge>
                  <span className="text-xs text-neutral-400">{CATEGORIA_LABEL[r.categoria]}</span>
                </div>
                <h2 className="font-medium text-neutral-900 dark:text-white">{r.titulo}</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{r.descricao}</p>
                {r.href && (
                  <Link href={r.href} className="mt-1 text-sm text-[var(--accent)] hover:underline">
                    Ver detalhes →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
