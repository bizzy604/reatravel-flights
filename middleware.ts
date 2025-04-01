import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that need no protection
const isPublicRoute = createRouteMatcher([
  '/',
  '/flights',
  '/flights/:id',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/contact',
  '/api/flights/search',
  '/api/health',
  '/api/payments/webhook',
  "/api/seed",
  '/admin',
  "/api/bookings(.*)",
  "/api/payments(.*)",
]);

// Define admin routes
const isAdminRoute = createRouteMatcher([
  // '/admin(.*)',
  // '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without any protection.
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For admin routes, enforce RBAC by checking the user has the 'admin' role.
  if (isAdminRoute(req)) {
    try {
      // First check if user is authenticated
      const session = await auth.protect();
  
      // Then check if they have admin role - Try all possible paths
      const isAdmin = 
        auth.user?.publicMetadata?.role === 'admin' || 
        auth.actor?.publicMetadata?.role === 'admin' ||
        session?.user?.publicMetadata?.role === 'admin';
      
      console.log("Is admin?", isAdmin);
      
      if (!isAdmin) {
        // Redirect to not-authorized page
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (error) {
      // If authentication fails, redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  } else {
    // For non-admin protected routes, just check authentication
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
