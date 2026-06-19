import * as React from 'react';
import { PanelLeft } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Button } from './button.jsx';

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

function SidebarProvider({ defaultOpen = true, open: openProp, onOpenChange, className, style, children, ...props }) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = React.useCallback((value) => {
    const nextValue = typeof value === 'function' ? value(open) : value;
    if (onOpenChange) onOpenChange(nextValue);
    else setUncontrolledOpen(nextValue);
  }, [onOpenChange, open]);

  const toggleSidebar = React.useCallback(() => setOpen((current) => !current), [setOpen]);

  const value = React.useMemo(() => ({ open, setOpen, toggleSidebar, state: open ? 'expanded' : 'collapsed' }), [open, setOpen, toggleSidebar]);

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        style={style}
        className={cn('group/sidebar-wrapper flex min-h-svh w-full text-sidebar-foreground', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({ className, children, side = 'left', variant = 'sidebar', collapsible = 'none', ...props }) {
  return (
    <div
      data-slot="sidebar"
      data-side={side}
      data-variant={variant}
      data-collapsible={collapsible}
      className={cn('flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarInset({ className, ...props }) {
  return <main data-slot="sidebar-inset" className={cn('relative flex w-full flex-1 flex-col', className)} {...props} />;
}

function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn('size-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="size-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarHeader({ className, ...props }) {
  return <div data-slot="sidebar-header" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
}

function SidebarFooter({ className, ...props }) {
  return <div data-slot="sidebar-footer" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
}

function SidebarContent({ className, ...props }) {
  return <div data-slot="sidebar-content" className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto', className)} {...props} />;
}

function SidebarGroup({ className, ...props }) {
  return <div data-slot="sidebar-group" className={cn('relative flex w-full min-w-0 flex-col p-2', className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }) {
  return <div data-slot="sidebar-group-label" className={cn('flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none', className)} {...props} />;
}

function SidebarGroupContent({ className, ...props }) {
  return <div data-slot="sidebar-group-content" className={cn('w-full text-sm', className)} {...props} />;
}

function SidebarMenu({ className, ...props }) {
  return <ul data-slot="sidebar-menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }) {
  return <li data-slot="sidebar-menu-item" className={cn('group/menu-item relative', className)} {...props} />;
}

const SidebarMenuButton = React.forwardRef(({ asChild = false, isActive = false, className, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : 'button';
  if (asChild) {
    return <Comp>{props.children}</Comp>;
  }
  return (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn('peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground', className)}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

function SidebarMenuSub({ className, ...props }) {
  return <ul data-slot="sidebar-menu-sub" className={cn('mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-1', className)} {...props} />;
}

function SidebarMenuSubItem({ className, ...props }) {
  return <li data-slot="sidebar-menu-sub-item" className={cn('group/menu-sub-item relative', className)} {...props} />;
}

const SidebarMenuSubButton = React.forwardRef(({ isActive = false, className, ...props }, ref) => (
  <button
    ref={ref}
    data-slot="sidebar-menu-sub-button"
    data-active={isActive}
    className={cn('flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-xs text-sidebar-foreground/70 outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground', className)}
    {...props}
  />
));
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

function SidebarRail({ className, ...props }) {
  return <button data-slot="sidebar-rail" aria-label="Toggle Sidebar" tabIndex={-1} className={cn('absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all sm:flex', className)} {...props} />;
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
};
