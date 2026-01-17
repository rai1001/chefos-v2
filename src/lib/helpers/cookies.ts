export interface CookieOptions {
  path?: string
  maxAge?: number
  expires?: Date
  sameSite?: 'strict' | 'lax' | 'none'
  secure?: boolean
}

export function getCookieValue(name: string) {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? undefined
  }
  return undefined
}

export function setCookieValue(name: string, value: string, options: CookieOptions = {}) {
  if (typeof document === 'undefined') return

  const segments = [`${name}=${value}`]
  if (options.path) {
    segments.push(`path=${options.path}`)
  }
  if (options.maxAge || options.maxAge === 0) {
    segments.push(`max-age=${options.maxAge}`)
  }
  if (options.expires) {
    segments.push(`expires=${options.expires.toUTCString()}`)
  }
  if (options.sameSite) {
    segments.push(`SameSite=${options.sameSite}`)
  }
  if (options.secure) {
    segments.push('secure')
  }

  document.cookie = segments.join('; ')
}

export function deleteCookieValue(name: string, options: CookieOptions = {}) {
  setCookieValue(name, '', {
    ...options,
    maxAge: 0
  })
}
