import { cn } from '@/app/components/ui/utils';
import { Check } from 'lucide-react';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export function ProgressDots({ currentStep, totalSteps, onStepClick }: ProgressDotsProps) {
  // We want to show steps 0 to totalSteps.
  // currentStep is 0-based index.
  
  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-4 py-6">
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
                  index <= currentStep ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                )} 
              />
            )}
            
            {/* Dot */}
            <button
              onClick={() => onStepClick && index < currentStep && onStepClick(index)}
              disabled={!onStepClick || index >= currentStep}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 z-10",
                isActive 
                  ? "border-blue-500 bg-white dark:bg-gray-900 shadow-[0_0_0_4px_rgba(59,130,246,0.1)] scale-110" 
                  : isCompleted 
                    ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600" 
                    : "border-gray-300 dark:border-gray-600 bg-transparent text-gray-300 dark:text-gray-600",
                (onStepClick && index < currentStep) ? "cursor-pointer" : "cursor-default"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 animate-in zoom-in duration-300" />
              ) : (
                <span className={cn(
                  "text-xs font-semibold",
                  isActive ? "text-blue-500" : ""
                )}>
                  {index + 1}
                </span>
              )}
              
              {/* Pulse effect for active step */}
              {isActive && (
                <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
