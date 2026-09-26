import { NextRequest, NextResponse } from 'next/server'
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request })
    const url = request.nextUrl

    // Logged in but visiting the home page or an auth page -> send to dashboard
    if (token &&
        (
            url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/sign-up') ||
            url.pathname.startsWith('/verify') ||
            url.pathname === '/'
        )
    ) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Not logged in but visiting a protected page -> send to sign-in
    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*'
    ]
}
