import { getToken } from "next-auth/jwt"
import withAuth from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    async function middleware(req) {
        const pathname = req.nextUrl.pathname //return current url on which teh user is

        // manage route protection

        const isAuth = await getToken({ req })
        const isLoginPage = pathname.startsWith('/login')

        const sensitiveRoutes = ['/dashboard']
        const isAccessingSensitiveRoutes = sensitiveRoutes.some((route) => pathname.startsWith(route))

        if (isLoginPage) { // is user is acccessing the login page
            if (isAuth) { // if they are already authenticated then they should be redirected to the dashboardpage
                return NextResponse.redirect(new URL('/dashboard', req.url)) // req.url means that wiht base url localhost in our case
            }
            return NextResponse.next() // if they are not authentcated then run the route as it running and user will rediect to the login page

        }

        if (!isAuth && isAccessingSensitiveRoutes) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    }, {
    callbacks: {
        async authorized() {
            return true // this is work around to handle redirect on the auth pages, we return true so that the middleware func is always called otherwise we will get infniite redirect  
        },
    },
}
)

export const config = {
    matcher: ['/', '/login', '/dashboard/:path*'] // when to user invoke the middleware ,  :path means anything starting after / dashboard 
}