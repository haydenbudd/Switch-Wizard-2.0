import { cn } from '@/app/components/ui/utils';

interface ProductCountBadgeProps {
  count: number;
  className?: string;
}

export function ProductCountBadge({ count, className }: ProductCountBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-300",
      count > 0 
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
      className
    )}>
      {count} found
    </div>
  );
}
