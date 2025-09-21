import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/sync/relays')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/settings/sync/relays"!</div>
}
