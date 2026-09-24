import { memo } from 'react';
import type { ElementType } from 'react';
import { GlassCard } from './GlassCard';
import { cn } from '@/app/components/ui/utils';
import { Check } from 'lucide-react';

interface OptionCardProps {
  label: string;
  icon?: ElementType;
  description?: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  /** Exact-match product count (undefined = don't show a count). */
  count?: number;
  /** Close-match count — products that fit most, but not all, answers. */
  closeCount?: number;
  index?: number;
  /** ARIA role — use 'radio' for single-select steps, 'checkbox' for multi-select */
  role?: 'radio' | 'checkbox';
  /** 'row' = compact icon-left card, for steps with many options */
  layout?: 'stack' | 'row';
}

export const OptionCard = memo(function OptionCard({
  label,
  icon: Icon,
  description,
  selected,
  onClick,
  disabled,
  count,
  closeCount = 0,
  className,
  index = 0,
  role = 'radio',
  layout = 'stack',
}: OptionCardProps) {
  const row = layout === 'row';
  // Only a card with nothing at all behind it is unavailable — zero exact
  // matches but some close ones is still a legitimate preference to state.
  const isDisabled = disabled || (count === 0 && closeCount === 0);
  return (
    <GlassCard
      interactive={!isDisabled}
      hoverEffect={!isDisabled && !selected}
      onClick={() => !isDisabled && onClick()}
      role={role}
      aria-label={`${label}${selected ? ', selected' : ''}${isDisabled ? ', unavailable' : ''}${count !== undefined ? `, ${count} exact ${count === 1 ? 'match' : 'matches'}${closeCount ? `, ${closeCount} close` : ''}` : ''}`}
      aria-checked={selected}
      aria-disabled={isDisabled}
      className={cn(
        row
          ? "h-full flex flex-row items-center text-left gap-4 p-4 relative transition-all duration-300 animate-card-enter border-2"
          : "h-full flex flex-col items-center text-center justify-center min-h-[150px] p-5 relative transition-all duration-300 animate-card-enter border-2",
        selected
          ? "!border-primary bg-primary/[0.04] dark:bg-primary/[0.08] shadow-[var(--selection-glow)]"
          : "hover:!border-primary/40",
        isDisabled && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
      style={{ animationDelay: `${index * 25}ms` } as React.CSSProperties}
    >
      {selected && (
        <div className="absolute top-3 right-3 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-white shadow-sm shadow-primary/30 animate-in zoom-in duration-150" aria-hidden="true">
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>
      )}

      <div className={cn(
        "w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300",
        !row && "mb-3",
        selected
          ? "bg-primary !text-white shadow-lg shadow-primary/25 scale-105"
          : "bg-primary/10 !text-primary dark:bg-primary/15 group-hover:bg-primary group-hover:!text-white"
      )}>
        {Icon ? <Icon className="w-7 h-7" aria-hidden="true" /> : <div className="w-7 h-7" />}
      </div>

      <div className={cn(row && "min-w-0 pr-5")}>
      <span className={cn(
        "!text-xl !font-semibold block mb-1 transition-colors",
        selected ? "!text-primary dark:!text-primary" : "!text-foreground group-hover:!text-primary"
      )}>
        {label}
      </span>

      {description && (
        <p className={cn("!text-base !text-muted-foreground", !row && "max-w-[280px]")}>
          {description}
        </p>
      )}
      </div>

      {count !== undefined && (count > 0 || closeCount > 0) && (
        <span className="!text-base !font-medium mt-2.5 px-3 py-0.5 !text-muted-foreground bg-secondary rounded-full tabular-nums">
          {count > 0
            ? `${count} ${count === 1 ? 'match' : 'matches'}`
            : 'No exact match'}
          {closeCount > 0 && <span className="!text-amber-700 dark:!text-amber-400"> · {closeCount} close</span>}
        </span>
      )}
      {count === 0 && closeCount === 0 && (
        <span className="!text-base !font-medium mt-2.5 px-3 py-0.5 !text-red-400 dark:!text-red-500 bg-red-50 dark:bg-red-950/30 rounded-full">
          No products available
        </span>
      )}
    </GlassCard>
  );
});
