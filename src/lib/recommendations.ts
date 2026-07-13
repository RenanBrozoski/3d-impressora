import { db } from "@/lib/db";

export type Recommendation = {
  id: string;
  categoria: "vendas" | "precificacao" | "producao" | "estoque" | "clientes";
  nivel: "oportunidade" | "atencao" | "alerta";
  titulo: string;
  descricao: string;
  href?: string;
};

const CATEGORIA_LABEL: Record<Recommendation["categoria"], string> = {
  vendas: "Vendas",
  precificacao: "Precificação",
  producao: "Produção",
  estoque: "Estoque",
  clientes: "Clientes",
};

const DIA_MS = 1000 * 60 * 60 * 24;

async function recomendacoesVendas(): Promise<Recommendation[]> {
  const grupos = await db.orderItem.groupBy({
    by: ["nomePeca"],
    _sum: { quantidade: true, valorTotal: true },
    _count: { _all: true },
  });

  const recs: Recommendation[] = [];
  const maisVendido = grupos.filter((g) => (g._count._all ?? 0) >= 1).sort((a, b) => (b._sum.quantidade ?? 0) - (a._sum.quantidade ?? 0))[0];

  if (maisVendido && (maisVendido._sum.quantidade ?? 0) >= 3) {
    recs.push({
      id: "vendas-campeao",
      categoria: "vendas",
      nivel: "oportunidade",
      titulo: `"${maisVendido.nomePeca}" é sua peça mais vendida`,
      descricao: `${maisVendido._sum.quantidade} unidades vendidas até agora, somando ${formatCurrencySimple(maisVendido._sum.valorTotal ?? 0)}. Vale manter filamento e tempo de produção sempre reservados pra essa peça.`,
    });
  }

  return recs;
}

async function recomendacoesPrecificacao(): Promise<Recommendation[]> {
  const grupos = await db.orderItem.groupBy({
    by: ["nomePeca"],
    _sum: { valorTotal: true, lucroEstimado: true },
    _count: { _all: true },
  });

  const comMargem = grupos
    .filter((g) => (g._count._all ?? 0) >= 2 && (g._sum.valorTotal ?? 0) > 0)
    .map((g) => ({
      nome: g.nomePeca,
      vendas: g._count._all,
      valorTotal: g._sum.valorTotal ?? 0,
      margemPercent: ((g._sum.lucroEstimado ?? 0) / (g._sum.valorTotal || 1)) * 100,
    }));

  const recs: Recommendation[] = [];

  const piorMargem = [...comMargem].sort((a, b) => a.margemPercent - b.margemPercent)[0];
  if (piorMargem && piorMargem.margemPercent < 15) {
    recs.push({
      id: "precificacao-margem-baixa",
      categoria: "precificacao",
      nivel: "alerta",
      titulo: `"${piorMargem.nome}" está com margem baixa (${piorMargem.margemPercent.toFixed(0)}%)`,
      descricao: `Nas últimas ${piorMargem.vendas} vendas, a margem real ficou em ${piorMargem.margemPercent.toFixed(0)}% — considere aumentar o preço, revisar o custo de material ou reduzir desperdício.`,
      href: "/produtos",
    });
  }

  const melhorMargem = [...comMargem].sort((a, b) => b.margemPercent - a.margemPercent)[0];
  if (melhorMargem && melhorMargem.margemPercent > 40 && melhorMargem.nome !== piorMargem?.nome) {
    recs.push({
      id: "precificacao-margem-alta",
      categoria: "precificacao",
      nivel: "oportunidade",
      titulo: `"${melhorMargem.nome}" tem a melhor margem (${melhorMargem.margemPercent.toFixed(0)}%)`,
      descricao: `Essa peça dá bastante lucro por unidade — pode valer a pena divulgar mais ela ou usá-la como "carro-chefe" em promoções.`,
      href: "/produtos",
    });
  }

  return recs;
}

