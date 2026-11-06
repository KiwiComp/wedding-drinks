import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/routes'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/shared/i18n/I18nProvider'

const router = createBrowserRouter(routes)

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nProvider>
  )
}
