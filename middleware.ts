import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/flights',
  '/flights/:id',
  '/api/flights/search',
  '/api/health',
  '/api/payments/webhook', // Stripe webhooks must be public
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Handle authentication and authorization
  try {
    // Check if the route is protected and user is not authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      // For API routes, return 401 Unauthorized
      if (req.url.includes('/api/')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      // For non-API routes, redirect to sign-in
      const url = new URL('/sign-in', req.url);
      url.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(url);
    }

    // Check for admin routes
    if (req.url.includes('/api/admin') && !auth.orgRoles?.includes('admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error in afterAuth middleware:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};