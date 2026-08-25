export function WizardProgress({ steps, currentIdx }: { steps: string[]; currentIdx: number }) {
  return (
    <div className="mb-6">
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: i <= currentIdx ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {steps.map((label, i) => (
          <span
            key={label}
            className={`text-[11px] transition-colors ${i <= currentIdx ? "text-accent font-medium" : "text-muted"}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
