'use client'

import { Suspense, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { FlightFilters } from "@/components/flight-filters"
import { FlightCard } from "@/components/flight-card"
import { FlightSortOptions } from "@/components/flight-sort-options"
import { FlightSearchSummary } from "@/components/flight-search-summary"

// Mock data for flight search results
const mockFlights = [
  {
    id: "fl-001",
    airline: {
      name: "SkyWay Airlines",
      logo: "/placeholder.svg?height=40&width=40",
      code: "SW",
      flightNumber: "1234",
    },
    departure: {
      airport: "JFK",
      city: "New York",
      time: "08:30",
      date: "2025-04-15",
    },
    arrival: {
      airport: "LAX",
      city: "Los Angeles",
      time: "11:45",
      date: "2025-04-15",
    },
    duration: "6h 15m",
    stops: 0,
    price: 299,
    seatsAvailable: 12,
  },
  {
    id: "fl-002",
    airline: {
      name: "Global Airways",
      logo: "/placeholder.svg?height=40&width=40",
      code: "GA",
      flightNumber: "4567",
    },
    departure: {
      airport: "JFK",
      city: "New York",
      time: "10:15",
      date: "2025-04-15",
    },
    arrival: {
      airport: "LAX",
      city: "Los Angeles",
      time: "14:30",
      date: "2025-04-15",
    },
    duration: "7h 15m",
    stops: 1,
    stopDetails: [
      {
        airport: "DFW",
        city: "Dallas",
        duration: "1h 30m",
      },
    ],
    price: 249,
    seatsAvailable: 8,
  },
  {
    id: "fl-003",
    airline: {
      name: "Pacific Air",
      logo: "/placeholder.svg?height=40&width=40",
      code: "PA",
      flightNumber: "7890",
    },
    departure: {
      airport: "JFK",
      city: "New York",
      time: "14:45",
      date: "2025-04-15",
    },
    arrival: {
      airport: "LAX",
      city: "Los Angeles",
      time: "18:00",
      date: "2025-04-15",
    },
    duration: "6h 15m",
    stops: 0,
    price: 329,
    seatsAvailable: 5,
  },
  {
    id: "fl-004",
    airline: {
      name: "Atlantic Express",
      logo: "/placeholder.svg?height=40&width=40",
      code: "AE",
      flightNumber: "5432",
    },
    departure: {
      airport: "JFK",
      city: "New York",
      time: "16:30",
      date: "2025-04-15",
    },
    arrival: {
      airport: "LAX",
      city: "Los Angeles",
      time: "22:15",
      date: "2025-04-15",
    },
    duration: "8h 45m",
    stops: 1,
    stopDetails: [
      {
        airport: "ORD",
        city: "Chicago",
        duration: "2h 15m",
      },
    ],
    price: 219,
    seatsAvailable: 15,
  },
  {
    id: "fl-005",
    airline: {
      name: "SkyWay Airlines",
      logo: "/placeholder.svg?height=40&width=40",
      code: "SW",
      flightNumber: "2468",
    },
    departure: {
      airport: "JFK",
      city: "New York",
      time: "19:15",
      date: "2025-04-15",
    },
    arrival: {
      airport: "LAX",
      city: "Los Angeles",
      time: "22:30",
      date: "2025-04-15",
    },
    duration: "6h 15m",
    stops: 0,
    price: 349,
    seatsAvailable: 3,
  },
  {
    id: "fl-006",
    airline: {
      name: "Global Airways",
      logo: "/placeholder.svg?height=40&width=40",
      code: "GA",
      flightNumber: "9876",
    },
    departure: {
      airport: "JFK",
      city: "New York",
      time: "21:45",
      date: "2025-04-15",
    },
    arrival: {
      airport: "LAX",
      city: "Los Angeles",
      time: "01:00",
      date: "2025-04-16",
    },
    duration: "6h 15m",
    stops: 0,
    price: 279,
    seatsAvailable: 10,
  },
]

interface FlightFiltersState {
  priceRange: [number, number]
  airlines: string[]
  stops: number[]
  departureTime: string[]
}

const initialFilters: FlightFiltersState = {
  priceRange: [0, 1000],
  airlines: [],
  stops: [],
  departureTime: []
}

export default function FlightsPage() {
  const [filters, setFilters] = useState<FlightFiltersState>(initialFilters)
  const [sortOption, setSortOption] = useState('price_low')

  const handleFilterChange = (newFilters: Partial<FlightFiltersState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo1.png" alt="Rea Travel Logo" width={32} height={32} />
            <span className="text-xl font-bold">Rea Travel</span>
          </div>
          <MainNav />
          <UserNav />
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Home
            </Link>

            <Suspense fallback={<Skeleton className="h-8 w-full max-w-md" />}>
              <FlightSearchSummary
                origin="New York (JFK)"
                destination="Los Angeles (LAX)"
                departDate="Apr 15, 2025"
                returnDate="Apr 22, 2025"
                passengers={1}
              />
            </Suspense>
          </div>

          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            {/* Filters Sidebar */}
            <div className="hidden md:block">
              <div className="sticky top-24 rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs"
                    onClick={handleResetFilters}
                  >
                    Reset All
                  </Button>
                </div>
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  }
                >
                  <FlightFilters 
                    filters={filters}
                    onChange={handleFilterChange}
                  />
                </Suspense>
              </div>
            </div>

            {/* Mobile Filters Button */}
            <div className="flex items-center justify-between md:hidden">
              <Button variant="outline" size="sm" className="mb-4">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <FlightSortOptions />
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="hidden items-center justify-between md:flex">
                <p className="text-sm text-muted-foreground">
                  Showing <strong>6</strong> of <strong>24</strong> flights
                </p>
                <FlightSortOptions />
              </div>

              <Suspense
                fallback={
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full rounded-lg" />
                    ))}
                  </div>
                }
              >
                <div className="space-y-4">
                  {mockFlights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
                </div>
              </Suspense>

              {/* Pagination */}
              <div className="flex items-center justify-center space-x-2 py-4">
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  2
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  3
                </Button>
                <span className="text-sm text-muted-foreground">...</span>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  8
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

