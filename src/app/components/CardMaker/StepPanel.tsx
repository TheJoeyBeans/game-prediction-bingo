import type { ReactNode } from "react";

interface StepPanelProps {
  step?: number;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

const StepPanel = ({ step, title, aside, children }: StepPanelProps) => (
  <section className="rounded-2xl bg-ink-900/80 p-4 ring-1 ring-inset ring-white/10 sm:p-6">
    <header className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-3 font-display text-lg font-semibold tracking-tight">
        {step !== undefined && (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-sm text-mist-100">
            {step}
          </span>
        )}
        {title}
      </h2>
      {aside}
    </header>
    {children}
  </section>
);

export default StepPanel;
