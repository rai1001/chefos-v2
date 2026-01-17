'use server'

import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

const PUBLIC_PATHS = ['/login', '/favicon.ico', '/api/health']

function redirectToLogin(request: NextRequest, reason?: string) {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
  if (reason) {
    loginUrl.searchParams.set('error', reason)
  }
  return NextResponse.redirect(loginUrl)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) {
    return redirectToLogin(request, 'no-session')
  }

  const { data, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
  const user = data?.user
  if (userError || !user) {
    return redirectToLogin(request, 'no-session')
  }

  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('org_members')
    .select('org_id, role, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (membershipError || !membership?.org_id) {
    return redirectToLogin(request, 'no-membership')
  }

  const response = NextResponse.next()
  response.cookies.set('chefos-active-org', membership.org_id, { path: '/' })

  const { data: hotel } = await supabaseAdmin
    .from('hotels')
    .select('id')
    .eq('org_id', membership.org_id)
    .limit(1)
    .single()

  if (hotel?.id) {
    response.cookies.set('chefos-active-hotel', hotel.id, { path: '/' })
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/events/:path*',
    '/events/new',
    '/orders',
    '/inventory',
    '/staff',
    '/settings'
  ]
}
