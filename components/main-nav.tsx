"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainNav() {
  return (
    <nav className="hidden sm:flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Home
      </Link>
      <Link
        href="/flights"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Flights
      </Link>
      <Link
        href="/flights"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Manage Booking
      </Link>
      <Link
        href="/contact"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Support
      </Link>
    </nav>
  )
}

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="sm:hidden" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:hidden">
        <nav className="flex flex-col space-y-4">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/flights"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Flights
          </Link>
          <Link
            href="/flights"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Manage Booking
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Support
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

