'use client';

import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';

/**
 * Main Layout for the authenticated dashboard.
 * Includes the persistent Sidebar and the main content area.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-white overflow-hidden" id="dashboard-root">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-white relative">
        {children}
      </main>
    </div>
  );
}
