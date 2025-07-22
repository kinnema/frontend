import { createFileRoute } from '@tanstack/react-router'
import WatchPageFeature from '@/lib/features/watch/WatchPage'
import { Suspense } from 'react'

export const Route = createFileRoute('/dizi/$slug/$tmdbId/$season/$chapter')({
  validateSearch: {
    network: undefined as string | undefined,
  },
  component: () => {
    const { slug, tmdbId, season, chapter } = Route.useParams()
    
    return (
      <div className="container mx-auto px-4 py-8">
        <Suspense>
          <WatchPageFeature
            params={{
              slug,
              tmdbId,
              season,
              chapter,
            }}
          />
        </Suspense>
      </div>
    )
  },
})