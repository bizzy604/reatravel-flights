import type React from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    const redirectUrl = `/flights/${window.location.pathname.split("/")[2]}/payment`
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`)
  }

  return <>{children}</>
}

