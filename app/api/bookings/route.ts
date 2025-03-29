import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createBooking } from "@/lib/flight-api"
import { prisma } from "@/lib/prisma"
import { handleApiError, createValidationError, createUnauthorizedError } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth()
    if (!userId) {
      throw createUnauthorizedError()
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.flightId || !body.passengers || !body.contactInfo) {
      throw createValidationError("Missing required booking information", {
        required: ["flightId", "passengers", "contactInfo"],
        received: Object.keys(body),
      })
    }

    // Validate passengers
    if (!Array.isArray(body.passengers) || body.passengers.length === 0) {
      throw createValidationError("Invalid passengers data", {
        message: "At least one passenger is required",
      })
    }

    // Validate contact info
    if (!body.contactInfo.email || !body.contactInfo.phone) {
      throw createValidationError("Invalid contact information", {
        required: ["email", "phone"],
        received: Object.keys(body.contactInfo),
      })
    }

    // Log booking request
    logger.info("Booking request", {
      userId,
      flightId: body.flightId,
      passengerCount: body.passengers.length,
    })

    // Create booking with external API
    const bookingResult = await createBooking({
      flightId: body.flightId,
      passengers: body.passengers,
      contactInfo: body.contactInfo,
      extras: body.extras,
    })

    // Store booking in database using Prisma
    const booking = await prisma.booking.create({
      data: {
        userId,
        bookingReference: bookingResult.bookingReference,
        flightDetails: { flightId: body.flightId },
        passengerDetails: body.passengers,
        contactInfo: body.contactInfo,
        extras: body.extras || {},
        totalAmount: bookingResult.totalAmount,
        status: bookingResult.status,
      },
    })

    logger.info("Booking stored in database", {
      bookingId: booking.id,
      bookingReference: bookingResult.bookingReference,
    })

    // Return booking result
    return NextResponse.json(bookingResult, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth()
    if (!userId) {
      throw createUnauthorizedError()
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

    // Build query with Prisma
    const where = {
      userId,
      ...(status ? { status } : {}),
    }

    // Execute query with Prisma
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    // Return bookings
    return NextResponse.json({
      bookings,
      meta: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}