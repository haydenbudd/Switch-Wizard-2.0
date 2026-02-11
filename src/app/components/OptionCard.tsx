import { memo } from 'react';
import type { ElementType } from 'react';
import { GlassCard } from './GlassCard';
import { cn } from '@/app/components/ui/utils';
import { Check } from 'lucide-react';

interface OptionCardProps {
  id?: string;
  label: string;
  icon?: ElementType;
  description?: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  count?: number;
  index?: number;
}

export const OptionCard = memo(function OptionCard({
  id,
  label,
  icon: Icon,
  description,
  selected,
  onClick,
  disabled,
  count,
  className,
  index = 0,
}: OptionCardProps) {
  const isDisabled = disabled || count === 0;
  return (
    <GlassCard
      interactive={!isDisabled}
      hoverEffect={!isDisabled && !selected}
      onClick={() => !isDisabled && onClick()}
      aria-label={`${label}${selected ? ', selected' : ''}${isDisabled ? ', unavailable' : ''}${count !== undefined ? `, ${count} products` : ''}`}
      aria-pressed={selected}
      aria-disabled={isDisabled}
      className={cn(
        "h-full flex flex-col items-center text-center justify-center min-h-[180px] relative transition-all duration-300 animate-card-enter",
        selected
          ? "border-primary/25 bg-primary/[0.03] dark:bg-primary/[0.06] shadow-[var(--selection-glow)]"
          : "hover:border-primary/15",
        isDisabled && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
      style={{ animationDelay: `${index * 60}ms` } as React.CSSProperties}
    >
      {selected && (
        <div className="absolute top-3 right-3 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-white shadow-sm shadow-primary/30 animate-in zoom-in duration-150">
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>
      )}

      <div className={cn(
        "w-16 h-16 flex items-center justify-center rounded-2xl mb-4 transition-all duration-300",
        selected
          ? "bg-primary text-white shadow-lg shadow-primary/25 scale-110"
          : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary dark:group-hover:bg-primary/15 dark:group-hover:text-primary"
      )}>
        {Icon ? <Icon className="w-7 h-7" /> : <div className="w-7 h-7" />}
      </div>

      <h3 className={cn(
        "font-semibold text-lg mb-1.5 transition-colors",
        selected ? "text-primary dark:text-primary" : "text-foreground"
      )}>
        {label}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground leading-snug max-w-[220px]">
          {description}
        </p>
      )}

      {count !== undefined && count > 0 && (
        <span className="mt-3 text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full tabular-nums">
          {count} {count === 1 ? 'product' : 'products'}
        </span>
      )}
      {count === 0 && (
        <span className="mt-3 text-xs font-medium text-red-400 dark:text-red-500 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-full">
          No products available
        </span>
      )}
    </GlassCard>
  );
});
