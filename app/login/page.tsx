import { Suspense } from 'react'
import { LoginView } from './LoginView'

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginView />
    </Suspense>
  )
}
