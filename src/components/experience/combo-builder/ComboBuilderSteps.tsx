import { Check } from "lucide-react";
import { comboBuilderSteps } from "@/data/combo-builder";

export function ComboBuilderSteps() {
  return (
    <section className="sticky top-20 z-40 border-b border-outline-variant/30 bg-surface/95 py-3 shadow-sm backdrop-blur-md">
      <div className="container-jj">
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-3 md:gap-4">
          {comboBuilderSteps.map((step) => {
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active";

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 ${step.status === "pending" ? "opacity-60" : ""}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                    isCompleted
                      ? "bg-secondary text-on-secondary"
                      : isActive
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" aria-hidden /> : step.id}
                </div>
                <div className="min-w-0">
                  <span
                    className={`label-sm block uppercase tracking-wider ${
                      isCompleted
                        ? "text-secondary"
                        : isActive
                          ? "text-primary"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span
                    className={`block truncate text-xs font-semibold md:text-sm ${
                      isActive ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
