import { prisma } from "./prisma"
import { auth } from "@clerk/nextjs/server"

/**
 * Seeds the database with test data
 */
export async function seedDatabase() {
  try {
    console.log("Seeding database with test data...")

    // Get the current user ID from Clerk or use a default for development
    const { userId } = auth()
    const userIdToUse = userId || "dev-user-id"

    // Check if we already have bookings for this user
    const existingBookingsCount = await prisma.booking.count({
      where: { userId: userIdToUse },
    })

    if (existingBookingsCount > 0) {
      console.log(`Database already has ${existingBookingsCount} bookings for user ${userIdToUse}. Skipping seed.`)
      return
    }

    // In lib/seed-data.ts
    const bookingReference = `BOOK-${Math.floor(100000 + Math.random() * 900000)}`
    // Sample booking data
    const SAMPLE_BOOKINGS = [
      {
        bookingReference: bookingReference,
        userId: userIdToUse,
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
              airport: "LHR",
              terminal: "5",
              city: "London",
              time: "20:45",
              date: "2025-04-15",
              fullDate: "Tuesday, April 15, 2025",
            },
            duration: "7h 15m",
          },
          return: {
            airline: {
              name: "SkyWay Airlines",
              logo: "/placeholder.svg?height=40&width=40",
              code: "SW",
              flightNumber: "4321",
            },
            departure: {
              airport: "LHR",
              terminal: "5",
              city: "London",
              time: "10:30",
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
            duration: "8h 15m",
          },
        },
        passengerDetails: [
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
        totalAmount: 599.99,
        status: "pending",
      },
      // Other sample bookings with the same userIdToUse...
      {
        bookingReference: bookingReference,
        userId: userIdToUse,
        flightDetails: {
          outbound: {
            airline: {
              name: "SkyWay Airlines",
              logo: "/placeholder.svg?height=40&width=40",
              code: "SW",
              flightNumber: "5678",
            },
            departure: {
              airport: "LAX",
              terminal: "B",
              city: "Los Angeles",
              time: "11:30",
              date: "2025-05-10",
              fullDate: "Saturday, May 10, 2025",
            },
            arrival: {
              airport: "HND",
              terminal: "3",
              city: "Tokyo",
              time: "15:45",
              date: "2025-05-11",
              fullDate: "Sunday, May 11, 2025",
            },
            duration: "12h 15m",
          },
          return: {
            airline: {
              name: "SkyWay Airlines",
              logo: "/placeholder.svg?height=40&width=40",
              code: "SW",
              flightNumber: "8765",
            },
            departure: {
              airport: "HND",
              terminal: "3",
              city: "Tokyo",
              time: "22:30",
              date: "2025-05-20",
              fullDate: "Tuesday, May 20, 2025",
            },
            arrival: {
              airport: "LAX",
              terminal: "B",
              city: "Los Angeles",
              time: "18:45",
              date: "2025-05-21",
              fullDate: "Wednesday, May 21, 2025",
            },
            duration: "10h 15m",
          },
        },
        passengerDetails: [
          {
            type: "Adult",
            firstName: "Jane",
            lastName: "Smith",
            documentType: "Passport",
            documentNumber: "CD789012",
          },
          {
            type: "Child",
            firstName: "Emma",
            lastName: "Smith",
            documentType: "Passport",
            documentNumber: "CD789013",
          },
        ],
        contactInfo: {
          email: "jane.smith@example.com",
          phone: "+1 (555) 987-6543",
        },
        extras: {
          seats: {
            outbound: "10A (Window), 10B (Middle)",
            return: "12D (Aisle), 12E (Middle)",
          },
          baggage: {
            included: "2 carry-on, 2 checked bags",
            additional: "1 extra checked bag",
          },
          meals: {
            outbound: "Vegetarian, Child Meal",
            return: "Vegetarian, Child Meal",
          },
          additionalServices: ["Priority Boarding", "Travel Insurance", "Airport Transfer"],
        },
        totalAmount: 1299.99,
        status: "pending",
      },
    ]

    // Create bookings
    for (const bookingData of SAMPLE_BOOKINGS) {
      await prisma.booking.create({
        data: {
          userId: bookingData.userId,
          bookingReference: bookingData.bookingReference,
          flightDetails: bookingData.flightDetails,
          passengerDetails: bookingData.passengerDetails,
          contactInfo: bookingData.contactInfo,
          extras: bookingData.extras,
          totalAmount: bookingData.totalAmount,
          status: bookingData.status,
        },
      })
      console.log(`Created booking: ${bookingData.bookingReference}`)
    }

    console.log("Database seeding completed successfully!")
    return true
  } catch (error) {
    console.error("Error seeding database:", error)
    return false
  }
}
