import { type NextRequest, NextResponse } from "next/server"
import { callVerteilAirShopping, optimizeFlightData } from "@/lib/flight-api"
import { handleApiError } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import type { FlightSearchRequest } from "@/types/flight-api"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const payload: FlightSearchRequest = await request.json()

    // Log search request
    logger.info("Advanced flight search request", { payload })

    // 1. Call flight API to get raw data
    const rawData = await callVerteilAirShopping(payload);

    // 2. Process data for UI
    const processedData = optimizeFlightData(rawData)
    
    // 3. Construct response body
    const responseBody: any = {
      processed: processedData,
    };

    // 4. Conditionally include raw data for debugging in development
    if (process.env.NODE_ENV === 'development') {
      responseBody.raw = rawData;
      logger.debug("Including raw API data in development response");
    }

    // Return search results (processed, and raw if in dev)
    logger.info("Advanced flight search successful")
    return NextResponse.json(responseBody)

  } catch (error) {
    logger.error("Error in advanced flight search", { error })
    return handleApiError(error)
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
