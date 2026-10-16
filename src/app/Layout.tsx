import { Outlet } from 'react-router'
import { LanguagePicker } from '@/app/LanguagePicker'

export function Layout() {
  return (
    <>
      <header className="flex justify-end p-4">
        <LanguagePicker />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
