import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import Header from '../components/layout/Header.jsx';
import PushNotificationSetup from '../components/PushNotificationSetup.jsx';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      {/* Reusable Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden lg:ml-64">
        {/* Reusable Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Nested Scrollable Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Web Push subscription setup (banner + service worker registration) */}
      <PushNotificationSetup />
    </div>
  );
}
