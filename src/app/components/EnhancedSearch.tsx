import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/components/ui/utils';

interface EnhancedSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function EnhancedSearch({ 
  searchTerm, 
  onSearchChange, 
  className,
  placeholder = "Search by series, specs, or part number..."
}: EnhancedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(searchTerm);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  const handleClear = () => {
    setLocalValue('');
    onSearchChange('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    onSearchChange(val);
  };

  return (
    <div className={cn("relative group", className)}>
      <div className={cn(
        "absolute inset-0 bg-blue-500/5 rounded-lg blur-md transition-opacity",
        isFocused ? "opacity-100" : "opacity-0"
      )} />
      
      <div className={cn(
        "relative flex items-center bg-white/80 dark:bg-black/40 backdrop-blur-md border rounded-lg overflow-hidden transition-all duration-300",
        isFocused ? "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20" : "border-white/20 shadow-sm hover:border-white/40"
      )}>
        <Search className={cn(
          "w-5 h-5 ml-3 transition-colors",
          isFocused ? "text-blue-500" : "text-muted-foreground"
        )} />
        
        <Input
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="border-none shadow-none focus-visible:ring-0 bg-transparent h-12 text-base px-3"
        />

        {localValue && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mr-2 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        
        {/* Keyboard shortcut hint */}
        <div className="hidden md:flex pr-3 pointer-events-none">
          <Badge variant="outline" className="text-[10px] h-5 bg-background/50 text-muted-foreground border-border/50">
            /
          </Badge>
        </div>
      </div>
    </div>
  );
}
