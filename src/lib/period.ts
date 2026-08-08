export type PeriodoSearchParams = { periodo?: string; inicio?: string; fim?: string };

export type PeriodoResolvido = { inicio: Date; fim: Date; label: string; periodo: string };

function inicioDoDia(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function fimDoDia(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

// Resolve o período selecionado (via filtro na tela) num intervalo de datas
// concreto, usado tanto no dashboard quanto nos relatórios.
export function resolvePeriodo(params: PeriodoSearchParams, now: Date = new Date()): PeriodoResolvido {
  const periodo = params.periodo ?? "mes";
  const hoje = inicioDoDia(now);
  const fimHoje = fimDoDia(now);

  switch (periodo) {
    case "hoje":
      return { inicio: hoje, fim: fimHoje, label: "Hoje", periodo };
    case "7d": {
      const inicio = new Date(hoje);
      inicio.setDate(inicio.getDate() - 6);
      return { inicio, fim: fimHoje, label: "Últimos 7 dias", periodo };
    }
    case "30d": {
      const inicio = new Date(hoje);
      inicio.setDate(inicio.getDate() - 29);
      return { inicio, fim: fimHoje, label: "Últimos 30 dias", periodo };
    }
    case "mes_passado": {
      const inicio = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const fim = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { inicio, fim, label: "Mês passado", periodo };
    }
    case "ano": {
      const inicio = new Date(now.getFullYear(), 0, 1);
      const fim = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { inicio, fim, label: "Este ano", periodo };
    }
    case "personalizado": {
      const inicio = params.inicio ? new Date(`${params.inicio}T00:00:00`) : hoje;
      const fim = params.fim ? new Date(`${params.fim}T23:59:59.999`) : fimHoje;
      return { inicio, fim, label: "Personalizado", periodo };
    }
    case "mes":
    default: {
      const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
      const fim = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { inicio, fim, label: "Este mês", periodo: "mes" };
    }
  }
}
