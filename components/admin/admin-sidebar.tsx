"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CalendarRange, CreditCard, FileText, Home, LifeBuoy, Plane, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function AdminSidebar({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const defaultItems = [
    {
      href: "/admin",
      title: "Dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/bookings",
      title: "Bookings",
      icon: <CalendarRange className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/flights",
      title: "Flights",
      icon: <Plane className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/customers",
      title: "Customers",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/payments",
      title: "Payments",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/reports",
      title: "Reports",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/analytics",
      title: "Analytics",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/settings",
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/support",
      title: "Support",
      icon: <LifeBuoy className="mr-2 h-4 w-4" />,
    },
  ]

  const navItems = items || defaultItems

  return (
    <nav className={cn("flex flex-col space-y-1 border-r bg-background p-4 pt-0 md:w-[240px]", className)} {...props}>
      <div className="py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight hidden md:block">Navigation</h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              asChild
            >
              <Link href={item.href}>
                {item.icon}
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}

