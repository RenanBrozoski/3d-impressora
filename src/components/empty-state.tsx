const LAYER_COUNT = 5;

export function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="printer-anim" aria-hidden>
        <div className="printer-nozzle" />
        <div className="printer-layers">
          {Array.from({ length: LAYER_COUNT }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.25}s` }} />
          ))}
        </div>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
    </div>
  );
}
