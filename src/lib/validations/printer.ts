import { z } from "zod";

export const PrinterSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da impressora."),
  modelo: z.string().trim().optional(),
  tipo: z.enum(["FDM", "SLA", "RESINA", "OUTRO"]),
  potenciaW: z.coerce.number().positive("Informe a potência em watts."),
  areaImpressao: z.string().trim().optional(),
  status: z.enum(["ATIVA", "MANUTENCAO", "PARADA"]).default("ATIVA"),
  custoEstimadoHora: z.coerce.number().nonnegative().default(0),
  observacoes: z.string().trim().optional(),
});
