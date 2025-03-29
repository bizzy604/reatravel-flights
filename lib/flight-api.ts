import axios from "axios"
import { logger } from "./logger"

// Flight API client configuration
const flightApiClient = axios.create({
  baseURL: process.env.FLIGHT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.FLIGHT_API_KEY,
  },
  timeout: 10000, // 10 seconds timeout
})

// Add request interceptor for logging
flightApiClient.interceptors.request.use(
  (config) => {
    logger.info("Flight API request", {
      method: config.method,
      url: config.url,
      params: config.params,
    })
    return config
  },
  (error) => {
    logger.error("Flight API request error", { error })
    return Promise.reject(error)
  },
)

// Add response interceptor for logging
flightApiClient.interceptors.response.use(
  (response) => {
    logger.info("Flight API response", {
      status: response.status,
      url: response.config.url,
    })
    return response
  },
  (error) => {
    logger.error("Flight API response error", {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })
    return Promise.reject(error)
  },
)

// Search flights
export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
  try {
    const response = await flightApiClient.get("/flights/search", { params })
    return response.data
  } catch (error) {
    logger.error("Error searching flights", { error, params })
    throw error
  }
}

// Get flight details
export async function getFlightDetails(flightId: string): Promise<FlightDetails> {
  try {
    const response = await flightApiClient.get(`/flights/${flightId}`)
    return response.data
  } catch (error) {
    logger.error("Error getting flight details", { error, flightId })
    throw error
  }
}

// Create booking
export async function createBooking(bookingData: BookingCreateParams): Promise<BookingResult> {
  try {
    const response = await flightApiClient.post("/bookings", bookingData)
    return response.data
  } catch (error) {
    logger.error("Error creating booking", { error })
    throw error
  }
}

// Get booking details
export async function getBookingDetails(bookingReference: string): Promise<BookingDetails> {
  try {
    const response = await flightApiClient.get(`/bookings/${bookingReference}`)
    return response.data
  } catch (error) {
    logger.error("Error getting booking details", { error, bookingReference })
    throw error
  }
}

// Cancel booking
export async function cancelBooking(bookingReference: string): Promise<BookingCancelResult> {
  try {
    const response = await flightApiClient.post(`/bookings/${bookingReference}/cancel`)
    return response.data
  } catch (error) {
    logger.error("Error cancelling booking", { error, bookingReference })
    throw error
  }
}

// Types
export interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  cabinClass?: string
}

export interface FlightSearchResult {
  flights: Flight[]
  meta: {
    total: number
    currency: string
  }
}

export interface Flight {
  id: string
  airline: {
    code: string
    name: string
    logo?: string
  }
  flightNumber: string
  departure: {
    airport: string
    city: string
    time: string
    date: string
    terminal?: string
  }
  arrival: {
    airport: string
    city: string
    time: string
    date: string
    terminal?: string
  }
  duration: string
  stops: number
  price: number
  seatsAvailable: number
}

export interface FlightDetails extends Flight {
  aircraft: string
  amenities: string[]
  baggageAllowance: {
    carryOn: string
    checked: string
  }
  refundable: boolean
  fareClass: string
}

export interface BookingCreateParams {
  flightId: string
  passengers: Passenger[]
  contactInfo: ContactInfo
  extras?: BookingExtras
}

export interface Passenger {
  firstName: string
  lastName: string
  type: "adult" | "child" | "infant"
  dateOfBirth: string
  gender: string
  documentType: string
  documentNumber: string
  nationality: string
}

export interface ContactInfo {
  email: string
  phone: string
}

export interface BookingExtras {
  seats?: {
    outbound: string
    return?: string
  }
  baggage?: {
    additional: number
  }
  meals?: {
    outbound: string
    return?: string
  }
  additionalServices?: string[]
}

export interface BookingResult {
  bookingReference: string
  status: string
  totalAmount: number
  currency: string
}

export interface BookingDetails extends BookingResult {
  flightDetails: FlightDetails
  passengers: Passenger[]
  contactInfo: ContactInfo
  extras?: BookingExtras
  createdAt: string
}

export interface BookingCancelResult {
  bookingReference: string
  status: string
  refundAmount?: number
}

