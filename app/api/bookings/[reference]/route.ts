import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getBookingDetails, cancelBooking } from "@/lib/flight-api"
import { prisma } from "@/lib/prisma"
import {
  handleApiError,
  createValidationError,
  createUnauthorizedError,
  createNotFoundError,
} from "@/lib/error-handler"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest, { params }: { params: { reference: string } }) {
  try {
    // Check authentication
    const { userId } = auth()
    if (!userId) {
      throw createUnauthorizedError()
    }

    const bookingReference = params.reference
    if (!bookingReference) {
      throw createValidationError("Booking reference is required", {})
    }

    // Check if booking belongs to user using Prisma
    const booking = await prisma.booking.findUnique({
      where: { bookingReference },
    })

    if (!booking) {
      throw createNotFoundError(`Booking with reference ${bookingReference} not found`)
    }

    if (booking.userId !== userId) {
      throw createUnauthorizedError("You do not have permission to view this booking")
    }

    // Get booking details from external API
    const bookingDetails = await getBookingDetails(bookingReference)

    // Return booking details
    return NextResponse.json(bookingDetails)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { reference: string } }) {
  try {
    // Check authentication
    const { userId } = auth()
    if (!userId) {
      throw createUnauthorizedError()
    }

    const bookingReference = params.reference
    if (!bookingReference) {
      throw createValidationError("Booking reference is required", {})
    }

    // Check if booking belongs to user using Prisma
    const booking = await prisma.booking.findUnique({
      where: { bookingReference },
    })

    if (!booking) {
      throw createNotFoundError(`Booking with reference ${bookingReference} not found`)
    }

    if (booking.userId !== userId) {
      throw createUnauthorizedError("You do not have permission to cancel this booking")
    }

    // Check if booking can be cancelled (not already cancelled or completed)
    if (booking.status === "cancelled" || booking.status === "completed") {
      throw createValidationError(`Booking cannot be cancelled in status: ${booking.status}`, {
        currentStatus: booking.status,
      })
    }

    // Cancel booking with external API
    const cancelResult = await cancelBooking(bookingReference)

    // Update booking status in database using Prisma
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "cancelled" },
    })

    logger.info("Booking cancelled", {
      userId,
      bookingReference,
      refundAmount: cancelResult.refundAmount,
    })

    // Return cancellation result
    return NextResponse.json(cancelResult)
  } catch (error) {
    return handleApiError(error)
  }
}