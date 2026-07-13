import type { CalculadoraInput } from "@/lib/calculadora";

export type ItemDraft = {
  clientId: string;
  produtoId: number | null;
  inventoryItemId: number | null;
  nomePeca: string;
  quantidade: number;
  material: string;
  cor: string;
  observacoes: string;
  calc: CalculadoraInput;
};

export type ProdutoRef = {
  id: number;
  nome: string;
  materialRecomendado: string | null;
  pesoMedioG: number | null;
  tempoMedioH: number | null;
};

export type InsumoRef = {
  id: number;
  nome: string;
  material: string | null;
  cor: string | null;
  corHex: string | null;
  precoPorUnidade: number;
  quantidadeAtual: number;
  unidade: string;
};

export type PrinterRef = {
  id: number;
  nome: string;
  potenciaW: number;
  custoEstimadoHora: number;
};

export type UserRef = {
  id: number;
  nome: string;
  valorHora: number | null;
};

export type SettingsDefaults = {
  valorPadraoKwh: number;
  potenciaPadraoW: number;
  valorHoraPadraoMaoDeObra: number;
  margemLucroPadraoPercent: number;
  taxaMinimaPedido: number;
  percentualDesperdicioPadrao: number;
};

export type ItemEditorRefs = {
  produtos: ProdutoRef[];
  insumos: InsumoRef[];
  printers: PrinterRef[];
  users: UserRef[];
  settings: SettingsDefaults;
};

export function novoItemDraft(settings: SettingsDefaults): ItemDraft {
  return {
    clientId: `item-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
    produtoId: null,
    inventoryItemId: null,
    nomePeca: "",
    quantidade: 1,
    material: "",
    cor: "",
    observacoes: "",
    calc: {
      quantidade: 1,
      pesoUnidadeG: 0,
      precoKgMaterial: 0,
      percentualDesperdicio: settings.percentualDesperdicioPadrao,
      tempoImpressaoH: 0,
      potenciaImpressoraW: settings.potenciaPadraoW,
      valorKwh: settings.valorPadraoKwh,
      custoHoraMaquina: 0,
      tempoMaoObraH: 0,
      valorHoraMaoObra: settings.valorHoraPadraoMaoDeObra,
      custoAcabamento: 0,
      custoEmbalagem: 0,
      outrosCustos: 0,
      taxaMinima: settings.taxaMinimaPedido,
      margemLucroPercent: settings.margemLucroPadraoPercent,
      desconto: 0,
    },
  };
}
