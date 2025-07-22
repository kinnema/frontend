import { createFileRoute, Outlet } from '@tanstack/react-router'

// This layout will handle parallel routes for modals
export const Route = createFileRoute('/_layout')({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})