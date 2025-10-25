import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow the request to continue
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't require authentication
        const publicPaths = ["/", "/login", "/signup", "/events", "/contact"]
        const path = req.nextUrl.pathname
        
        // Allow public routes
        if (publicPaths.includes(path)) {
          return true
        }
        
        // Require authentication for protected routes
        return !!token
      },
    },
    pages: {
      signIn: "/login", // Redirect to login page if not authenticated
    },
  }
)

// Apply middleware to specific routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ai-hub/:path*",
    "/api/user/:path*",
  ],
}
