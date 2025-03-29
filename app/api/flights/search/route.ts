import { type NextRequest, NextResponse } from "next/server"
import { searchFlights } from "@/lib/flight-api"
import { handleApiError, createValidationError } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

// Cache configuration
const CACHE_MAX_AGE = 300 // 5 minutes in seconds

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get("origin")
    const destination = searchParams.get("destination")
    const departureDate = searchParams.get("departureDate")
    const returnDate = searchParams.get("returnDate")
    const passengers = searchParams.get("passengers")
    const cabinClass = searchParams.get("cabinClass")

    // Validate required parameters
    if (!origin || !destination || !departureDate || !passengers) {
      throw createValidationError("Missing required search parameters", {
        required: ["origin", "destination", "departureDate", "passengers"],
        received: { origin, destination, departureDate, passengers },
      })
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(departureDate) || (returnDate && !dateRegex.test(returnDate))) {
      throw createValidationError("Invalid date format", {
        format: "YYYY-MM-DD",
        received: { departureDate, returnDate },
      })
    }

    // Validate passengers count
    const passengersCount = Number.parseInt(passengers, 10)
    if (isNaN(passengersCount) || passengersCount < 1 || passengersCount > 9) {
      throw createValidationError("Invalid passengers count", {
        range: "1-9",
        received: passengers,
      })
    }

    // Log search request
    logger.info("Flight search request", {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: passengersCount,
      cabinClass,
    })

    // Call flight API to search flights
    const searchResults = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate: returnDate || undefined,
      passengers: passengersCount,
      cabinClass: cabinClass || undefined,
    })

    // Return search results with caching headers
    return NextResponse.json(searchResults, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

