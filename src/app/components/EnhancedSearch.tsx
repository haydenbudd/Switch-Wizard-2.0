import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync local value with prop (e.g. when cleared externally)
  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLocalValue('');
    onSearchChange('');
  }, [onSearchChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    // Debounce the parent callback to avoid re-filtering on every keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(val);
    }, 200);
  }, [onSearchChange]);

  return (
    <div className={cn("relative group", className)}>
      <div className={cn(
        "absolute inset-0 bg-blue-500/5 rounded-lg blur-md transition-opacity",
        isFocused ? "opacity-100" : "opacity-0"
      )} />
      
      <div className={cn(
        "relative flex items-center bg-white/80 dark:bg-black/40 backdrop-blur-md border rounded-lg overflow-hidden transition-all duration-300",
        isFocused ? "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20" : "border-white/20 dark:border-white/10 shadow-sm hover:border-white/40 dark:hover:border-white/20"
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
          aria-label="Search products"
          role="searchbox"
          className="border-none shadow-none focus-visible:ring-0 bg-transparent h-12 text-base px-3"
        />

        {localValue && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-2 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
