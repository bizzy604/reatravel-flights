"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { ChevronRight, CreditCard, Luggage, User, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PassengerForm } from "@/components/passenger-form"
import { SeatSelection } from "@/components/seat-selection"
import { BaggageOptions } from "@/components/baggage-options"
import { MealOptions } from "@/components/meal-options"

export function BookingForm() {
  const router = useRouter()
  const pathname = usePathname()
  const { isSignedIn } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [passengerCount, setPassengerCount] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { id: 1, name: "Passenger Details" },
    { id: 2, name: "Seat Selection" },
    { id: 3, name: "Extras" },
    { id: 4, name: "Review" },
  ]

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleContinueToPayment = async () => {
    try {
      setIsSubmitting(true)
      const flightId = pathname.split("/")[2]
      // Remove auth check here since middleware will handle it
      router.push(`/flights/${flightId}/payment`)
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border">
      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-semibold">Booking Details</h2>

        {/* Progress Steps */}
        <div className="mt-4 hidden sm:block">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                      currentStep >= step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {step.id}
                  </div>
                  <span
                    className={cn(
                      "ml-2 text-sm font-medium",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn("mx-2 h-0.5 w-10 bg-muted-foreground/30", currentStep > step.id && "bg-primary")}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {/* Step 1: Passenger Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Passenger Information</h3>
                  <Select
                    value={passengerCount.toString()}
                    onValueChange={(value) => setPassengerCount(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Number of Passengers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Passenger</SelectItem>
                      <SelectItem value="2">2 Passengers</SelectItem>
                      <SelectItem value="3">3 Passengers</SelectItem>
                      <SelectItem value="4">4 Passengers</SelectItem>
                      <SelectItem value="5">5 Passengers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="passenger-1" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-none sm:auto-cols-auto sm:flex">
                    {Array.from({ length: passengerCount }).map((_, index) => (
                      <TabsTrigger key={index} value={`passenger-${index + 1}`}>
                        Passenger {index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Array.from({ length: passengerCount }).map((_, index) => (
                    <TabsContent key={index} value={`passenger-${index + 1}`}>
                      <PassengerForm passengerNumber={index + 1} />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" />
                    <p className="text-xs text-muted-foreground">
                      Your booking confirmation will be sent to this email
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                    <p className="text-xs text-muted-foreground">For urgent notifications about your flight</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Seat Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Seat Selection</h3>
                <p className="text-sm text-muted-foreground">Choose your preferred seats for your flights</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 text-base font-medium">Outbound Flight</h4>
                  <SeatSelection />
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 text-base font-medium">Return Flight</h4>
                  <SeatSelection />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Extras */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Optional Extras</h3>
                <p className="text-sm text-muted-foreground">Enhance your journey with additional services</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 text-base font-medium">Baggage Options</h4>
                  <BaggageOptions />
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 text-base font-medium">Meal Preferences</h4>
                  <MealOptions />
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 text-base font-medium">Additional Services</h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 rounded-md border p-4">
                      <Checkbox id="travel-insurance" />
                      <div className="space-y-1">
                        <label
                          htmlFor="travel-insurance"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Travel Insurance
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Comprehensive coverage for trip cancellation, medical emergencies, and more
                        </p>
                        <p className="text-sm font-medium">$24.99 per passenger</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 rounded-md border p-4">
                      <Checkbox id="priority-boarding" />
                      <div className="space-y-1">
                        <label
                          htmlFor="priority-boarding"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Priority Boarding
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Be among the first to board the aircraft and secure overhead bin space
                        </p>
                        <p className="text-sm font-medium">$15.99 per passenger</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 rounded-md border p-4">
                      <Checkbox id="airport-lounge" />
                      <div className="space-y-1">
                        <label
                          htmlFor="airport-lounge"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Airport Lounge Access
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Relax before your flight with complimentary food, drinks, and Wi-Fi
                        </p>
                        <p className="text-sm font-medium">$39.99 per passenger</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Review Your Booking</h3>
                <p className="text-sm text-muted-foreground">Please review all details before proceeding to payment</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h4 className="mb-2 text-base font-medium">Passenger Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>John Doe (Adult)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Passport: AB123456 (United States)</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="mb-2 text-base font-medium">Selected Seats</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="text-sm">
                      <p className="font-medium">Outbound Flight:</p>
                      <p>Seat 14A (Window)</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Return Flight:</p>
                      <p>Seat 15C (Aisle)</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="mb-2 text-base font-medium">Extras</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Luggage className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Extra Baggage: 1 additional checked bag</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Priority Boarding</span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Travel Insurance</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="mb-2 text-base font-medium">Price Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base fare (1 passenger)</span>
                      <span>$299.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxes and fees</span>
                      <span>$45.60</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Seat selection</span>
                      <span>$24.99</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Extra baggage</span>
                      <span>$35.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Priority boarding</span>
                      <span>$15.99</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Travel insurance</span>
                      <span>$24.99</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>$445.57</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-md border p-4">
                  <Checkbox id="terms" />
                  <div>
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the Terms and Conditions
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      By checking this box, you agree to our{" "}
                      <a href="#" className="text-primary underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary underline">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleContinueToPayment} 
                disabled={isSubmitting}
                aria-label="Continue to payment page"
              >
                {isSubmitting ? "Processing..." : "Continue to Payment"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

