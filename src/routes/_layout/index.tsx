import { createFileRoute } from '@tanstack/react-router'
import { HomeFeature } from '@/lib/features/home/HomeFeature'
import TmdbService from '@/lib/services/tmdb.service'
import { TmdbNetworks } from '@/lib/types/networks'
import { LoginModal } from '../../components/modals/LoginModal'
import { RegisterModal } from '../../components/modals/RegisterModal'
import { FavoritesModal } from '../../components/modals/FavoritesModal'
import { SerieModal } from '../../components/modals/SerieModal'
import { WatchModal } from '../../components/modals/WatchModal'
import { Suspense } from 'react'

// Modal search params validation
const modalSearchSchema = {
  modal: undefined as 'login' | 'register' | 'favorites' | undefined,
  serieSlug: undefined as string | undefined,
  serieTmdbId: undefined as string | undefined,
  watchSlug: undefined as string | undefined,
  watchTmdbId: undefined as string | undefined,
  watchSeason: undefined as string | undefined,
  watchChapter: undefined as string | undefined,
  watchNetwork: undefined as string | undefined,
}

export const Route = createFileRoute('/_layout/')({
  validateSearch: modalSearchSchema,
  loader: async ({ context: { queryClient } }) => {
    // Prefetch data for home page
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['home', 'blutv'],
        queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.BLUTV),
      }),
      queryClient.prefetchQuery({
        queryKey: ['home', 'gain'],
        queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.GAIN),
      }),
      queryClient.prefetchQuery({
        queryKey: ['home', 'exxen'],
        queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.EXXEN),
      }),
      queryClient.prefetchQuery({
        queryKey: ['home-data'],
        queryFn: () => TmdbService.fetchHomeData(),
      }),
    ])
  },
  component: () => {
    const { modal, serieSlug, serieTmdbId, watchSlug, watchTmdbId, watchSeason, watchChapter, watchNetwork } = Route.useSearch()
    
    return (
      <>
        <Suspense>
          <HomeFeature />
        </Suspense>
        
        {/* Modal rendering based on search params */}
        {modal === 'login' && <LoginModal />}
        {modal === 'register' && <RegisterModal />}
        {modal === 'favorites' && <FavoritesModal />}
        {serieSlug && serieTmdbId && (
          <SerieModal slug={serieSlug} tmdbId={parseInt(serieTmdbId)} />
        )}
        {watchSlug && watchTmdbId && watchSeason && watchChapter && (
          <WatchModal 
            slug={watchSlug} 
            tmdbId={watchTmdbId} 
            season={watchSeason} 
            chapter={watchChapter}
            network={watchNetwork}
          />
        )}
      </>
    )
  },
})