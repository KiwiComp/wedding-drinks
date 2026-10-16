import type { RouteObject } from 'react-router'
import { Layout } from '@/app/Layout'
import { NotFoundPage } from '@/app/NotFoundPage'
import { RouteError } from '@/app/RouteError'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { TablePage } from '@/features/ordering/components/TablePage'

export const routes: RouteObject[] = [
  {
    Component: Layout,
    errorElement: <RouteError />,
    children: [
      {
        path: 'table/:tableId',
        Component: TablePage,
        errorElement: <RouteError />,
      },
      {
        path: 'bar',
        // Lazy, so that guests never download the bar code.
        lazy: () =>
          import('@/features/bar/components/BarPage').then((m) => ({
            Component: m.BarPage,
          })),
        errorElement: <RouteError />,
      },
      { path: 'login', Component: LoginPage, errorElement: <RouteError /> },
      { path: '*', Component: NotFoundPage, errorElement: <RouteError /> },
    ],
  },
]
