"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CustomerForm } from "../customer-form";

type CustomerData = {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpfCnpj: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
};

export function EditarClienteButton({ customer }: { customer: CustomerData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Pencil size={16} />
        Editar
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar cliente">
        <CustomerForm customer={customer} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
