import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./lib/i18n";
import { initializeLocalPlugins } from "./lib/plugins/local";
import { isElectron } from "./lib/utils/native";
import { routeTree } from "./routeTree.gen";

initializeLocalPlugins();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const history = isElectron() ? createHashHistory() : createBrowserHistory();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  history,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const DevTools = import.meta.env.DEV
  ? React.lazy(() => import("./components/DevTools"))
  : null;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {DevTools && (
        <Suspense fallback={null}>
          <DevTools router={router} />
        </Suspense>
      )}
    </QueryClientProvider>
  </React.StrictMode>
);
