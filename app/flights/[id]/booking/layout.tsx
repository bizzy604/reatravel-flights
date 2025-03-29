import type React from "react"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    const redirectUrl = `/flights/${window.location.pathname.split("/")[2]}/booking`
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`)
  }

  return <>{children}</>
}

