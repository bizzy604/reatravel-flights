"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function FlightSearchForm() {
  const [departDate, setDepartDate] = React.useState<Date>()
  const [returnDate, setReturnDate] = React.useState<Date>()

  // Mock data for autocomplete
  const airports = [
    { code: "JFK", name: "John F. Kennedy International Airport", city: "New York" },
    { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles" },
    { code: "LHR", name: "Heathrow Airport", city: "London" },
    { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris" },
    { code: "HND", name: "Haneda Airport", city: "Tokyo" },
  ]

  return (
    <div className="w-full px-2 sm:px-0">
      <Tabs defaultValue="round-trip" className="w-full">
        <TabsList className="grid w-full grid-cols-3 overflow-x-auto sm:grid-cols-3">
          <TabsTrigger value="round-trip" className="text-xs sm:text-sm">Round Trip</TabsTrigger>
          <TabsTrigger value="one-way" className="text-xs sm:text-sm">One Way</TabsTrigger>
          <TabsTrigger value="multi-city" className="text-xs sm:text-sm">Multi-City</TabsTrigger>
        </TabsList>
        <TabsContent value="round-trip" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {/* From */}
            <div className="relative w-full sm:col-span-1">
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <select className="w-full bg-transparent outline-none">
                  <option value="">From</option>
                  {airports.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.city} ({airport.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* To */}
            <div className="relative w-full sm:col-span-1">
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <select className="w-full bg-transparent outline-none">
                  <option value="">To</option>
                  {airports.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.city} ({airport.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Depart Date */}
            <div className="w-full sm:col-span-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !departDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departDate ? format(departDate, "PPP") : <span>Depart Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={departDate} onSelect={setDepartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Return Date */}
            <div className="w-full sm:col-span-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP") : <span>Return Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Passengers */}
            <div className="w-full sm:col-span-1">
              <Select>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Passengers" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Passenger</SelectItem>
                  <SelectItem value="2">2 Passengers</SelectItem>
                  <SelectItem value="3">3 Passengers</SelectItem>
                  <SelectItem value="4">4 Passengers</SelectItem>
                  <SelectItem value="5">5+ Passengers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Button className="px-8">Search Flights</Button>
          </div>
        </TabsContent>

        <TabsContent value="one-way" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {/* From */}
            <div className="relative w-full sm:col-span-1">
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <select className="w-full bg-transparent outline-none">
                  <option value="">From</option>
                  {airports.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.city} ({airport.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* To */}
            <div className="relative w-full sm:col-span-1">
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <select className="w-full bg-transparent outline-none">
                  <option value="">To</option>
                  {airports.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.city} ({airport.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Depart Date */}
            <div className="w-full sm:col-span-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !departDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departDate ? format(departDate, "PPP") : <span>Depart Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={departDate} onSelect={setDepartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Passengers */}
            <div className="w-full sm:col-span-1">
              <Select>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Passengers" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Passenger</SelectItem>
                  <SelectItem value="2">2 Passengers</SelectItem>
                  <SelectItem value="3">3 Passengers</SelectItem>
                  <SelectItem value="4">4 Passengers</SelectItem>
                  <SelectItem value="5">5+ Passengers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Button className="px-8">Search Flights</Button>
          </div>
        </TabsContent>

        <TabsContent value="multi-city" className="mt-4">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {/* From */}
              <div className="relative w-full sm:col-span-1">
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <select className="w-full bg-transparent outline-none">
                    <option value="">From</option>
                    {airports.map((airport) => (
                      <option key={airport.code} value={airport.code}>
                        {airport.city} ({airport.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* To */}
              <div className="relative w-full sm:col-span-1">
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <select className="w-full bg-transparent outline-none">
                    <option value="">To</option>
                    {airports.map((airport) => (
                      <option key={airport.code} value={airport.code}>
                        {airport.city} ({airport.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Depart Date */}
              <div className="w-full sm:col-span-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !departDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departDate ? format(departDate, "PPP") : <span>Depart Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={departDate} onSelect={setDepartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Passengers */}
              <div className="w-full sm:col-span-1">
                <Select>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Passengers" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Passenger</SelectItem>
                    <SelectItem value="2">2 Passengers</SelectItem>
                    <SelectItem value="3">3 Passengers</SelectItem>
                    <SelectItem value="4">4 Passengers</SelectItem>
                    <SelectItem value="5">5+ Passengers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {/* From */}
              <div className="relative w-full sm:col-span-1">
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <select className="w-full bg-transparent outline-none">
                    <option value="">From</option>
                    {airports.map((airport) => (
                      <option key={airport.code} value={airport.code}>
                        {airport.city} ({airport.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* To */}
              <div className="relative w-full sm:col-span-1">
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <select className="w-full bg-transparent outline-none">
                    <option value="">To</option>
                    {airports.map((airport) => (
                      <option key={airport.code} value={airport.code}>
                        {airport.city} ({airport.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Depart Date */}
              <div className="w-full sm:col-span-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !returnDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, "PPP") : <span>Depart Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-full sm:col-span-1">
                <Button variant="outline" className="w-full">
                  + Add Another Flight
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Button className="px-8">Search Flights</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

