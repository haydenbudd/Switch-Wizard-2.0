import { cn } from "@/app/components/ui/utils";
import { CSSProperties, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function GlassCard({
  children,
  className,
  hoverEffect = false,
  interactive = false,
  onClick,
  style,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "glass-card rounded-2xl p-6 transition-all duration-300 relative overflow-hidden group",
        hoverEffect && "hover:shadow-lg hover:-translate-y-0.5",
        interactive && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {/* Shine sweep on hover */}
      {hoverEffect && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[800ms] ease-out bg-gradient-to-r from-transparent via-black/[0.04] dark:via-white/[0.07] to-transparent" />
        </div>
      )}
      
      {children}
    </div>
  );
}

export function MedicalGlassCard({ 
  children, 
  className,
  ...props 
}: GlassCardProps) {
  return (
    <GlassCard 
      className={cn(
        "border-red-500/10 dark:border-red-400/10 bg-gradient-to-br from-white/80 to-red-50/30 dark:from-gray-900/80 dark:to-red-950/10",
        className
      )}
      {...props}
    >
      {children}
    </GlassCard>
  );
}
