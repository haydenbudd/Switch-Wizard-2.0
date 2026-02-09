import { GlassCard } from './GlassCard';
import { cn } from '@/app/components/ui/utils';
import { Check } from 'lucide-react';

interface OptionCardProps {
  id?: string;
  label: string;
  icon?: any;
  description?: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  count?: number;
  index?: number;
}

export function OptionCard({
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
  return (
    <GlassCard
      interactive={!disabled}
      hoverEffect={!disabled && !selected}
      onClick={() => !disabled && onClick()}
      className={cn(
        "h-full flex flex-col items-center text-center justify-center min-h-[180px] relative transition-all duration-300 animate-card-enter",
        selected
          ? "border-primary/30 bg-primary/[0.04] dark:bg-primary/[0.08] ring-2 ring-primary/15 shadow-lg shadow-primary/8"
          : "hover:border-primary/15",
        disabled && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
      style={{ animationDelay: `${index * 60}ms` } as React.CSSProperties}
    >
      {selected && (
        <div className="absolute top-3 right-3 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white shadow-md shadow-primary/25 animate-in zoom-in duration-200">
          <Check className="w-3.5 h-3.5" />
        </div>
      )}

      <div className={cn(
        "w-16 h-16 flex items-center justify-center rounded-2xl mb-4 transition-all duration-300",
        selected
          ? "bg-primary text-white shadow-lg shadow-primary/25 scale-110"
          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary dark:group-hover:bg-primary/15 dark:group-hover:text-primary"
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
        <span className="mt-3 text-xs font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full tabular-nums">
          {count} {count === 1 ? 'product' : 'products'}
        </span>
      )}
    </GlassCard>
  );
}
