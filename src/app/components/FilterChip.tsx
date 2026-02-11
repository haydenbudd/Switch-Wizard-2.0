import { memo } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

export const FilterChip = memo(function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 animate-in fade-in zoom-in-95",
        "bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm text-foreground",
        "hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800/30 group cursor-pointer",
        className
      )}
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
    >
      <span>{label}</span>
      <span
        className="ml-1 rounded-full p-0.5 hover:bg-red-100 dark:hover:bg-red-900/40 text-muted-foreground group-hover:text-red-500 transition-colors"
        aria-hidden="true"
      >
        <X className="w-3 h-3" />
      </span>
    </button>
  );
});
