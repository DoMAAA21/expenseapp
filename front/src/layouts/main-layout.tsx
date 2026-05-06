import { useAuth } from '@/contexts/auth-context';
import { sidebarNavItems } from '@/lib/sidebar-config';
import { cn } from '@/lib/utils';
import { LogOut, Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

function matchNavTitle(pathname: string): string {
  const exact = sidebarNavItems.find((item) => item.href === pathname);
  if (exact) return exact.title;
  const prefix = sidebarNavItems
    .filter((item) => item.href !== '/')
    .find((item) => pathname.startsWith(`${item.href}/`) || pathname === item.href);
  return prefix?.title ?? 'Budgetly';
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = useMemo(
    () => matchNavTitle(location.pathname),
    [location.pathname],
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <span className="text-lg font-semibold tracking-tight">Budgetly</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {sidebarNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                )
              }
            >
              <item.icon className="size-5 shrink-0 opacity-90" aria-hidden />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="truncate text-lg font-semibold">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm sm:block">
              <p className="font-medium leading-none">{user?.name ?? 'User'}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
