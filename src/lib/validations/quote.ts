import { z } from "zod";
import { ItemPayloadSchema } from "./item";

export const QuotePayloadSchema = z.object({
  customerId: z.number({ error: "Selecione um cliente." }).int().positive(),
  validade: z.string().nullable().optional(),
  observacoes: z.string().trim().optional(),
  items: z.array(ItemPayloadSchema).min(1, "Adicione ao menos um item."),
});

export type QuotePayload = z.infer<typeof QuotePayloadSchema>;
