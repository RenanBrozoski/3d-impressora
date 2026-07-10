import { z } from "zod";
import { ItemPayloadSchema } from "./item";

export const OrderPayloadSchema = z.object({
  customerId: z.number({ error: "Selecione um cliente." }).int().positive(),
  prazoEntrega: z.string().nullable().optional(),
  formaPagamento: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
  items: z.array(ItemPayloadSchema).min(1, "Adicione ao menos um item."),
});

export type OrderPayload = z.infer<typeof OrderPayloadSchema>;

export const PaymentPayloadSchema = z.object({
  valor: z.coerce.number().positive("Informe um valor de pagamento válido."),
  data: z.string().optional(),
  formaPagamento: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});
