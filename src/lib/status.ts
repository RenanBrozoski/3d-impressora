export const ORDER_STATUS_LABEL: Record<string, string> = {
  AGUARDANDO_APROVACAO: "Aguardando aprovação",
  APROVADO: "Aprovado",
  NA_FILA: "Na fila",
  EM_IMPRESSAO: "Em impressão",
  EM_ACABAMENTO: "Em acabamento",
  PRONTO_PARA_ENTREGA: "Pronto para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  AGUARDANDO_APROVACAO: "yellow",
  APROVADO: "blue",
  NA_FILA: "neutral",
  EM_IMPRESSAO: "purple",
  EM_ACABAMENTO: "purple",
  PRONTO_PARA_ENTREGA: "orange",
  ENTREGUE: "green",
  CANCELADO: "red",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  PARCIAL: "Parcial",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

export const PAYMENT_STATUS_COLOR: Record<string, string> = {
  PENDENTE: "yellow",
  PARCIAL: "orange",
  PAGO: "green",
  CANCELADO: "red",
};

export const QUOTE_STATUS_LABEL: Record<string, string> = {
  RASCUNHO: "Rascunho",
  ENVIADO: "Enviado",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
  EXPIRADO: "Expirado",
  CONVERTIDO: "Convertido",
};

export const QUOTE_STATUS_COLOR: Record<string, string> = {
  RASCUNHO: "neutral",
  ENVIADO: "blue",
  APROVADO: "green",
  RECUSADO: "red",
  EXPIRADO: "orange",
  CONVERTIDO: "purple",
};

export const PRODUCTION_STATUS_LABEL: Record<string, string> = {
  NA_FILA: "Na fila",
  PREPARANDO_ARQUIVO: "Preparando arquivo",
  IMPRIMINDO: "Imprimindo",
  PAUSADO: "Pausado",
  FALHOU: "Falhou",
  REIMPRIMIR: "Reimprimir",
  EM_ACABAMENTO: "Em acabamento",
  FINALIZADO: "Finalizado",
};

export const PRODUCTION_STATUS_COLOR: Record<string, string> = {
  NA_FILA: "neutral",
  PREPARANDO_ARQUIVO: "blue",
  IMPRIMINDO: "purple",
  PAUSADO: "yellow",
  FALHOU: "red",
  REIMPRIMIR: "orange",
  EM_ACABAMENTO: "orange",
  FINALIZADO: "green",
};

export const PRINTER_STATUS_LABEL: Record<string, string> = {
  ATIVA: "Ativa",
  MANUTENCAO: "Em manutenção",
  PARADA: "Parada",
};

export const PRINTER_STATUS_COLOR: Record<string, string> = {
  ATIVA: "green",
  MANUTENCAO: "yellow",
  PARADA: "red",
};

export const CLIENT_REQUEST_STATUS_LABEL: Record<string, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  CONVERTIDO: "Convertido",
  DESCARTADO: "Descartado",
};

export const CLIENT_REQUEST_STATUS_COLOR: Record<string, string> = {
  NOVO: "blue",
  EM_ANALISE: "yellow",
  CONVERTIDO: "green",
  DESCARTADO: "red",
};

export const PRODUCT_STATUS_LABEL: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export const PRODUCT_STATUS_COLOR: Record<string, string> = {
  ATIVO: "green",
  INATIVO: "neutral",
};
