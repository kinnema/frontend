import NextPwa from 'next-pwa';
const revision = crypto.randomUUID();


const withPWA = NextPwa({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  additionalManifestEntries: [{ url: "/~offline", revision }],
  navigateFallback: "/offline"
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
