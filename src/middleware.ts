import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { adminRole, tradeProfessionalRole } from './configs/constant'

interface Role { id: string }
interface User { roles: Role[]; id: string; email: string }
interface CustomToken { user: User }

const ADMIN_PREFIX = '/en/admin'
const TRADE_PREFIX = '/en/trade-professional'
const PUBLIC_ROUTES = [
  '/en/login',
  '/en/register',
  '/en/forgot-password',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  }) as CustomToken | null

  // 1. Public routes don't require auth
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Optional: Redirect away if already logged in
    if (token?.user) {
      const roleIds = token.user.roles.map(role => role.id)
      if (roleIds.includes(adminRole.id)) {
        return NextResponse.redirect(new URL('/en/admin/dashboards/crm', request.url))
      } else if (roleIds.includes(tradeProfessionalRole.id)) {
        return NextResponse.redirect(new URL('/en/trade-professional/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // 2. If not authenticated, redirect to login
  if (!token || !token.user) {
    return NextResponse.next()
  }

  // 3. Role-based routing
  const roleIds = token.user.roles.map(role => role.id)
  const isAdmin = roleIds.includes(adminRole?.id)
  const isTrade = roleIds.includes(tradeProfessionalRole?.id)

  if (isAdmin && pathname.startsWith(TRADE_PREFIX)) {
    return NextResponse.redirect(new URL('/en/admin/dashboards/crm', request.url))
  }

  if (isTrade && pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.redirect(new URL('/en/trade-professional/dashboard', request.url))
  }

  if (!isAdmin && !isTrade) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
