import { getCurrentUser } from "@/lib/dal";
import { CatalogForm } from "../catalog-form";

export default async function NovoCatalogoPage() {
  await getCurrentUser();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">Novo Catálogo</h1>
      <CatalogForm />
    </div>
  );
}
