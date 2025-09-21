import { Footer } from "@/components/footer";
import { Header } from "@/components/Header";
import { Loading } from "@/components/Loading";
import { Providers } from "@/providers";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import classNames from "classnames";
import "../globals.css";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: () => <div>Not Found</div>,
  pendingComponent: () => <Loading fullscreen />,
  shellComponent({ children }) {
    return (
      <Providers>
        <div
          className={classNames(
            "font-montserrat text-sm bg-white dark:bg-zinc-900"
          )}
        >
          <Header />
          <div className="min-h-screen bg-black/95 text-white">
            <main className="pt-16">{children}</main>
          </div>
          <Footer />
        </div>
      </Providers>
    );
  },
  codeSplitGroupings: [
    ["component", "loader", "errorComponent", "notFoundComponent"],
  ],
  errorComponent: ({ error }) => (
    <div>
      Error: {error.message}, <a href="/">Go Home</a>
    </div>
  ),
});