async function recomendacoesProducao(): Promise<Recommendation[]> {
  const printers = await db.printer.findMany({
    include: { filaProducao: { select: { status: true } } },
  });

  const recs: Recommendation[] = [];

  for (const printer of printers) {
    const total = printer.filaProducao.length;
    const falhas = printer.filaProducao.filter((f) => f.status === "FALHOU").length;
    const taxaFalha = total > 0 ? (falhas / total) * 100 : 0;

    if (total >= 5 && taxaFalha >= 15) {
      recs.push({
        id: `producao-falha-${printer.id}`,
        categoria: "producao",
        nivel: "alerta",
        titulo: `Impressora "${printer.nome}" com taxa de falha alta (${taxaFalha.toFixed(0)}%)`,
        descricao: `De ${total} impressões registradas, ${falhas} falharam. Vale revisar calibração, nivelamento ou manutenção dessa impressora.`,
        href: "/impressoras",
      });
    }
  }

  const atrasados = await db.order.count({
    where: { prazoEntrega: { lt: new Date() }, status: { notIn: ["ENTREGUE", "CANCELADO"] } },
  });
  if (atrasados > 0) {
    recs.push({
      id: "producao-atrasados",
      categoria: "producao",
      nivel: "alerta",
      titulo: `${atrasados} pedido(s) atrasado(s)`,
      descricao: `Existem pedidos com prazo de entrega vencido que ainda não foram entregues. Priorize esses na fila de produção.`,
      href: "/relatorios",
    });
  }

  return recs;
}

async function recomendacoesEstoque(): Promise<Recommendation[]> {
  const itens = await db.inventoryItem.findMany({ where: { tipo: { in: ["FILAMENTO", "RESINA"] } } });
  const baixos = itens.filter((i) => i.quantidadeAtual <= i.quantidadeMinima);

  const recs: Recommendation[] = [];
  if (baixos.length > 0) {
    recs.push({
      id: "estoque-baixo",
      categoria: "estoque",
      nivel: "alerta",
      titulo: `${baixos.length} filamento(s)/resina(s) com estoque baixo`,
      descricao: `${baixos.map((i) => i.nome).join(", ")}. Considere comprar mais antes de aceitar novos pedidos que dependam desses materiais.`,
      href: "/estoque/filamentos",
    });
  }

  const movimentos = await db.inventoryMovement.groupBy({
    by: ["inventoryItemId"],
    where: { tipo: "SAIDA", origem: "PEDIDO" },
    _sum: { quantidade: true },
    orderBy: { _sum: { quantidade: "desc" } },
    take: 1,
  });
  if (movimentos[0]) {
    const item = await db.inventoryItem.findUnique({ where: { id: movimentos[0].inventoryItemId } });
    if (item && !baixos.some((b) => b.id === item.id)) {
      recs.push({
        id: "estoque-mais-usado",
        categoria: "estoque",
        nivel: "oportunidade",
        titulo: `"${item.nome}" é o material mais consumido`,
        descricao: `Já foram usados ${movimentos[0]._sum.quantidade?.toFixed(1)} ${item.unidade.toLowerCase()} em pedidos. Fique de olho pra nunca faltar esse item.`,
        href: "/estoque/filamentos",
      });
    }
  }

  return recs;
}

async function recomendacoesClientes(): Promise<Recommendation[]> {
  const clientes = await db.customer.findMany({
    where: { ativo: true },
    include: { orders: { select: { dataPedido: true }, orderBy: { dataPedido: "desc" } } },
  });

  const recs: Recommendation[] = [];
  const agora = Date.now();

  const recorrentesInativos = clientes
    .filter((c) => c.orders.length >= 2)
    .map((c) => ({ nome: c.nome, pedidos: c.orders.length, diasSemPedido: (agora - c.orders[0].dataPedido.getTime()) / DIA_MS }))
    .filter((c) => c.diasSemPedido >= 60)
    .sort((a, b) => b.diasSemPedido - a.diasSemPedido);

  if (recorrentesInativos[0]) {
    const c = recorrentesInativos[0];
    recs.push({
      id: "clientes-reativar",
      categoria: "clientes",
      nivel: "oportunidade",
      titulo: `"${c.nome}" pode estar esfriando`,
      descricao: `Já fez ${c.pedidos} pedidos, mas não compra há ${Math.round(c.diasSemPedido)} dias. Pode valer a pena mandar uma mensagem oferecendo algo novo.`,
      href: "/clientes",
    });
  }

  return recs;
}

const NIVEL_ORDEM: Record<Recommendation["nivel"], number> = { alerta: 0, atencao: 1, oportunidade: 2 };

export async function getRecomendacoes(): Promise<Recommendation[]> {
  const grupos = await Promise.all([
    recomendacoesVendas(),
    recomendacoesPrecificacao(),
    recomendacoesProducao(),
    recomendacoesEstoque(),
    recomendacoesClientes(),
  ]);

  return grupos.flat().sort((a, b) => NIVEL_ORDEM[a.nivel] - NIVEL_ORDEM[b.nivel]);
}

export { CATEGORIA_LABEL };

function formatCurrencySimple(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
