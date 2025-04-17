"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { callVerteilAirShopping } from "@/lib/flight-api"
import type { FlightSearchRequest } from "../types/flight-api";
import { FlightCard } from "@/components/flight-card"
import { Skeleton } from "@/components/ui/skeleton"

// Constants moved outside the component
const cabinTypes = [
  { value: "Y", label: "Economy" },
  { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First Class" },
]

const airports = [
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles" },
  { code: "LHR", name: "Heathrow Airport", city: "London" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris" },
  { code: "HND", name: "Haneda Airport", city: "Tokyo" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai" },
]

// Helper function to get city from airport code
function getCity(code: string): string {
  const airport = airports.find((a) => a.code === code)
  return airport ? airport.city : code
}

// Helper function to parse ISO 8601 duration strings (e.g., "PT7H55M") into minutes
function parseISODuration(durationString: string): number {
  if (!durationString || !durationString.startsWith('PT')) {
    return 0;
  }
  let totalMinutes = 0;
  const timeString = durationString.substring(2); // Remove "PT"

  const hourMatch = timeString.match(/(\d+)H/);
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }

  const minuteMatch = timeString.match(/(\d+)M/);
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }

  return totalMinutes;
}

export function FlightSearchForm() {
  const [departDate, setDepartDate] = React.useState<Date>()
  const [returnDate, setReturnDate] = React.useState<Date>()
  const [origin, setOrigin] = React.useState("")
  const [destination, setDestination] = React.useState("")
  const [passengers, setPassengers] = React.useState(1)
  const [cabinType, setCabinType] = React.useState("Y")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<any>(null)
  const [rawApiResponse, setRawApiResponse] = React.useState<any>(null)
  const [showRawApi, setShowRawApi] = React.useState(false)

  // Handlers for select changes
  const handleOriginChange = (value: string) => setOrigin(value) // Updated for Shadcn Select
  const handleDestinationChange = (value: string) => setDestination(value) // Updated for Shadcn Select
  const handlePassengersChange = (value: string) => setPassengers(Number(value))
  const handleCabinTypeChange = (value: string) => setCabinType(value)

  // Reusable function to render From, To, Depart, Return inputs
  const renderFlightLegInputs = (showReturnDate: boolean, keyPrefix: string = 'leg') => {
    return (
      <div className={`grid gap-4 sm:grid-cols-2 ${showReturnDate ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}> {/* Adjust grid cols based on return date */} 
        {/* From */}
        <div className="w-full sm:col-span-1">
          <Select onValueChange={handleOriginChange} value={origin}>
            <SelectTrigger>
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              {airports.map((airport) => (
                <SelectItem key={`${keyPrefix}-from-${airport.code}`} value={airport.code}>
                  {airport.city} ({airport.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* To */}
        <div className="w-full sm:col-span-1">
          <Select onValueChange={handleDestinationChange} value={destination}>
            <SelectTrigger>
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              {airports.map((airport) => (
                <SelectItem key={`${keyPrefix}-to-${airport.code}`} value={airport.code}>
                  {airport.city} ({airport.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Return Date (Conditional) */}
        {showReturnDate && (
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
                  {returnDate ? format(returnDate, "PPP") : <span>Return Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    );
  }

  // Build and submit the advanced search request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResults(null)
    setLoading(true)
    
    // Validate required fields
    if (!origin || !destination || !departDate) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }
    
    try {
      // Build payload dynamically from form inputs
      const payload: FlightSearchRequest = {
        Preference: {
          CabinPreferences: {
            CabinType: [
              {
                PrefLevel: { PrefLevelCode: "Preferred" },
                OriginDestinationReferences: ["OD1"],
                Code: cabinType, // Dynamic cabin type from user selection
              },
            ],
          },
          FarePreferences: {
            Types: {
              Type: [{ Code: "PUBL" }],
            },
          },
          PricingMethodPreference: {
            BestPricingOption: "Y",
          },
        },
        ResponseParameters: {
          ResultsLimit: { value: 10 },
          SortOrder: [
            { Order: "ASCENDING", Parameter: "PRICE" },
            { Order: "ASCENDING", Parameter: "STOP" },
            { Order: "ASCENDING", Parameter: "DEPARTURE_TIME" },
          ],
          ShopResultPreference: "FULL",
        },
        Travelers: {
          Traveler: [
            {
              AnonymousTraveler: Array.from({ length: passengers }, () => ({
                PTC: { value: "ADT" }, // Could be made dynamic with passenger type selector
                Age: {
                  Value: { value: 30 }, // Could be made dynamic with age input
                  BirthDate: { value: "1995-01-01" }, // Could be made dynamic with DOB picker
                },
              })),
            },
          ],
        },
        CoreQuery: {
          OriginDestinations: {
            OriginDestination: [
              {
                Departure: {
                  AirportCode: { value: origin },
                  Date: departDate.toISOString().split('T')[0],
                },
                Arrival: {
                  AirportCode: { value: destination },
                },
                OriginDestinationKey: "OD1",
              },
              // If return date is selected, add a return flight
              ...(returnDate ? [
                {
                  Departure: {
                    AirportCode: { value: destination },
                    Date: returnDate.toISOString().slice(0, 10),
                  },
                  Arrival: {
                    AirportCode: { value: origin },
                  },
                  OriginDestinationKey: "OD2",
                }
              ] : []),
            ],
          },
        },
      }
      console.log("Sending search request", payload)
      
      const response = await fetch(`${window.location.origin}/api/flights/search-advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Search failed:', response.status, errorData);
        throw new Error(errorData.message || `Search failed: ${response.statusText}`);
      }
      
      const data = await response.json()
      setRawApiResponse(data)
      console.log("Raw API response:", data)
      
      // The API might return data in different structures, so we need to handle all possibilities
      console.log("Full API response structure:", Object.keys(data));
      
      // First, check if we have the raw data structure
      const rawData = data?.raw;
      
      // Get DataLists from the raw data
      const dataLists = rawData?.DataLists || data?.DataLists || {};
      console.log("DataLists found:", dataLists ? Object.keys(dataLists) : 'None');
      
      // Get flight segments
      const flightSegmentList: any[] = dataLists?.FlightSegmentList?.FlightSegment || [];
      console.log("Flight segments found:", flightSegmentList.length);
      
      // Get offers from the raw data
      const offersGroup = rawData?.OffersGroup;
      const airlineOffers = offersGroup?.AirlineOffers || [];
      const airlineOffer = airlineOffers[0]?.AirlineOffer || [];
      console.log("Airline offers found:", airlineOffer.length);
      
      // Pre-process lists into maps for faster lookups
      const flightSegmentMap = new Map(flightSegmentList.map((seg: any) => [seg.SegmentKey, seg]));
      
      // Also map flight references
      const flightList = dataLists?.FlightList?.Flight || [];
      const flightMap = new Map(flightList.map((flight: any) => [flight.FlightKey, flight]));
      console.log("Flights found:", flightList.length);
      
      if (airlineOffer.length === 0) {
        console.warn("No AirlineOffers found in the response.");
        setResults([]);
        setError("No flights found for your search criteria. Please try different dates or airports.");
        return;
      }
      
      // Use the raw data directly since the API's optimizeFlightData function is failing
 
      const formattedResults = airlineOffer.map((offer: any) => {
        const offerId = offer.OfferID?.value || `offer-${Math.random().toString(36).substr(2, 9)}`;
        const price = offer.TotalPrice?.SimpleCurrencyPrice?.value || 0;

        // Find associated flight segment references for this offer
        let segmentRefs: string[] = [];
        let flightKey: string = '';
        
        // First, try to get the flight reference
        if (offer.PricedOffer?.Associations) {
          const associations = Array.isArray(offer.PricedOffer.Associations) 
            ? offer.PricedOffer.Associations 
            : [offer.PricedOffer.Associations];
            
          for (const assoc of associations) {
            // Get flight reference first
            if (assoc.ApplicableFlight?.FlightReferences?.value) {
              const flightRefs = Array.isArray(assoc.ApplicableFlight.FlightReferences.value)
                ? assoc.ApplicableFlight.FlightReferences.value
                : [assoc.ApplicableFlight.FlightReferences.value];
                
              flightKey = flightRefs[0]; // Take the first flight reference
              console.log(`Found flight key for offer ${offerId}:`, flightKey);
            }
            
            // Then get segment references
            if (assoc.ApplicableFlight?.FlightSegmentReference) {
              const refs = Array.isArray(assoc.ApplicableFlight.FlightSegmentReference)
                ? assoc.ApplicableFlight.FlightSegmentReference
                : [assoc.ApplicableFlight.FlightSegmentReference];
                
              segmentRefs = [...segmentRefs, ...refs.map((ref: any) => ref.ref || ref)];
            }
          }
        }
        
        // If we have a flight key but no segment refs, try to get segment refs from the flight
        if (flightKey && segmentRefs.length === 0) {
          const flight = flightMap.get(flightKey);
          // Use optional chaining and type assertion to safely access properties
          const flightObj = flight as Record<string, any>;
          if (flightObj?.SegmentReferences?.value) {
            const segmentRefsValue = flightObj.SegmentReferences.value;
            segmentRefs = Array.isArray(segmentRefsValue)
              ? segmentRefsValue
              : [segmentRefsValue];
          }
        }
        
        console.log(`Extracted segment refs for offer ${offerId}:`, segmentRefs);

        // Lookup the actual segments
        const segments = segmentRefs
          .map((ref: string) => flightSegmentMap.get(ref))
          .filter((seg: any) => !!seg); // Filter out nulls if ref not found
          
        console.log(`Found ${segments.length} segments for offer ${offerId}:`, segments);

        let airlineInfo = { name: 'Airline N/A', logo: '/placeholder.svg', code: 'XX', flightNumber: '000' };
        let departureInfo = { airport: origin, city: getCity(origin), time: '00:00', date: departDate?.toISOString().split('T')[0] || 'N/A' };
        let arrivalInfo = { airport: destination, city: getCity(destination), time: '00:00', date: 'N/A' };
        let totalDuration = "N/A"; // Default value
        let stops = 0;
        // Declare stop details array outside the if block so it's accessible in the return statement
        const currentStopDetails: string[] = [];

        if (segments.length > 0) {
          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1];
          stops = segments.length - 1; // Calculate stops

          // Calculate Total Duration
          let totalMinutes = 0;
          segments.forEach((seg: any) => {
            const durationStr = seg?.FlightDetail?.FlightDuration?.Value;
            if (durationStr) {
              totalMinutes += parseISODuration(durationStr);
            }
          });

          if (totalMinutes > 0) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            totalDuration = `${hours}h ${minutes}m`; // Format as Xh Ym
          }
          
          console.log('Processing segments:', segments);
          console.log('First segment:', firstSegment);
          console.log('Last segment:', lastSegment);

          // Extract stop details for connecting airports
          if (stops > 0) {
            // Add connecting airport codes to stopDetails
            for (let i = 0; i < segments.length - 1; i++) {
              let connectingAirport = null;
              
              // Try different paths to extract airport code
              if (segments[i].Arrival?.AirportCode?.value) {
                connectingAirport = segments[i].Arrival.AirportCode.value;
              } else if (segments[i].Arrival?.AirportCode) {
                connectingAirport = segments[i].Arrival.AirportCode;
              }
              
              if (connectingAirport) {
                currentStopDetails.push(connectingAirport);
              }
            }
            
            console.log(`Stop details for offer ${offerId}:`, currentStopDetails);
          }

          // Extract airline info from first segment - handle different API structures
          console.log('First segment:', firstSegment);
          
          // Try different paths to extract airline code
          let airlineCode = 'XX';
          if (firstSegment.MarketingCarrier?.AirlineID?.value) {
            airlineCode = firstSegment.MarketingCarrier.AirlineID.value;
          } else if (firstSegment.MarketingCarrier?.AirlineID) {
            airlineCode = firstSegment.MarketingCarrier.AirlineID;
          }
          
          const nameFromSegment = firstSegment.MarketingCarrier?.Name;
          const airlineName = nameFromSegment || `Airline ${airlineCode}`;

          // Get flight number - try different paths
          let flightNumber = '000';
          if (firstSegment.MarketingCarrier?.FlightNumber?.value) {
            flightNumber = firstSegment.MarketingCarrier.FlightNumber.value;
          } else if (firstSegment.MarketingCarrier?.FlightNumber) {
            flightNumber = firstSegment.MarketingCarrier.FlightNumber;
          }

          airlineInfo = {
            name: airlineName,
            logo: `/airlines/${airlineCode.toLowerCase()}.png`,
            code: airlineCode,
            flightNumber: flightNumber,
          };

          // Extract Departure Info from first segment - handle different API structures
          let departureAirportCode = origin;
          if (firstSegment.Departure?.AirportCode?.value) {
            departureAirportCode = firstSegment.Departure.AirportCode.value;
          } else if (firstSegment.Departure?.AirportCode) {
            departureAirportCode = firstSegment.Departure.AirportCode;
          }
          
          const departureTime = firstSegment.Departure?.Time || '00:00';
          const departureDate = firstSegment.Departure?.Date || departDate?.toISOString().split('T')[0] || 'N/A';
          
          departureInfo = {
            airport: departureAirportCode,
            city: getCity(departureAirportCode),
            time: departureTime.substring(0, 5), // HH:MM format
            date: departureDate,
          };

          // Extract Arrival Info from last segment - handle different API structures
          let arrivalAirportCode = destination;
          if (lastSegment.Arrival?.AirportCode?.value) {
            arrivalAirportCode = lastSegment.Arrival.AirportCode.value;
          } else if (lastSegment.Arrival?.AirportCode) {
            arrivalAirportCode = lastSegment.Arrival.AirportCode;
          }
          
          const arrivalTime = lastSegment.Arrival?.Time || '00:00';
          const arrivalDate = lastSegment.Arrival?.Date || 'N/A';
          
          arrivalInfo = {
            airport: arrivalAirportCode,
            city: getCity(arrivalAirportCode),
            time: arrivalTime.substring(0, 5), // HH:MM format
            date: arrivalDate,
          };
          
          // If we have a flight key, try to get journey information
          if (flightKey) {
            const flight = flightMap.get(flightKey);
            // Use optional chaining and type assertion to safely access properties
            const flightObj = flight as Record<string, any>;
            if (flightObj?.Journey?.Time && typeof flightObj.Journey.Time === 'string') {
              // Override the calculated duration with the one from the flight
              totalDuration = flightObj.Journey.Time.replace('PT', '').replace('H', 'h ').replace('M', 'm');
            }
          }
        };

        // Format the price as a number
        const numericPrice = parseInt(price, 10) || 0;
        
        return {
          id: offerId,
          airline: airlineInfo,
          departure: departureInfo,
          arrival: arrivalInfo,
          duration: totalDuration,
          stops: stops,
          stopDetails: currentStopDetails, // Use extracted stop airport codes
          price: numericPrice,
          seatsAvailable: 9, // Default to 9 seats available
          currency: offer.TotalPrice?.SimpleCurrencyPrice?.Code || 'USD'
        };
      });

      // Store the formatted results in state instead of redirecting
      setResults(formattedResults)
    } catch (error: any) {
      console.error("Error searching flights", error)
      setError(error.message || "Failed to search flights")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full px-2 sm:px-0">
      <Tabs defaultValue="round-trip" className="w-full">
        <TabsList className="grid w-full grid-cols-3 overflow-x-auto sm:grid-cols-3">
          <TabsTrigger value="round-trip" className="text-xs sm:text-sm">Round Trip</TabsTrigger>
          <TabsTrigger value="one-way" className="text-xs sm:text-sm">One Way</TabsTrigger>
          <TabsTrigger value="multi-city" className="text-xs sm:text-sm">Multi-City</TabsTrigger>
        </TabsList>
        <TabsContent value="round-trip" className="mt-4">
          {renderFlightLegInputs(true, 'rt')}
 
           {/* Common Fields Below */}
           <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {/* Passengers */}
            <div className="w-full sm:col-span-1">
              <Select onValueChange={handlePassengersChange} value={String(passengers)}>
                <SelectTrigger>
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Passengers" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} Passenger{num > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cabin Type */}
            <div className="w-full sm:col-span-1">
              <Select onValueChange={handleCabinTypeChange} value={cabinType}>
                <SelectTrigger>
                  {/* Consider an icon for cabin type */}
                  <SelectValue placeholder="Cabin Type" />
                </SelectTrigger>
                <SelectContent>
                  {cabinTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Placeholder for grid alignment */}
            <div className="sm:col-span-1"></div>
            
            {/* Add Another Flight Button */}
            <div className="w-full sm:col-span-1">
              <Button variant="outline" className="w-full">
                + Add Another Flight
              </Button>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Button 
              className="px-8" 
              onClick={handleSubmit} 
              disabled={loading || !origin || !destination || !departDate}
            >
              {loading ? "Searching..." : "Search Flights"}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 text-center text-red-500">{error}</div>
          )}
          
          {results && (
            <div className="mt-6 border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Search Results</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </TabsContent>

        <TabsContent value="one-way" className="mt-4">
          {renderFlightLegInputs(false, 'ow')}
 
           {/* Common Fields Below */}
           <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4"> {/* Adjusted grid cols */} 
            {/* Passengers */}
            <div className="w-full sm:col-span-1">
              <Select onValueChange={handlePassengersChange} value={String(passengers)}>
                <SelectTrigger>
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Passengers" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} Passenger{num > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cabin Type */}
            <div className="w-full sm:col-span-1">
              <Select onValueChange={handleCabinTypeChange} value={cabinType}>
                <SelectTrigger>
                  {/* Consider an icon for cabin type */}
                  <SelectValue placeholder="Cabin Type" />
                </SelectTrigger>
                <SelectContent>
                  {cabinTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Placeholder for grid alignment */}
            <div className="sm:col-span-1"></div>
            
            {/* Add Another Flight Button */}
            <div className="w-full sm:col-span-1">
              <Button variant="outline" className="w-full">
                + Add Another Flight
              </Button>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Button 
              className="px-8" 
              onClick={handleSubmit} 
              disabled={loading || !origin || !destination || !departDate}
            >
              {loading ? "Searching..." : "Search Flights"}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 text-center text-red-500">{error}</div>
          )}
          
          {results && (
            <div className="mt-6 border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Search Results</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </TabsContent>

        <TabsContent value="multi-city" className="mt-4">
           {/* Render first leg (no return date) */}
           {renderFlightLegInputs(false, 'mc-1')}
           {/* Render second leg (placeholder - needs proper state management) */}
           {renderFlightLegInputs(false, 'mc-2')}
 
           {/* Common Fields Below */}
           <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4"> {/* Adjusted grid cols */} 
             {/* Passengers */} 
             <div className="w-full sm:col-span-1">
               <Select onValueChange={handlePassengersChange} value={String(passengers)}>
                 <SelectTrigger>
                   <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                   <SelectValue placeholder="Passengers" />
                 </SelectTrigger>
                 <SelectContent>
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                     <SelectItem key={num} value={String(num)}>
                       {num} Passenger{num > 1 ? "s" : ""}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             {/* Cabin Type */} 
             <div className="w-full sm:col-span-1">
               <Select onValueChange={handleCabinTypeChange} value={cabinType}>
                 <SelectTrigger>
                   {/* Consider an icon for cabin type */}
                   <SelectValue placeholder="Cabin Type" />
                 </SelectTrigger>
                 <SelectContent>
                   {cabinTypes.map((type) => (
                     <SelectItem key={type.value} value={type.value}>
                       {type.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             {/* Placeholder for grid alignment */}
             <div className="sm:col-span-1"></div>
             
             {/* Add Another Flight Button */} 
             <div className="w-full sm:col-span-1">
               <Button variant="outline" className="w-full">
                 + Add Another Flight
               </Button>
             </div>
           </div>

           <div className="mt-4 flex justify-center">
             <Button 
               className="px-8" 
               onClick={handleSubmit} 
               disabled={loading || !origin || !destination || !departDate}
             >
               {loading ? "Searching..." : "Search Flights"}
             </Button>
           </div>
           
           {error && (
             <div className="mt-4 text-center text-red-500">{error}</div>
           )}
           {loading && (
             <div className="mt-6 space-y-4">
               {[...Array(3)].map((_, i) => (
                 <Skeleton key={i} className="h-48 w-full rounded-lg" />
               ))}
             </div>
           )}
           {results && results.length > 0 && (
             <div className="mt-6 space-y-4">
               <div className="flex items-center justify-between">
                 <p className="text-sm text-muted-foreground">
                   Showing <strong>{results.length}</strong> flights
                 </p>
                 <button
                   type="button"
                   className="text-xs underline ml-2"
                   onClick={() => setShowRawApi((v) => !v)}
                 >
                   {showRawApi ? 'Hide' : 'Show'} Raw API Response
                 </button>
               </div>
               <div className="space-y-4">
                 {results.map((flight: any) => (
                   <FlightCard key={flight.id} flight={flight} />
                 ))}
               </div>
               {showRawApi && rawApiResponse && (
                 <div className="mt-6 p-4 bg-gray-100 rounded-lg overflow-x-auto">
                   <h4 className="font-semibold mb-2">Raw API Response</h4>
                   <pre className="text-xs max-h-96 overflow-auto whitespace-pre-wrap">
                     {JSON.stringify(rawApiResponse, null, 2)}
                   </pre>
                 </div>
               )}
             </div>
           )}
           {results && results.length === 0 && (
             <div className="mt-6 text-center text-muted-foreground">
               No flights found for your search criteria
               <button
                 type="button"
                 className="text-xs underline ml-2"
                 onClick={() => setShowRawApi((v) => !v)}
               >
                 {showRawApi ? 'Hide' : 'Show'} Raw API Response
               </button>
               {showRawApi && rawApiResponse && (
                 <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-x-auto">
                   <h4 className="font-semibold mb-2">Raw API Response</h4>
                   <pre className="text-xs max-h-96 overflow-auto whitespace-pre-wrap">
                     {JSON.stringify(rawApiResponse, null, 2)}
                   </pre>
                 </div>
               )}
             </div>
           )}
         </TabsContent>
       </Tabs>
     </div>
   )
 }
