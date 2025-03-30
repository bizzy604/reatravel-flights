import type { Metadata } from "next"
import { DashboardMetrics } from "@/components/admin/dashboard-metrics"
import { RecentBookings } from "@/components/admin/recent-bookings"
import { SystemStatus } from "@/components/admin/system-status"
import { AdminTools } from "@/components/admin/admin-tools"

export const metadata: Metadata = {
  title: "Rea Travel Admin - Dashboard",
  description: "Admin dashboard for Rea Travel flight booking portal",
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of bookings, revenue, and system status</p>
      </div>

      <DashboardMetrics />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-1 lg:col-span-5">
          <RecentBookings />
        </div>
        <div className="md:col-span-1 lg:col-span-2">
          <div className="space-y-6">
            <SystemStatus />
            <AdminTools />
          </div>
        </div>
      </div>
    </div>
  )
}

