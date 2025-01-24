import NextPwa from 'next-pwa';
const revision = crypto.randomUUID();


const withPWA = NextPwa({
  dest: "public",
  register: true,
  additionalManifestEntries: [{ url: "/~offline", revision }],
  navigateFallback: "/offline",
  runtimeCaching: [
    {
      // Next.js sayfaları ve API route'ları için
      urlPattern: ({ url }) => {
        const isSameOrigin = self.origin === url.origin;
        if (!isSameOrigin) return false;
        return true;
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 // 1 saat
        }
      }
    },
    {
      // Next.js _next/image optimize edilmiş resimler
      urlPattern: /\/_next\/image\?.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 // 24 saat
        }
      }
    },
    {
      // Next.js _next/static dosyaları
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 yıl
        }
      }
    },
    {
      // TMDB API
      urlPattern: /^https:\/\/api\.tmdb\.org\/v3\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'tmdb-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 // 1 saat
        }
      }
    }
  ]
});


/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "image.tmdb.org",
        protocol: "https",
      },
    ]
  }
};

export default withPWA(nextConfig);
// export default nextConfig;
