import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Button } from './button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu.jsx';

export function Combobox({
  options = [],
  value = '',
  onValueChange,
  placeholder = 'Selecionar',
  emptyText = 'Nenhum item encontrado',
  className,
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu modal={false}>
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
        <div className="max-h-64 overflow-y-auto py-1">
          {options.length === 0 ? (
            <div className="px-2 py-3 text-sm text-white/45">{emptyText}</div>
          ) : options.map((option) => (
            <DropdownMenuItem
              key={option.value || option.label}
              onSelect={(event) => {
                event.preventDefault();
                onValueChange?.(option.value);
              }}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-white focus:bg-white/10 focus:text-white"
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
