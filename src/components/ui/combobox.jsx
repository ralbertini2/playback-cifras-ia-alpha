import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../lib/utils.js';
import { Button } from './button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.jsx';

export function Combobox({
  options = [],
  value = '',
  onValueChange,
  placeholder = 'Selecionar',
  searchPlaceholder = 'Buscar',
  emptyText = 'Nenhum resultado',
  className,
}) {
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) => String(option.label || option.value || '')
      .toLowerCase()
      .includes(normalizedQuery));
  }, [options, query]);

  return (
    <DropdownMenu modal={false} onOpenChange={(open) => { if (!open) setQuery(''); }}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded="false"
          className={cn('w-full justify-between rounded-xl border-white/10 bg-white/[.07] text-white hover:bg-white/[.11]', className)}
        >
          <span className="truncate">{selected?.label || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 border-white/10 bg-[#101010] p-2 text-white">
        <div className="flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[.06] px-3 text-white/55">
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <div className="max-h-64 overflow-y-auto py-1">
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-3 text-sm text-white/45">{emptyText}</div>
          ) : filteredOptions.map((option) => (
            <DropdownMenuItem
              key={option.value || option.label}
              onSelect={(event) => {
                event.preventDefault();
                onValueChange?.(option.value);
              }}
              className="flex cursor-pointer items-center justify-between gap-3 text-white focus:bg-white/10 focus:text-white"
            >
              <span className="truncate">{option.label}</span>
              {option.value === value ? <Check className="h-4 w-4 shrink-0" /> : null}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
