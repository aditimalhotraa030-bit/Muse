import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.musebykashish.in'

  // Define static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/shop',
    '/new-arrivals',
    '/suits',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return [...routes]
}
