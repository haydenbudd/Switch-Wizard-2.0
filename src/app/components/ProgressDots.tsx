import { cn } from '@/app/components/ui/utils';
import { Check } from 'lucide-react';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export function ProgressDots({ currentStep, totalSteps, onStepClick }: ProgressDotsProps) {
  return (
    <nav aria-label="Wizard progress" className="flex items-center justify-center space-x-2 md:space-x-4 py-6">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            {/* Connecting Line */}
            {index > 0 && (
              <div
                className={cn(
                  "h-0.5 w-4 md:w-8 mr-2 md:mr-4 rounded-full transition-all duration-500",
                  index <= currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}

            {/* Dot */}
            <button
              aria-label={`Step ${index + 1}${isCompleted ? ', completed' : isActive ? ', current' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              onClick={() => onStepClick && index < currentStep && onStepClick(index)}
              disabled={!onStepClick || index >= currentStep}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 z-10",
                isActive
                  ? "border-primary bg-background shadow-[0_0_0_4px_var(--selection-ring)] scale-110"
                  : isCompleted
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border bg-transparent text-muted-foreground/50",
                (onStepClick && index < currentStep) ? "cursor-pointer" : "cursor-default"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 animate-in zoom-in duration-300" />
              ) : (
                <span className={cn(
                  "text-xs font-semibold",
                  isActive ? "text-primary" : ""
                )}>
                  {index + 1}
                </span>
              )}

              {/* Pulse effect for active step */}
              {isActive && (
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
              )}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
