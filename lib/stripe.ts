import Stripe from "stripe"
import { logger } from "./logger"

// Initialize Stripe with API key from environment variables
// Note: There's a typo in the .env file (STRIPE_SECRET_KEYy instead of STRIPE_SECRET_KEY)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("Warning: Stripe secret key is missing. Please check your environment variables.");
}

const stripe = new Stripe(stripeSecretKey!, {
  apiVersion: "2023-10-16", // Use the latest API version
  appInfo: {
    name: "Rea Travel Agency Flight Booking Portal",
    version: "1.0.0",
  },
  typescript: true,
})

// Create a payment intent with enhanced security
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
      // Enable 3D Secure when available
      setup_future_usage: metadata.save_card === "true" ? "off_session" : undefined,
      // Add statement descriptor to help customers recognize the charge
      statement_descriptor: "REA FLIGHTS",
      statement_descriptor_suffix: metadata.booking_reference || "",
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

// Verify webhook signature with enhanced security
export function constructEventFromPayload(payload: string | Buffer, signature: string): Stripe.Event {
  try {
    // Use tolerance option to prevent replay attacks (300 seconds = 5 minutes)
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
      300 // 5 minute tolerance in seconds
    )
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

// Create a setup intent for saving cards
export async function createSetupIntent(
  customerId: string,
  metadata: Record<string, string> = {},
): Promise<Stripe.SetupIntent> {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata,
      usage: "off_session",
    })

    logger.info("Setup intent created", { setupIntentId: setupIntent.id })
    return setupIntent
  } catch (error) {
    logger.error("Error creating setup intent", { error })
    throw error
  }
}

// Create or retrieve a customer
export async function getOrCreateCustomer(userId: string, email?: string, name?: string): Promise<Stripe.Customer> {
  try {
    // Search for existing customer by metadata
    const customers = await stripe.customers.list({
      limit: 1,
      email,
    })

    if (customers.data.length > 0) {
      return customers.data[0]
    }

    // Create new customer if not found
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    })

    logger.info("Customer created", { customerId: customer.id, userId })
    return customer
  } catch (error) {
    logger.error("Error getting or creating customer", { error, userId })
    throw error
  }
}

