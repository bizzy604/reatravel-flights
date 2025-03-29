import type { Metadata } from "next"
import { BookingsTable } from "@/components/admin/bookings-table"
import { BookingsFilter } from "@/components/admin/bookings-filter"

export const metadata: Metadata = {
  title: "SkyWay Admin - Bookings",
  description: "Manage bookings in the SkyWay admin portal",
}

export default function AdminBookingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">View and manage all flight bookings</p>
      </div>

      <BookingsFilter />
      <BookingsTable />
    </div>
  )
}

