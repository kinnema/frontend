import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { Header } from '@/lib/components/Header'
import { Footer } from '@/components/footer'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '../providers'
import classNames from 'classnames'
import '../globals.css'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className={classNames("font-montserrat text-sm bg-white dark:bg-zinc-900")}>
      <Providers>
        <Header />
        <div className="min-h-screen bg-black/95 text-white">
          <main className="pt-16">
            <Outlet />
          </main>
        </div>
        <Footer />
        <Toaster />
      </Providers>
    </div>
  ),
})