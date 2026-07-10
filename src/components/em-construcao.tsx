export function EmConstrucao({ titulo, fase }: { titulo: string; fase: string }) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-neutral-900 dark:text-white">{titulo}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-neutral-500 dark:text-neutral-400">
          Módulo será construído em {fase}.
        </p>
      </div>
    </div>
  );
}
