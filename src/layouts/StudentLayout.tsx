import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { StudentSidebar } from '@/components/student/sidebar/StudentSidebar';
import { StudentHeader } from '@/components/student/header/StudentHeader';
import { cn } from '@/utils/cn';

export function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <StudentSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} className="hidden lg:flex" />
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden animate-slide-in-right">
            <StudentSidebar collapsed={false} onToggleCollapse={() => setMobileOpen(false)} />
          </div>
        </>
      )}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <StudentHeader onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className={cn('flex-1 overflow-y-auto')} id="main-content" tabIndex={-1}>
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
            <Outlet />
          </div>
        </main>
        <footer className="shrink-0 border-t border-neutral-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} Axon Nursing Academy. All rights reserved.</p>
            <p className="text-xs text-neutral-400">Student Portal</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
