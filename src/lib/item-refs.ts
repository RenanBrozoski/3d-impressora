import { db } from "@/lib/db";
import type { ItemEditorRefs } from "@/components/item-editor/types";

export async function getItemEditorRefs(): Promise<ItemEditorRefs> {
  const [produtos, insumos, printers, users, settings] = await Promise.all([
    db.product.findMany({
      where: { status: "ATIVO" },
      select: { id: true, nome: true, materialRecomendado: true, pesoMedioG: true, tempoMedioH: true },
      orderBy: { nome: "asc" },
    }),
    db.inventoryItem.findMany({
      where: { tipo: { in: ["FILAMENTO", "RESINA"] } },
      select: { id: true, nome: true, material: true, cor: true, precoPorUnidade: true },
      orderBy: { nome: "asc" },
    }),
    db.printer.findMany({
      where: { status: "ATIVA" },
      select: { id: true, nome: true, potenciaW: true, custoEstimadoHora: true },
      orderBy: { nome: "asc" },
    }),
    db.user.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, valorHora: true },
      orderBy: { nome: "asc" },
    }),
    db.settings.findUnique({ where: { id: 1 } }),
  ]);

  return {
    produtos,
    insumos,
    printers,
    users,
    settings: settings ?? {
      valorPadraoKwh: 0.95,
      potenciaPadraoW: 200,
      valorHoraPadraoMaoDeObra: 20,
      margemLucroPadraoPercent: 30,
      taxaMinimaPedido: 0,
      percentualDesperdicioPadrao: 5,
    },
  };
}
