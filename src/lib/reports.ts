import { db } from "@/lib/db";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getDashboardStats(inicio: Date, fim: Date) {
  const [
    pedidosPeriodo,
    pedidosPendentes,
    pedidosEmProducao,
    pedidosEntregues,
    clientesAtivos,
    todosInsumos,
    proximasEntregas,
    pedidosAtrasados,
    expensesPeriodo,
  ] = await Promise.all([
    db.order.findMany({ where: { dataPedido: { gte: inicio, lte: fim } }, include: { items: true } }),
    db.order.count({ where: { status: { in: ["AGUARDANDO_APROVACAO", "APROVADO"] } } }),
    db.order.count({ where: { status: { in: ["NA_FILA", "EM_IMPRESSAO", "EM_ACABAMENTO"] } } }),
    db.order.count({ where: { status: "ENTREGUE", dataEntrega: { gte: inicio, lte: fim } } }),
    db.customer.count({ where: { ativo: true } }),
    db.inventoryItem.findMany(),
    db.order.findMany({
      where: { prazoEntrega: { gte: new Date() }, status: { notIn: ["ENTREGUE", "CANCELADO"] } },
      orderBy: { prazoEntrega: "asc" },
      take: 5,
      include: { customer: { select: { nome: true } } },
    }),
    db.order.findMany({
      where: { prazoEntrega: { lt: new Date() }, status: { notIn: ["ENTREGUE", "CANCELADO"] } },
      orderBy: { prazoEntrega: "asc" },
      include: { customer: { select: { nome: true } } },
    }),
    db.expense.aggregate({ _sum: { valor: true }, where: { data: { gte: inicio, lte: fim } } }),
  ]);

  const estoqueBaixo = todosInsumos.filter((i) => i.quantidadeAtual <= i.quantidadeMinima);
  const faturamentoPeriodo = pedidosPeriodo.reduce((sum, o) => sum + o.valorTotal, 0);
  const lucroPeriodo = pedidosPeriodo.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.lucroEstimado, 0), 0);
  const pedidosConcluidos = pedidosPeriodo.filter((o) => o.status === "PRONTO_PARA_ENTREGA" || o.status === "ENTREGUE").length;

  return {
    totalPedidosPeriodo: pedidosPeriodo.length,
    pedidosPendentes,
    pedidosEmProducao,
    pedidosConcluidos,
    pedidosEntregues,
    faturamentoPeriodo,
    lucroPeriodo,
    custosPeriodo: expensesPeriodo._sum.valor ?? 0,
    clientesAtivos,
    estoqueBaixo,
    proximasEntregas,
    pedidosAtrasados,
  };
}

export async function getFaturamentoPorMes(meses = 6) {
  const now = new Date();
  const resultado: { mes: string; faturamento: number; lucro: number }[] = [];

  for (let i = meses - 1; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const inicio = startOfMonth(ref);
    const fim = endOfMonth(ref);

    const orders = await db.order.findMany({ where: { dataPedido: { gte: inicio, lte: fim } }, include: { items: true } });
    const faturamento = orders.reduce((sum, o) => sum + o.valorTotal, 0);
    const lucro = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.lucroEstimado, 0), 0);

    resultado.push({
      mes: ref.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      faturamento: Math.round(faturamento * 100) / 100,
      lucro: Math.round(lucro * 100) / 100,
    });
  }

  return resultado;
}

export async function getPedidosPorStatus() {
  const grupos = await db.order.groupBy({ by: ["status"], _count: { _all: true } });
  return grupos.map((g) => ({ status: g.status, quantidade: g._count._all }));
}

export async function getProdutosMaisVendidos(limit = 5, periodo?: { inicio: Date; fim: Date }) {
  const itens = await db.orderItem.groupBy({
    by: ["nomePeca"],
    where: periodo ? { order: { dataPedido: { gte: periodo.inicio, lte: periodo.fim } } } : undefined,
    _sum: { quantidade: true, valorTotal: true, lucroEstimado: true },
    orderBy: { _sum: { valorTotal: "desc" } },
    take: limit,
  });

  return itens.map((i) => ({
    nome: i.nomePeca,
    quantidade: i._sum.quantidade ?? 0,
    valorTotal: i._sum.valorTotal ?? 0,
    lucro: i._sum.lucroEstimado ?? 0,
  }));
}

export async function getClientesMaisRecorrentes(limit = 5, periodo?: { inicio: Date; fim: Date }) {
  const grupos = await db.order.groupBy({
    by: ["customerId"],
    where: periodo ? { dataPedido: { gte: periodo.inicio, lte: periodo.fim } } : undefined,
    _count: { _all: true },
    _sum: { valorTotal: true },
    orderBy: { _count: { customerId: "desc" } },
    take: limit,
  });

  const customers = await db.customer.findMany({
    where: { id: { in: grupos.map((g) => g.customerId) } },
    select: { id: true, nome: true },
  });

  return grupos.map((g) => ({
    nome: customers.find((c) => c.id === g.customerId)?.nome ?? "Desconhecido",
    pedidos: g._count._all,
    totalGasto: g._sum.valorTotal ?? 0,
  }));
}

export async function getMateriaisMaisConsumidos(limit = 5, periodo?: { inicio: Date; fim: Date }) {
  const movimentos = await db.inventoryMovement.groupBy({
    by: ["inventoryItemId"],
    where: {
      tipo: "SAIDA",
      origem: "PEDIDO",
      ...(periodo ? { createdAt: { gte: periodo.inicio, lte: periodo.fim } } : {}),
    },
    _sum: { quantidade: true },
    orderBy: { _sum: { quantidade: "desc" } },
    take: limit,
  });

  const itens = await db.inventoryItem.findMany({
    where: { id: { in: movimentos.map((m) => m.inventoryItemId) } },
  });

  return movimentos.map((m) => {
    const item = itens.find((i) => i.id === m.inventoryItemId);
    return { nome: item?.nome ?? "Desconhecido", unidade: item?.unidade ?? "", quantidade: m._sum.quantidade ?? 0 };
  });
}

export async function getImpressorasRelatorio(periodo?: { inicio: Date; fim: Date }) {
  const printers = await db.printer.findMany({
    include: {
      filaProducao: {
        where: periodo ? { createdAt: { gte: periodo.inicio, lte: periodo.fim } } : undefined,
        include: { orderItem: { select: { tempoImpressaoH: true } } },
      },
    },
  });

  return printers.map((p) => {
    const total = p.filaProducao.length;
    const falhas = p.filaProducao.filter((f) => f.status === "FALHOU").length;
    const horas = p.filaProducao.reduce((s, f) => s + (f.orderItem.tempoImpressaoH ?? 0), 0);
    return {
      nome: p.nome,
      horasTotais: horas,
      taxaFalha: total > 0 ? (falhas / total) * 100 : 0,
    };
  });
}

export async function getTempoMedioProducao(periodo?: { inicio: Date; fim: Date }) {
  const finalizados = await db.productionQueue.findMany({
    where: {
      status: "FINALIZADO",
      dataInicioReal: { not: null },
      dataFimReal: periodo ? { not: null, gte: periodo.inicio, lte: periodo.fim } : { not: null },
    },
  });

  if (finalizados.length === 0) return 0;

  const totalHoras = finalizados.reduce((sum, f) => {
    const inicio = f.dataInicioReal!.getTime();
    const fim = f.dataFimReal!.getTime();
    return sum + (fim - inicio) / (1000 * 60 * 60);
  }, 0);

  return totalHoras / finalizados.length;
}
