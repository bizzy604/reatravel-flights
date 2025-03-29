"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, LogOut, Menu, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function AdminHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="font-bold">
          SkyWay Admin
        </Link>
      </div>

      <div className="hidden md:flex md:items-center md:gap-2">
        <Link href="/admin" className="font-bold">
          SkyWay Admin
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/admin"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/admin" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/bookings"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/admin/bookings" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Bookings
          </Link>
          <Link
            href="/admin/settings"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/admin/settings" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Settings
          </Link>
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin User</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

