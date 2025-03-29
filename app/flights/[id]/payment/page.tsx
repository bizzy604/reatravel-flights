"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Lock, Shield } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Separator } from "@/components/ui/separator"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { PaymentForm } from "@/components/payment-form"
import { PaymentConfirmation } from "@/components/payment-confirmation"
import { OrderSummary } from "@/components/order-summary"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSpinner } from "@/components/loading-spinner"

// Mock data for the booking
const bookingData = {
  id: "BK-12345678",
  flightDetails: {
    outbound: {
      airline: {
        name: "SkyWay Airlines",
        logo: "/placeholder.svg?height=40&width=40",
        code: "SW",
        flightNumber: "1234",
      },
      departure: {
        airport: "JFK",
        terminal: "4",
        city: "New York",
        time: "08:30",
        date: "2025-04-15",
        fullDate: "Tuesday, April 15, 2025",
      },
      arrival: {
        airport: "LAX",
        terminal: "B",
        city: "Los Angeles",
        time: "11:45",
        date: "2025-04-15",
        fullDate: "Tuesday, April 15, 2025",
      },
      duration: "6h 15m",
    },
    return: {
      airline: {
        name: "SkyWay Airlines",
        logo: "/placeholder.svg?height=40&width=40",
        code: "SW",
        flightNumber: "4321",
      },
      departure: {
        airport: "LAX",
        terminal: "B",
        city: "Los Angeles",
        time: "14:30",
        date: "2025-04-22",
        fullDate: "Tuesday, April 22, 2025",
      },
      arrival: {
        airport: "JFK",
        terminal: "4",
        city: "New York",
        time: "22:45",
        date: "2025-04-22",
        fullDate: "Tuesday, April 22, 2025",
      },
      duration: "5h 15m",
    },
  },
  passengers: [
    {
      type: "Adult",
      firstName: "John",
      lastName: "Doe",
      documentType: "Passport",
      documentNumber: "AB123456",
    },
  ],
  contactInfo: {
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
  },
  extras: {
    seats: {
      outbound: "14A (Window)",
      return: "15C (Aisle)",
    },
    baggage: {
      included: "1 carry-on, 1 checked bag",
      additional: "1 extra checked bag",
    },
    meals: {
      outbound: "Standard",
      return: "Vegetarian",
    },
    additionalServices: ["Priority Boarding", "Travel Insurance"],
  },
  pricing: {
    baseFare: 299.0,
    taxes: 45.6,
    seatSelection: 24.99,
    extraBaggage: 35.0,
    priorityBoarding: 15.99,
    travelInsurance: 24.99,
    total: 445.57,
  },
}

export default function PaymentPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const flightId = params.id as string

  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "error">("pending")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If user is not authenticated, redirect to sign-in
    if (isLoaded && !user) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/flights/${flightId}/payment`)}`)
    }
  }, [isLoaded, user, router, flightId])

  const handlePaymentSubmit = async () => {
    setIsLoading(true)
    setPaymentStatus("processing")
    setError(null)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate API integration point
      // In a real app, this would be an API call to process payment
      // data-payment-processor="stripe" would be used in production

      setPaymentStatus("success")
    } catch (err) {
      setPaymentStatus("error")
      setError("Payment processing failed. Please try again or use a different payment method.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo1.png" alt="Rea Travel Logo" width={32} height={32} />
            <span className="text-xl font-bold">Rea Travel</span>
          </div>
          <MainNav />
          <UserNav />
        </div>
      </header>

      <main className="flex-1">
        <ErrorBoundary>
          <div className="container py-6">
            {paymentStatus !== "success" && (
              <div className="mb-6">
                <Link
                  href={`/flights/${params.id}`}
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back to Booking Details
                </Link>

                <h1 className="mt-4 text-2xl font-bold md:text-3xl">Payment</h1>
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <Lock className="mr-1 h-4 w-4" />
                  <span>Secure payment processing</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Welcome, {user.firstName || user.username || "User"}! Please complete your payment to confirm your
                  booking.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-md bg-destructive/10 p-4 text-destructive">
                <p>{error}</p>
              </div>
            )}

            {paymentStatus === "processing" ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-center text-muted-foreground">
                  Processing your payment. Please do not close this page...
                </p>
              </div>
            ) : paymentStatus === "success" ? (
              <PaymentConfirmation booking={bookingData} />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                {/* Payment Form */}
                <div className="space-y-6">
                  <div className="rounded-lg border">
                    <div className="flex items-center justify-between p-4 sm:p-6">
                      <h2 className="text-xl font-semibold">Payment Method</h2>
                      <div className="flex items-center space-x-2">
                        <Image
                          src="/placeholder.svg?height=24&width=36"
                          alt="Visa"
                          width={36}
                          height={24}
                          className="rounded"
                        />
                        <Image
                          src="/placeholder.svg?height=24&width=36"
                          alt="Mastercard"
                          width={36}
                          height={24}
                          className="rounded"
                        />
                        <Image
                          src="/placeholder.svg?height=24&width=36"
                          alt="American Express"
                          width={36}
                          height={24}
                          className="rounded"
                        />
                      </div>
                    </div>
                    <Separator />
                    <PaymentForm onSubmit={handlePaymentSubmit} isLoading={isLoading} />
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start space-x-4">
                      <Shield className="mt-0.5 h-6 w-6 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Secure Payment</h3>
                        <p className="text-sm text-muted-foreground">
                          Your payment information is encrypted and securely processed. We do not store your full card
                          details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <OrderSummary booking={bookingData} />
                </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  )
}

