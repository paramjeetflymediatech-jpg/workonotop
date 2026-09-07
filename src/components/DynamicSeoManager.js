'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function DynamicSeoManager() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return

    let isMounted = true

    const updateSeo = async () => {
      try {
        const res = await fetch(`/api/seo?path=${encodeURIComponent(pathname)}`)
        if (!res.ok) return
        const text = await res.text()
        if (!text) return
        const json = JSON.parse(text)

        if (!isMounted) return

        if (json.success && json.seo) {
          const seo = json.seo

          // 1. Title
          if (seo.title) {
            document.title = seo.title
          }

          // Helper to safely set meta attributes
          const setMeta = (name, content, isProperty = false) => {
            if (!content) return
            const attr = isProperty ? 'property' : 'name'
            let el = document.querySelector(`meta[${attr}="${name}"]`)
            if (!el) {
              el = document.createElement('meta')
              el.setAttribute(attr, name)
              document.head.appendChild(el)
            }
            el.setAttribute('content', content)
          }

          // 2. Standard Meta Tags
          setMeta('description', seo.description)
          setMeta('keywords', seo.keywords)
          setMeta('robots', seo.robots)
          setMeta('googlebot', `${seo.robots}, max-video-preview:-1, max-image-preview:large, max-snippet:-1`)

          // 3. OpenGraph Tags
          setMeta('og:title', seo.ogTitle || seo.title, true)
          setMeta('og:description', seo.ogDescription || seo.description, true)
          setMeta('og:url', seo.canonical, true)
          setMeta('og:site_name', 'WorkOnTap', true)
          setMeta('og:type', pathname.includes('/blogs/') ? 'article' : 'website', true)
          if (seo.ogImage) setMeta('og:image', seo.ogImage, true)

          // 4. Twitter Cards
          setMeta('twitter:card', 'summary_large_image')
          setMeta('twitter:title', seo.ogTitle || seo.title)
          setMeta('twitter:description', seo.ogDescription || seo.description)
          if (seo.ogImage) setMeta('twitter:image', seo.ogImage)

          // 5. Canonical link
          if (seo.canonical) {
            let link = document.querySelector('link[rel="canonical"]')
            if (!link) {
              link = document.createElement('link')
              link.setAttribute('rel', 'canonical')
              document.head.appendChild(link)
            }
            link.setAttribute('href', seo.canonical)
          }
        }
      } catch (err) {
        console.error('Error updating SEO dynamically on client navigation:', err)
      }
    }

    updateSeo()

    return () => {
      isMounted = false
    }
  }, [pathname])

  return null
}
