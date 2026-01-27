"use client"

import { useState } from "react"
import type React from "react"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 bg-secondary/10">{children}</main>
      </div>
    </div>
  )
}
