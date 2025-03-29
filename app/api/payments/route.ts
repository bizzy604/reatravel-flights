import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createPaymentIntent, retrievePaymentIntent } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import {
  handleApiError,
  createValidationError,
  createUnauthorizedError,
  createNotFoundError,
} from "@/lib/error-handler"
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
    if (!body.bookingReference || !body.amount || !body.currency) {
      throw createValidationError("Missing required payment information", {
        required: ["bookingReference", "amount", "currency"],
        received: Object.keys(body),
      })
    }

    // Validate amount
    const amount = Number.parseFloat(body.amount)
    if (isNaN(amount) || amount <= 0) {
      throw createValidationError("Invalid payment amount", {
        received: body.amount,
        message: "Amount must be a positive number",
      })
    }

    // Check if booking exists and belongs to user using Prisma
    const booking = await prisma.booking.findUnique({
      where: { bookingReference: body.bookingReference },
    })

    if (!booking) {
      throw createNotFoundError(`Booking with reference ${body.bookingReference} not found`)
    }

    if (booking.userId !== userId) {
      throw createUnauthorizedError("You do not have permission to pay for this booking")
    }

    // Check if booking is in a payable state
    if (booking.status !== "pending" && booking.status !== "payment_failed") {
      throw createValidationError(`Cannot process payment for booking in status: ${booking.status}`, {
        currentStatus: booking.status,
      })
    }

    // Create payment intent with Stripe
    const paymentIntent = await createPaymentIntent(amount, body.currency.toLowerCase(), {
      booking_reference: body.bookingReference,
      user_id: userId,
    })

    // Store payment intent in database using Prisma transaction
    await prisma.$transaction([
      // Create payment record
      prisma.payment.create({
        data: {
          bookingId: booking.id,
          paymentIntentId: paymentIntent.id,
          amount,
          currency: body.currency.toLowerCase(),
          status: paymentIntent.status,
        },
      }),

      // Update booking status
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "payment_pending" },
      }),
    ])

    logger.info("Payment intent created", {
      userId,
      bookingReference: body.bookingReference,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: body.currency,
    })

    // Return client secret for frontend to complete payment
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
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
    const paymentIntentId = searchParams.get("paymentIntentId")

    if (!paymentIntentId) {
      throw createValidationError("Payment intent ID is required", {})
    }

    // Retrieve payment from database to verify ownership using Prisma
    const payment = await prisma.payment.findUnique({
      where: { paymentIntentId },
      include: { booking: true },
    })

    if (!payment) {
      throw createNotFoundError(`Payment with ID ${paymentIntentId} not found`)
    }

    if (payment.booking.userId !== userId) {
      throw createUnauthorizedError("You do not have permission to view this payment")
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await retrievePaymentIntent(paymentIntentId)

    // Return payment details
    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      amount: payment.amount,
      currency: payment.currency,
      status: paymentIntent.status,
      bookingReference: payment.booking.bookingReference,
      createdAt: payment.createdAt,
    })
  } catch (error) {
    return handleApiError(error)
  }
}