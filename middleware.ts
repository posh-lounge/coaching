import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const currentPath = req.nextUrl.pathname;

  // Handle root path `/`
  if (currentPath === '/') {
    if (token && token.role === 'admin') {
      // Redirect to `/admin` if user is logged in and has the admin role
      return NextResponse.redirect(new URL('/admin', req.url));
    }else if (token && token.role === 'coach') {
      // Redirect to `/coach` if user is logged in and has the coach role
      return NextResponse.redirect(new URL('/coach', req.url));
    }else if (token && token.role === 'coachee') {
      // Redirect to `/coachee` if user is logged in and has the coachee role
      return NextResponse.redirect(new URL('/coachee', req.url));
    }else if (token && token.role === 'other') {
      // Redirect to `/other` if user is logged in and has the other role
      return NextResponse.redirect(new URL('/other', req.url));
    }
    // Allow unauthenticated users to remain on `/`
    return NextResponse.next();
  }

  // Handle protected `/dashboard` paths
  if (currentPath.startsWith('/admin')) {
    if (!token || token.role !== 'admin') {
      // Redirect to `/` if no valid token or wrong role
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

    // Handle protected `/dashboard` paths
    if (currentPath.startsWith('/coach')) {
      if (!token || token.role !== 'coach') {
        // Redirect to `/` if no valid token or wrong role
        return NextResponse.redirect(new URL('/', req.url));
      }
    }


    
    // Handle protected `/dashboard` paths
    if (currentPath.startsWith('/coachee')) {
      if (!token || token.role !== 'coachee') {
        // Redirect to `/` if no valid token or wrong role
        return NextResponse.redirect(new URL('/', req.url));
      }
    }




  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*','/coach/:path*','/coachee/:path*'], // Apply middleware to `/` and `/dashboard` routes
};
