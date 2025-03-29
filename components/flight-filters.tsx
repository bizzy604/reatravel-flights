"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Mock data for airlines
const airlines = [
  { id: "sw", name: "SkyWay Airlines" },
  { id: "ga", name: "Global Airways" },
  { id: "pa", name: "Pacific Air" },
  { id: "ae", name: "Atlantic Express" },
  { id: "ua", name: "United Airlines" },
  { id: "dl", name: "Delta Air Lines" },
]

export function FlightFilters() {
  const [priceRange, setPriceRange] = React.useState([200, 500])
  const [selectedStops, setSelectedStops] = React.useState<string[]>([])
  const [selectedAirlines, setSelectedAirlines] = React.useState<string[]>([])
  const [departureTimeRange, setDepartureTimeRange] = React.useState([0, 24])
  const [arrivalTimeRange, setArrivalTimeRange] = React.useState([0, 24])

  const formatTimeFromHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Stops Filter */}
      <div>
        <h3 className="mb-2 text-sm font-medium">Stops</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stops-direct"
              checked={selectedStops.includes("direct")}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedStops([...selectedStops, "direct"])
                } else {
                  setSelectedStops(selectedStops.filter((stop) => stop !== "direct"))
                }
              }}
            />
            <label
              htmlFor="stops-direct"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Direct flights only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stops-1"
              checked={selectedStops.includes("1-stop")}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedStops([...selectedStops, "1-stop"])
                } else {
                  setSelectedStops(selectedStops.filter((stop) => stop !== "1-stop"))
                }
              }}
            />
            <label
              htmlFor="stops-1"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              1 stop
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stops-2"
              checked={selectedStops.includes("2-stops")}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedStops([...selectedStops, "2-stops"])
                } else {
                  setSelectedStops(selectedStops.filter((stop) => stop !== "2-stops"))
                }
              }}
            />
            <label
              htmlFor="stops-2"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              2+ stops
            </label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Price Range</h3>
          <span className="text-xs text-muted-foreground">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>
        <Slider
          defaultValue={[200, 500]}
          min={100}
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
          className="py-4"
        />
      </div>

      <Separator />

      {/* Departure Time Filter */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-medium">Departure Time</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatTimeFromHours(departureTimeRange[0])} - {formatTimeFromHours(departureTimeRange[1])}
            </span>
          </div>
          <Slider
            defaultValue={[0, 24]}
            min={0}
            max={24}
            step={0.5}
            value={departureTimeRange}
            onValueChange={setDepartureTimeRange}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12 AM</span>
            <span>12 PM</span>
            <span>11:59 PM</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Arrival Time Filter */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-medium">Arrival Time</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatTimeFromHours(arrivalTimeRange[0])} - {formatTimeFromHours(arrivalTimeRange[1])}
            </span>
          </div>
          <Slider
            defaultValue={[0, 24]}
            min={0}
            max={24}
            step={0.5}
            value={arrivalTimeRange}
            onValueChange={setArrivalTimeRange}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12 AM</span>
            <span>12 PM</span>
            <span>11:59 PM</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Airlines Filter */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-medium">Airlines</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            {airlines.map((airline) => (
              <div key={airline.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`airline-${airline.id}`}
                  checked={selectedAirlines.includes(airline.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedAirlines([...selectedAirlines, airline.id])
                    } else {
                      setSelectedAirlines(selectedAirlines.filter((id) => id !== airline.id))
                    }
                  }}
                />
                <label
                  htmlFor={`airline-${airline.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {airline.name}
                </label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <Button className="w-full">Apply Filters</Button>
    </div>
  )
}

