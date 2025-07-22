import { createFileRoute } from '@tanstack/react-router'
import { SearchFeature } from '@/lib/features/search/Search'
import { Suspense } from 'react'

export const Route = createFileRoute('/search')({
  validateSearch: {
    q: undefined as string | undefined,
  },
  component: () => (
    <div className="container mx-auto px-4 py-8">
      <Suspense>
        <SearchFeature />
      </Suspense>
    </div>
  ),
})