import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname
  }
}

export default nextConfig
