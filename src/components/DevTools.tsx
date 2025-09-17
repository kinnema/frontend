import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AnyRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface DevToolsProps {
  router: AnyRouter;
}

export default function DevTools({ router }: DevToolsProps) {
  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools router={router} />
    </>
  );
}
