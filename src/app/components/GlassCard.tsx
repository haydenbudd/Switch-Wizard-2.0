import { cn } from "@/app/components/ui/utils";
import { CSSProperties, ReactNode, AriaAttributes } from "react";

interface GlassCardProps extends Pick<AriaAttributes, 'aria-label' | 'aria-pressed' | 'aria-checked' | 'aria-disabled'> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  /** Override the implicit role (e.g. 'radio'/'checkbox' for wizard option cards) */
  role?: string;
}

export function GlassCard({
  children,
  className,
  hoverEffect = false,
  interactive = false,
  onClick,
  style,
  role,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'aria-checked': ariaChecked,
  'aria-disabled': ariaDisabled,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      onKeyDown={interactive && onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      role={role ?? (interactive ? "button" : undefined)}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-checked={ariaChecked}
      aria-disabled={ariaDisabled}
      style={style}
      className={cn(
        "glass-card rounded-[10px] p-6 transition-all duration-300 relative group",
        hoverEffect && "lm-card-hover hover:-translate-y-0.5",
        interactive && "cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
}
