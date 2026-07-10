"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrackingLink({ token }: { token: string }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    const url = `${window.location.origin}/acompanhar/${token}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <Button variant="outline" onClick={copiar}>
      {copiado ? <Check size={16} /> : <Link2 size={16} />}
      {copiado ? "Link copiado!" : "Copiar link de acompanhamento"}
    </Button>
  );
}
