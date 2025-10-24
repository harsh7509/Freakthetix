/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Either use "domains" or "remotePatterns". Patterns are safer for subpaths.
    remotePatterns: [
      { protocol: 'https', hostname: 't4.ftcdn.net' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'allofficials.in' },
      // add any other hosts you use for product images:
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

module.exports = nextConfig;
