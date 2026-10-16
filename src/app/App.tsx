import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/routes'
import { I18nProvider } from '@/shared/i18n/I18nProvider'

const router = createBrowserRouter(routes)

export function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  )
}
