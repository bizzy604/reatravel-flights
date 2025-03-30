import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require protection
const isPublicRoute = createRouteMatcher([
  '/', 
  '/flights', 
  '/flights/:id',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/flights/search',
  '/api/health',
  '/api/payments/webhook',
]);

// Define admin routes that require additional permissions
const isAdminRoute = createRouteMatcher([
  '/api/admin(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Always allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages (sign-in/sign-up)
  if (auth.userId && (req.url.includes('/sign-in') || req.url.includes('/sign-up'))) {
    const url = new URL(req.url);
    const redirectUrl = url.searchParams.get('redirect_url') || '/flights';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // For all non-public routes, require authentication.
  // This will automatically redirect to the sign-in page if the user is not authenticated.
  await auth.protect();

  // If the route is an admin route, enforce authorization via required permissions.
  if (isAdminRoute(req)) {
    // This callback returns true if the user has the 'org:admin' permission.
    await auth.protect((has) => has({ permission: 'org:admin' }));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // This matcher pattern excludes Next.js internals and static files, while ensuring API routes are always processed.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
