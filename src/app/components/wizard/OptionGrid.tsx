import { Children, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

type Cols = 1 | 2 | 3 | 4;

// Literal class strings so Tailwind generates them. Each column width is what
// a CSS grid column would be: (100% - (n-1) gaps) / n.
const SM_WIDTH: Record<Cols, string> = {
  1: 'sm:w-full',
  2: 'sm:w-[calc((100%_-_var(--og-gap))/2)]',
  3: 'sm:w-[calc((100%_-_2*var(--og-gap))/3)]',
  4: 'sm:w-[calc((100%_-_3*var(--og-gap))/4)]',
};
const MD_WIDTH: Record<Cols, string> = {
  1: 'md:w-full',
  2: 'md:w-[calc((100%_-_var(--og-gap))/2)]',
  3: 'md:w-[calc((100%_-_2*var(--og-gap))/3)]',
  4: 'md:w-[calc((100%_-_3*var(--og-gap))/4)]',
};

interface OptionGridProps {
  /** Columns from the sm and md breakpoints up (one column below sm). */
  sm?: Cols;
  md?: Cols;
  /** Gap between cards, in rem (1.5 = Tailwind gap-6). */
  gapRem?: number;
  className?: string;
  role?: string;
  'aria-label'?: string;
  children: ReactNode;
}

/**
 * Option-card layout that looks like a CSS grid but centers a partly filled
 * last row (e.g. 5 options in 3 columns puts the last 2 in the middle rather
 * than flush left). Cards in a row stretch to the tallest one, like a grid.
 */
export function OptionGrid({ sm, md, gapRem = 1.5, className, role, 'aria-label': ariaLabel, children }: OptionGridProps) {
  const itemWidth = cn('w-full', sm && SM_WIDTH[sm], md && MD_WIDTH[md]);
  return (
    <div
      className={cn('flex flex-wrap justify-center gap-[var(--og-gap)]', className)}
      style={{ '--og-gap': `${gapRem}rem` } as CSSProperties}
      role={role}
      aria-label={ariaLabel}
    >
      {Children.map(children, (child) => child && <div className={itemWidth}>{child}</div>)}
    </div>
  );
}
