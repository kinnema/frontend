import { Footer } from "@/components/footer";
import { Header } from "@/lib/components/Header";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import classNames from "classnames";
import "../globals.css";
import { Providers } from "../providers";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div
      className={classNames(
        "font-montserrat text-sm bg-white dark:bg-zinc-900"
      )}
    >
      <Providers>
        <Header />
        <div className="min-h-screen bg-black/95 text-white">
          <main className="pt-16">
            <Outlet />
          </main>
        </div>
        <Footer />
      </Providers>
    </div>
  ),
});
