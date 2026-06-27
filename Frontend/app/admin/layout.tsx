"use client";

import { useState } from "react";
import type React from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mode réduit (icônes) sur desktop.
  const [collapsed, setCollapsed] = useState(false);
  // Drawer ouvert sur mobile/tablette.
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute
      allowedRoles={["admin", "editeur", "membre"]}
      checkPagePermissions={true}
    >
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader onOpenSidebar={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-secondary/10 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
