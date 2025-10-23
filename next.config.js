/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 't4.ftcdn.net' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'allofficials.in' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // add any other host serving images
    ],
  },
  experimental: {
    // if you use Mongoose, keep nodejs runtime pages as you did
  },
};

module.exports = nextConfig;
