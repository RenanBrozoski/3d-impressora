import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ tipo, id }: { tipo: "pedidos" | "orcamentos"; id: number }) {
  return (
    <a href={`/api/pdf/${tipo}/${id}`} target="_blank" rel="noopener noreferrer" className="print:hidden">
      <Button variant="outline">
        <FileText size={16} />
        Gerar PDF
      </Button>
    </a>
  );
}
