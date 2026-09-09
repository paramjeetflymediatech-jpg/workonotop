import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingFormSidebar from '@/components/BookingFormSidebar'
import db from '@/lib/db'
import { getSeoForPath } from '@/lib/seo'

export const dynamic = 'force-dynamic';

// Dynamically generate SEO metadata for the blog post
export async function generateMetadata({ params }) {
  const { id } = await params
  const seo = await getSeoForPath(`/blogs/${id}`)
  
  try {
    const rows = await db.query(
      'SELECT * FROM blogs WHERE (id = ? OR slug = ?) AND is_published = 1 LIMIT 1',
      [id, id]
    )
    
    if (!rows || rows.length === 0) {
      return {
        title: seo.title || 'Blog Not Found | WorkOnTap',
        description: seo.description || 'The requested article could not be found.',
      }
    }

    const blog = rows[0]
    const title = blog.meta_title || seo.title || `${blog.title} | WorkOnTap Blog`
    const description = blog.meta_description || seo.description || blog.short_content || blog.title
    const keywords = blog.keywords || seo.keywords || ''
    const ogImage = blog.og_image || blog.image_url || seo.ogImage
    const canonical = blog.canonical_url || seo.canonical || `https://workontap.com/blogs/${blog.slug || blog.id}`
    
    return {
      title,
      description,
      keywords,
      alternates: {
        canonical,
      },
      openGraph: {
        title: blog.og_title || seo.ogTitle || title,
        description: blog.og_description || seo.ogDescription || description,
        images: ogImage ? [{ url: ogImage }] : [],
        type: 'article',
        publishedTime: blog.created_at,
        authors: [blog.author || 'WorkOnTap Team'],
        url: canonical,
        siteName: 'WorkOnTap',
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.og_title || seo.ogTitle || title,
        description: blog.og_description || seo.ogDescription || description,
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch (error) {
    return {
      title: seo.title || 'Blog Article | WorkOnTap',
      description: seo.description,
    }
  }
}

async function getBlog(id) {
  try {
    const rows = await db.query(
      'SELECT * FROM blogs WHERE (id = ? OR slug = ?) AND is_published = 1 LIMIT 1',
      [id, id]
    )
    return rows && rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error('Error fetching single blog:', error)
    return null
  }
}

export default async function SingleBlogPage({ params }) {
  const { id } = await params
  const blog = await getBlog(id)

  if (!blog) {
    notFound()
  }

  // Define custom styles for CKEditor content
  const contentStyles = `
    .ck-content {
      line-height: 1.7;
      color: #374151;
      font-size: 1.125rem;
    }
    .ck-content h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
    }
    .ck-content h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    .ck-content p {
      margin-bottom: 1.25rem;
    }
    .ck-content ul {
      list-style-type: disc;
      padding-left: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .ck-content ol {
      list-style-type: decimal;
      padding-left: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .ck-content li {
      margin-bottom: 0.5rem;
    }
    .ck-content a {
      color: #059669;
      text-decoration: underline;
    }
    .ck-content blockquote {
      border-left: 4px solid #10b981;
      padding-left: 1rem;
      font-style: italic;
      color: #4b5563;
      background-color: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 1.5rem 0;
    }
    .ck-content img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1.5rem 0;
    }
  `

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50 pb-20">
        {/* Full-width Hero Banner */}
        <div className="w-full relative bg-gray-900 pt-24 pb-48 px-4 sm:px-6 lg:px-8">
          {blog.image_url && (
            <>
              <div className="absolute inset-0 z-0">
                <img 
                  src={blog.image_url} 
                  alt={blog.title} 
                  className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
              </div>
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
            </>
          )}
          
          <div className="relative z-10 max-w-4xl mx-auto text-center mt-8">
            <div className="flex justify-center items-center gap-3 text-sm text-green-300 font-bold uppercase tracking-widest mb-6">
              <span className="px-3 py-1 bg-green-900/50 rounded-full border border-green-700/50 backdrop-blur-sm">Article</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              {blog.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-300 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {blog.author?.charAt(0) || 'A'}
                </div>
                <span className="text-white">{blog.author || 'Admin'}</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
              <time dateTime={blog.created_at}>
                {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
          </div>
        </div>

        {/* Content Section (Overlapping) */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column: Article */}
            <div className="flex-grow lg:w-2/3">
              <article className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12 lg:p-16">
                
                <Link href="/blogs" className="text-gray-400 hover:text-green-600 font-bold text-sm inline-flex items-center group mb-10 transition-colors uppercase tracking-wider">
                  <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to Articles
                </Link>

                {/* Content (from CKEditor) */}
                <div 
                  className="ck-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-green-600 hover:prose-a:text-green-500 prose-img:rounded-2xl prose-img:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </article>
            </div>

            {/* Right Column: Sidebar */}
            <div className="w-full lg:w-1/3">
              <BookingFormSidebar />
            </div>
          </div>
        </div>

        {/* Custom Styles Injection */}
        <style dangerouslySetInnerHTML={{ __html: contentStyles }} />
        
        {/* Header/Footer Custom Scripts (from SEO) */}
        {blog.header_scripts && (
          <div dangerouslySetInnerHTML={{ __html: blog.header_scripts }} />
        )}
        {blog.footer_scripts && (
          <div dangerouslySetInnerHTML={{ __html: blog.footer_scripts }} />
        )}
      </main>

      <Footer />
    </div>
  )
}
