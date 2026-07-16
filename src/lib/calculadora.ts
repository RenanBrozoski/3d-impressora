export type MaterialExtra = {
  pesoG: number;
  precoKg: number;
};

export type CalculadoraInput = {
  quantidade: number;
  pesoUnidadeG: number;
  precoKgMaterial: number;
  percentualDesperdicio: number;
  materiaisExtras?: MaterialExtra[];
  tempoImpressaoH: number;
  potenciaImpressoraW: number;
  valorKwh: number;
  custoHoraMaquina: number;
  tempoMaoObraH: number;
  valorHoraMaoObra: number;
  custoAcabamento: number;
  custoEmbalagem: number;
  outrosCustos: number;
  taxaMinima: number;
  margemLucroPercent: number;
  desconto: number;
};

export type CalculadoraResultado = {
  custoMaterial: number;
  custoEnergia: number;
  custoMaquina: number;
  custoMaoObra: number;
  custoAcabamento: number;
  custoEmbalagem: number;
  outrosCustos: number;
  custoTotalUnitario: number;
  valorUnitario: number;
  valorTotal: number;
  lucroUnitario: number;
  lucroTotal: number;
  margemRealPercent: number;
};

export const CALCULADORA_INPUT_VAZIO: CalculadoraInput = {
  quantidade: 1,
  pesoUnidadeG: 0,
  precoKgMaterial: 0,
  percentualDesperdicio: 0,
  tempoImpressaoH: 0,
  potenciaImpressoraW: 0,
  valorKwh: 0,
  custoHoraMaquina: 0,
  tempoMaoObraH: 0,
  valorHoraMaoObra: 0,
  custoAcabamento: 0,
  custoEmbalagem: 0,
  outrosCustos: 0,
  taxaMinima: 0,
  margemLucroPercent: 0,
  desconto: 0,
};

export function calcular(input: CalculadoraInput): CalculadoraResultado {
  const custoMaterialPrimario =
    (input.pesoUnidadeG / 1000) * input.precoKgMaterial * (1 + input.percentualDesperdicio / 100);
  const custoMateriaisExtras = (input.materiaisExtras ?? []).reduce(
    (soma, m) => soma + (m.pesoG / 1000) * m.precoKg * (1 + input.percentualDesperdicio / 100),
    0,
  );
  const custoMaterial = custoMaterialPrimario + custoMateriaisExtras;
  const custoEnergia = (input.potenciaImpressoraW / 1000) * input.tempoImpressaoH * input.valorKwh;
  const custoMaquina = input.custoHoraMaquina * input.tempoImpressaoH;
  const custoMaoObra = input.tempoMaoObraH * input.valorHoraMaoObra;

  const custoTotalBase =
    custoMaterial +
    custoEnergia +
    custoMaquina +
    custoMaoObra +
    input.custoAcabamento +
    input.custoEmbalagem +
    input.outrosCustos;

  const custoTotalUnitario = Math.max(custoTotalBase, input.taxaMinima);

  // Margem é markup sobre o custo (o jeito que se usa no dia a dia): margem% = lucro / custo.
  // Ex.: margem 100% em cima de um custo de R$10 dá um preço de R$20 (dobro do custo).
  const margem = Math.max(input.margemLucroPercent, 0) / 100;
  const precoSugerido = custoTotalUnitario * (1 + margem);
  const valorUnitario = Math.max(precoSugerido - input.desconto, 0);

  const quantidade = Math.max(input.quantidade, 1);
  const valorTotal = valorUnitario * quantidade;
  const custoTotalGeral = custoTotalUnitario * quantidade;
  const lucroUnitario = valorUnitario - custoTotalUnitario;
  const lucroTotal = valorTotal - custoTotalGeral;
  const margemRealPercent = custoTotalUnitario > 0 ? (lucroUnitario / custoTotalUnitario) * 100 : 0;

  return {
    custoMaterial: round(custoMaterial),
    custoEnergia: round(custoEnergia),
    custoMaquina: round(custoMaquina),
    custoMaoObra: round(custoMaoObra),
    custoAcabamento: round(input.custoAcabamento),
    custoEmbalagem: round(input.custoEmbalagem),
    outrosCustos: round(input.outrosCustos),
    custoTotalUnitario: round(custoTotalUnitario),
    valorUnitario: round(valorUnitario),
    valorTotal: round(valorTotal),
    lucroUnitario: round(lucroUnitario),
    lucroTotal: round(lucroTotal),
    margemRealPercent: round(margemRealPercent),
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
