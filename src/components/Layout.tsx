import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile header with hamburger menu */}
        <div className="lg:hidden sticky top-0 z-30 bg-zinc-950 border-b border-zinc-800 px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
