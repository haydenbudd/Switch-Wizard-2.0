import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';

type Accent = 'primary' | 'medical';

interface StepProgressProps {
  displayStep: number;
  displayTotal: number;
  /** Defaults to the standard flow's (step - 1) / total. */
  progressPercent?: number;
  accent?: Accent;
  /** Right side of the "Step X of Y" row. */
  label?: string;
  ariaLabel?: string;
}

/** 700px progress block: "Step X of Y" label plus animated bar. */
export function StepProgress({
  displayStep,
  displayTotal,
  progressPercent = Math.round(((displayStep - 1) / displayTotal) * 100),
  accent = 'primary',
  label,
  ariaLabel,
}: StepProgressProps) {
  return (
    <div className="mx-auto mb-8" style={{ maxWidth: '700px' }}>
      {/* items-baseline: the 12px label shares the 16px step text's baseline */}
      <div className="flex justify-between items-baseline !text-base !font-medium !text-muted-foreground mb-2.5 tracking-wide">
        <span className="uppercase">Step {displayStep} of {displayTotal}</span>
        {label && <span className="text-xs text-red-500 font-semibold tracking-widest uppercase">{label}</span>}
      </div>
      <div
        className="h-1.5 bg-border rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? `Wizard progress: step ${displayStep} of ${displayTotal}`}
      >
        <div
          className={cn(
            'h-full bg-gradient-to-r rounded-full lm-progress-fill',
            accent === 'medical' ? 'from-red-600 to-rose-500' : 'from-primary to-primary/80 progress-glow',
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

/** 700px Back row with an optional right-side action. */
export function StepNavRow({ onBack, rightAction }: { onBack: () => void; rightAction?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mx-auto mb-4" style={{ maxWidth: '700px' }}>
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Back
      </Button>
      {rightAction}
    </div>
  );
}

/** Standard step heading (centered title + optional subtitle and extra lines). */
export function StepHeading({
  title,
  subtitle,
  className,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  /** Extra lines under the subtitle, e.g. a short note */
  children?: ReactNode;
}) {
  return (
    <div className={cn('text-center mb-7', className)}>
      <h2 className="!text-3xl md:!text-4xl !font-bold tracking-tight block mb-2">{title}</h2>
      {subtitle && <p className="!text-lg !text-muted-foreground">{subtitle}</p>}
      {children}
    </div>
  );
}
