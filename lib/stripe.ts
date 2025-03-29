import Stripe from "stripe"
import { logger } from "./logger"

// Initialize Stripe with API key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Use the latest API version
  appInfo: {
    name: "SkyWay Flight Booking Portal",
    version: "1.0.0",
  },
})

// Create a payment intent
export async function createPaymentIntent(
  amount: number,
  currency = "usd",
  metadata: Record<string, string> = {},
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    logger.info("Payment intent created", { paymentIntentId: paymentIntent.id })
    return paymentIntent
  } catch (error) {
    logger.error("Error creating payment intent", { error })
    throw error
  }
}

// Retrieve a payment intent
export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    logger.error("Error retrieving payment intent", { error, paymentIntentId })
    throw error
  }
}

// Update a payment intent
export async function updatePaymentIntent(
  paymentIntentId: string,
  updateData: Stripe.PaymentIntentUpdateParams,
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, updateData)
    return paymentIntent
  } catch (error) {
    logger.error("Error updating payment intent", { error, paymentIntentId })
    throw error
  }
}

// Verify webhook signature
export function constructEventFromPayload(payload: string | Buffer, signature: string): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    logger.error("Error verifying webhook signature", { error })
    throw error
  }
}

// Cancel a payment intent
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)
    logger.info("Payment intent cancelled", { paymentIntentId })
    return paymentIntent
  } catch (error) {
    logger.error("Error cancelling payment intent", { error, paymentIntentId })
    throw error
  }
}

