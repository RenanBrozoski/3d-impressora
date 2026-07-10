import { db } from "@/lib/db";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getDashboardStats(now: Date) {
  const inicioMes = startOfMonth(now);
  const fimMes = endOfMonth(now);

  const [pedidosMes, pedidosPendentes, pedidosEmProducao, pedidosEntregues, clientesAtivos, todosInsumos, proximasEntregas, pedidosAtrasados, expensesMes] =
    await Promise.all([
      db.order.findMany({ where: { dataPedido: { gte: inicioMes, lte: fimMes } }, include: { items: true } }),
      db.order.count({ where: { status: { in: ["AGUARDANDO_APROVACAO", "APROVADO"] } } }),
      db.order.count({ where: { status: { in: ["NA_FILA", "EM_IMPRESSAO", "EM_ACABAMENTO"] } } }),
      db.order.count({ where: { status: "ENTREGUE", dataEntrega: { gte: inicioMes, lte: fimMes } } }),
      db.customer.count({ where: { ativo: true } }),
      db.inventoryItem.findMany(),
      db.order.findMany({
        where: { prazoEntrega: { gte: now }, status: { notIn: ["ENTREGUE", "CANCELADO"] } },
        orderBy: { prazoEntrega: "asc" },
        take: 5,
        include: { customer: { select: { nome: true } } },
      }),
      db.order.findMany({
        where: { prazoEntrega: { lt: now }, status: { notIn: ["ENTREGUE", "CANCELADO"] } },
        orderBy: { prazoEntrega: "asc" },
        include: { customer: { select: { nome: true } } },
      }),
      db.expense.aggregate({ _sum: { valor: true }, where: { data: { gte: inicioMes, lte: fimMes } } }),
    ]);

  const estoqueBaixo = todosInsumos.filter((i) => i.quantidadeAtual <= i.quantidadeMinima);
  const faturamentoMes = pedidosMes.reduce((sum, o) => sum + o.valorTotal, 0);
  const lucroMes = pedidosMes.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.lucroEstimado, 0), 0);
  const pedidosConcluidos = pedidosMes.filter((o) => o.status === "PRONTO_PARA_ENTREGA" || o.status === "ENTREGUE").length;

  return {
    totalPedidosMes: pedidosMes.length,
    pedidosPendentes,
    pedidosEmProducao,
    pedidosConcluidos,
    pedidosEntregues,
    faturamentoMes,
    lucroMes,
    custosMes: expensesMes._sum.valor ?? 0,
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

export async function getProdutosMaisVendidos(limit = 5) {
  const itens = await db.orderItem.groupBy({
    by: ["nomePeca"],
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

export async function getClientesMaisRecorrentes(limit = 5) {
  const clientes = await db.customer.findMany({
    include: { orders: { select: { valorTotal: true } } },
    orderBy: { orders: { _count: "desc" } },
    take: limit,
  });

  return clientes
    .map((c) => ({
      nome: c.nome,
      pedidos: c.orders.length,
      totalGasto: c.orders.reduce((s, o) => s + o.valorTotal, 0),
    }))
    .filter((c) => c.pedidos > 0);
}

export async function getMateriaisMaisConsumidos(limit = 5) {
  const movimentos = await db.inventoryMovement.groupBy({
    by: ["inventoryItemId"],
    where: { tipo: "SAIDA", origem: "PEDIDO" },
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

export async function getImpressorasRelatorio() {
  const printers = await db.printer.findMany({
    include: { filaProducao: { include: { orderItem: { select: { tempoImpressaoH: true } } } } },
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

export async function getTempoMedioProducao() {
  const finalizados = await db.productionQueue.findMany({
    where: { status: "FINALIZADO", dataInicioReal: { not: null }, dataFimReal: { not: null } },
  });

  if (finalizados.length === 0) return 0;

  const totalHoras = finalizados.reduce((sum, f) => {
    const inicio = f.dataInicioReal!.getTime();
    const fim = f.dataFimReal!.getTime();
    return sum + (fim - inicio) / (1000 * 60 * 60);
  }, 0);

  return totalHoras / finalizados.length;
}
