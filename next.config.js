/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  headers: async () => {
    return [
      {
        source: '/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
  webpack: (config) => {
    // Ensure @mui/material can find the correct react-is package during the build.
    // Some bundlers (like Next.js with the new app router) may try to resolve the
    // module from a nested path such as `@mui/material/node_modules/react-is`,
    // which does not exist when packages are hoisted. The alias below guarantees
    // that any such request is redirected to the top-level `react-is` package.
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@mui/material/node_modules/react-is": require.resolve("react-is"),
    }

    return config
  }
}

module.exports = nextConfig 