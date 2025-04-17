'use client'

import { Suspense, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { FlightFilters } from "@/components/flight-filters"
import { FlightCard } from "@/components/flight-card"
import { FlightSortOptions } from "@/components/flight-sort-options"
import { FlightSearchSummary } from "@/components/flight-search-summary"

// Define interfaces for flight data types
interface StopDetail {
  airport: string
  city: string
  duration: string
}

// Helper functions for formatting display data
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getAirportCity(code: string): string {
  const airports = {
    'JFK': 'New York',
    'LAX': 'Los Angeles',
    'CDG': 'Paris',
    'LHR': 'London',
    'HND': 'Tokyo',
    'DXB': 'Dubai',
    'SYD': 'Sydney',
    'YYZ': 'Toronto',
    'YUL': 'Montreal',
    'MUC': 'Munich',
    'FRA': 'Frankfurt',
    'ZRH': 'Zurich'
  };
  return airports[code as keyof typeof airports] || code;
}

// This interface matches the FlightCard component's expectations
interface Flight {
  id: string
  airline: {
    name: string
    logo: string
    code: string
    flightNumber: string
  }
  departure: {
    airport: string
    city: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    city: string
    time: string
    date: string
  }
  duration: string
  stops: number
  stopDetails?: StopDetail[]
  price: number
  seatsAvailable: number
}

// This interface matches the API response format
interface ApiFlightResponse {
  id: string
  airline: {
    name: string
    logo: string
    code: string
    flightNumber: string
  }
  departure: {
    airport: string
    city: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    city: string
    time: string
    date: string
  }
  duration: string
  stops: number
  stopDetails?: string[]
  price: number
  seatsAvailable: number
}

interface FlightFiltersState {
  priceRange: [number, number]
  airlines: string[]
  stops: number[]
  departureTime: string[]
}

const initialFilters: FlightFiltersState = {
  priceRange: [0, 100000], // Increased to accommodate higher price ranges in real data
  airlines: [],
  stops: [],
  departureTime: []
}

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [allFlights, setAllFlights] = useState<Flight[]>([])
  const [filters, setFilters] = useState<FlightFiltersState>(initialFilters)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const [sortOption, setSortOption] = useState('price_low')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleFilterChange = (newFilters: Partial<FlightFiltersState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }

  function handleResetFilters() {
    setFilters(initialFilters)
  }
  
  // Apply filters and pagination to flight data
  useEffect(() => {
    if (allFlights.length === 0) {
      console.log('No flights available to filter');
      return;
    }
    
    console.log('Current filters:', filters);
    console.log('Available flights:', allFlights.length);
    
    // First apply filters
    const filteredFlights = allFlights.filter(flight => {
      // Only apply price filter if it's been explicitly set (not the default values)
      const usingDefaultPriceRange = 
        filters.priceRange[0] === initialFilters.priceRange[0] && 
        filters.priceRange[1] === initialFilters.priceRange[1];
      
      if (!usingDefaultPriceRange && 
          (flight.price < filters.priceRange[0] || flight.price > filters.priceRange[1])) {
        return false;
      }
      
      // Airlines filter - only apply if airlines are selected
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline.name)) {
        return false;
      }
      
      // Stops filter - only apply if stops are selected
      if (filters.stops.length > 0 && !filters.stops.includes(flight.stops)) {
        return false;
      }
      
      // Departure time filter (would need to parse the time and check against time ranges)
      
      return true;
    });
    
    console.log('Filtered flights:', filteredFlights.length);
    
    // Apply sorting
    const sortedFlights = [...filteredFlights].sort((a, b) => {
      if (sortOption === 'price_low') {
        return a.price - b.price;
      } else if (sortOption === 'price_high') {
        return b.price - a.price;
      } else if (sortOption === 'duration_short') {
        // Would need to parse duration for proper comparison
        return a.duration.localeCompare(b.duration);
      }
      return 0;
    });
    
    // Calculate pagination offsets
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    // Set the paginated flights
    const paginatedFlights = sortedFlights.slice(startIdx, endIdx);
    console.log('Setting paginated flights:', paginatedFlights.length, 'displayed out of', sortedFlights.length);
    setFlights(paginatedFlights);
  }, [allFlights, filters.priceRange, filters.airlines, filters.stops, filters.departureTime, sortOption, currentPage]);

  // Load flight data from sessionStorage or API
  useEffect(() => {
    console.log('Loading flight data...');
    // Reset pagination when loading new data
    setCurrentPage(1);
    setLoading(true);
    
    // Check if we have flight data in sessionStorage
    const storedFlights = sessionStorage.getItem('flightSearchResults')
    console.log('Stored flights found:', !!storedFlights);
    
    // Get actual search parameters
    const origin = searchParams.get('origin') || 'LHR';
    const destination = searchParams.get('destination') || 'BOM';
    const departDate = searchParams.get('departDate') || '2025-04-23';
    const returnDate = searchParams.get('returnDate') || '';
    const passengers = Number(searchParams.get('passengers')) || 1;
    const cabinClass = searchParams.get('cabinClass') || 'Y';

    // Log search parameters
    console.log('Search params:', { origin, destination, departDate, returnDate, passengers, cabinClass });
    
    if (storedFlights) {
      try {
        const parsedFlights = JSON.parse(storedFlights)
        setAllFlights(parsedFlights)
        setLoading(false)
      } catch (error) {
        console.error('Error parsing stored flight data:', error)
        fetchFlightData();
      }
    } else {
      // Define function to fetch flight data from API
      fetchFlightData();
    }
    
    // Helper function to fetch flight data from API
    async function fetchFlightData() {
      try {
        const response = await fetch('/api/flights/search-advanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            origin,
            destination,
            departDate,
            returnDate,
            passengers,
            cabinClass
          })
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.flights && data.flights.length > 0) {
          setAllFlights(data.flights);
          // Store minimal data in session storage to prevent memory issues
          try {
            const minimalData = data.flights.map((flight: any) => ({
              id: flight.id,
              price: flight.price,
              airline: { name: flight.airline.name, code: flight.airline.code },
              departure: { airport: flight.departure.airport },
              arrival: { airport: flight.arrival.airport },
              stops: flight.stops
            }));
            sessionStorage.setItem('flightSearchResults', JSON.stringify(minimalData));
          } catch (error) {
            console.error('Error storing flight data:', error);
          }
        } else {
          console.log('No flights found in API response, using sample data');
          // Use sample data
          const sampleFlightData: ApiFlightResponse[] = [
        {
          "id": "XA3D7518-301B-4BE0-B3A-1",
          "airline": {
            "name": "Air Canada",
            "logo": "/airlines/ac.png",
            "code": "AC",
            "flightNumber": "8899"
          },
          "departure": {
            "airport": "JFK",
            "city": "New York",
            "time": "09:00",
            "date": "2025-04-20T00:00:00.000"
          },
          "arrival": {
            "airport": "CDG",
            "city": "Paris",
            "time": "06:50",
            "date": "2025-04-21T00:00:00.000"
          },
          "duration": "8h 34m",
          "stops": 1,
          "stopDetails": [
            "YUL",
            "YUL"
          ],
          "price": 49147,
          "seatsAvailable": 0
        },
        {
          "id": "XA3D7518-301B-4BE0-B3A-3",
          "airline": {
            "name": "Air Canada",
            "logo": "/airlines/ac.png",
            "code": "AC",
            "flightNumber": "8553"
          },
          "departure": {
            "airport": "JFK",
            "city": "New York",
            "time": "10:30",
            "date": "2025-04-20T00:00:00.000"
          },
          "arrival": {
            "airport": "CDG",
            "city": "Paris",
            "time": "10:10",
            "date": "2025-04-21T00:00:00.000"
          },
          "duration": "9h 15m",
          "stops": 1,
          "stopDetails": [
            "YYZ",
            "YYZ"
          ],
          "price": 49709,
          "seatsAvailable": 0
        },
        {
          "id": "XA3D7518-301B-4BE0-B3A-5",
          "airline": {
            "name": "Air Canada",
            "logo": "/airlines/ac.png",
            "code": "AC",
            "flightNumber": "8555"
          },
          "departure": {
            "airport": "JFK",
            "city": "New York",
            "time": "15:40",
            "date": "2025-04-20T00:00:00.000"
          },
          "arrival": {
            "airport": "CDG",
            "city": "Paris",
            "time": "10:10",
            "date": "2025-04-21T00:00:00.000"
          },
          "duration": "9h 15m",
          "stops": 1,
          "stopDetails": [
            "YYZ",
            "YYZ"
          ],
          "price": 49709,
          "seatsAvailable": 0
        }
      ]
      
      // Transform API response to the format expected by the UI
      const formattedFlights: Flight[] = sampleFlightData.map(flight => {
        const transformedFlight: Flight = {
          ...flight,
          stopDetails: flight.stopDetails ? flight.stopDetails.map(airport => ({
            airport,
            city: airport, // Using airport code as city since we don't have city info
            duration: 'N/A' // We don't have duration info
          })) : undefined
        };
        return transformedFlight;
      });
      
      // Set both allFlights and flights to ensure data is available
      setAllFlights(formattedFlights)
      setFlights(formattedFlights.slice(0, itemsPerPage)) // Set the first page of flights directly
          console.log('Sample flight data loaded:', formattedFlights.length, 'flights');
          setAllFlights(formattedFlights);
        }
      } catch (error) {
        console.error('Error fetching flight data:', error);
        // Fallback to sample data if API fails
        loadSampleData();
      }
    }
    
    // Helper function to load sample data
    function loadSampleData() {
      const sampleFlightData: ApiFlightResponse[] = [
        {
          "id": "SAMPLE-001",
          "airline": {
            "name": "Rea Airlines",
            "logo": "/logo1.png",
            "code": "RA",
            "flightNumber": "101"
          },
          "departure": {
            "airport": "LHR",
            "city": "London",
            "time": "10:00",
            "date": "2025-04-23T00:00:00.000"
          },
          "arrival": {
            "airport": "BOM",
            "city": "Mumbai",
            "time": "23:00",
            "date": "2025-04-23T00:00:00.000"
          },
          "duration": "13h 00m",
          "stops": 0,
          "stopDetails": [],
          "price": 50000,
          "seatsAvailable": 10
        }
      ];
      
      const formattedFlights = sampleFlightData.map(flight => {
        return {
          ...flight,
          stopDetails: flight.stopDetails ? flight.stopDetails.map(airport => ({
            airport,
            city: airport,
            duration: 'N/A'
          })) : undefined
        };
      });
      
      setAllFlights(formattedFlights);
      setLoading(false);
      console.log('Sample flight data loaded:', formattedFlights.length, 'flights')
    }
    
    setLoading(false)
  }, [])

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
                origin={`${getAirportCity(searchParams.get('origin') || 'JFK')} (${searchParams.get('origin') || 'JFK'})`}
                destination={`${getAirportCity(searchParams.get('destination') || 'CDG')} (${searchParams.get('destination') || 'CDG'})`}
                departDate={formatDate(searchParams.get('departDate') ?? '2025-04-20')}
                returnDate={searchParams.get('returnDate') ? formatDate(searchParams.get('returnDate') ?? '') : undefined}
                passengers={Number(searchParams.get('passengers')) || 1}
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
                    priceRange={filters.priceRange}
                    onPriceRangeChange={(range) => handleFilterChange({ priceRange: range })}
                    airlines={filters.airlines}
                    onAirlinesChange={(airlines) => handleFilterChange({ airlines })}
                    stops={filters.stops}
                    onStopsChange={(stops) => handleFilterChange({ stops })}
                    departureTime={filters.departureTime}
                    onDepartureTimeChange={(departureTime) => handleFilterChange({ departureTime })}
                    onResetFilters={handleResetFilters}
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
                  Showing <strong>{flights.length}</strong> of <strong>{allFlights.length}</strong> flights
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
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : flights.length > 0 ? (
                    flights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))
                  ) : (
                    <div className="rounded-lg border p-8 text-center">
                      <h3 className="mb-2 text-lg font-semibold">No flights found</h3>
                      <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </Suspense>

              {/* Pagination */}
              <div className="flex items-center justify-center space-x-2 py-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                
                {/* Generate page buttons */}
                {Array.from({ length: Math.min(3, Math.ceil(allFlights.length / itemsPerPage)) }, (_, i) => (
                  <Button 
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                {Math.ceil(allFlights.length / itemsPerPage) > 3 && (
                  <>
                    <span className="text-sm text-muted-foreground">...</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(Math.ceil(allFlights.length / itemsPerPage))}
                    >
                      {Math.ceil(allFlights.length / itemsPerPage)}
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={currentPage >= Math.ceil(allFlights.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(allFlights.length / itemsPerPage), prev + 1))}
                >
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

