import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingFormSidebar from '@/components/BookingFormSidebar'
import db from '@/lib/db'
import { getSeoForPath } from '@/lib/seo'

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const seo = await getSeoForPath('/blogs');

  return {
    title: seo.title || 'WorkOnTap Blog | Home Maintenance & Trades Insights',
    description: seo.description || 'Discover the latest home service tips, industry trends, and insights from our expert team.',
    keywords: seo.keywords || 'blogs, home services blog, maintenance tips, vancouver trades',
    alternates: {
      canonical: seo.canonical || 'https://workontap.com/blogs',
    },
    openGraph: {
      title: seo.ogTitle || seo.title || 'WorkOnTap Blog',
      description: seo.ogDescription || seo.description,
      url: seo.canonical || 'https://workontap.com/blogs',
      siteName: 'WorkOnTap',
      type: 'website',
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle || seo.title || 'WorkOnTap Blog',
      description: seo.ogDescription || seo.description,
      images: seo.ogImage ? [seo.ogImage] : [],
    },
  };
}

async function getBlogs() {
  try {
    const rows = await db.query('SELECT * FROM blogs WHERE is_published = 1 ORDER BY created_at DESC')
    return rows || []
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
}

export default async function BlogsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const currentPage = parseInt(resolvedSearchParams?.page) || 1
  const PAGE_SIZE = 6

  const allBlogs = await getBlogs()
  const totalPages = Math.ceil(allBlogs.length / PAGE_SIZE)
  
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const blogs = allBlogs.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50 pb-20">
        {/* Beautiful Hero Section */}
        <div className="relative bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 mb-12 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-green-500/20 blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
            <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-teal-500/20 blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-green-300 text-sm font-semibold tracking-wider uppercase mb-4 backdrop-blur-sm border border-white/10">Insights & News</span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300">Blog</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              Discover the latest home service tips, industry trends, and insights from our expert team.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Blog Grid */}
          <div className="flex-grow lg:w-2/3">
            {blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blogs.map((blog) => (
                    <Link href={`/blogs/${blog.slug || blog.id}`} key={blog.id} className="group flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-1.5">
                      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                        {blog.image_url ? (
                          <img
                            src={blog.image_url}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-green-700 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                            Article
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow relative">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          <span>{new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="truncate">By {blog.author || 'Admin'}</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {blog.title}
                        </h2>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                          {blog.meta_description || 'Click to read more about this topic...'}
                        </p>
                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center text-green-600 text-sm font-medium group-hover:text-green-700">
                          Read Article 
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center items-center gap-2">
                    {currentPage > 1 && (
                      <Link href={`/blogs?page=${currentPage - 1}`} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition">
                        Previous
                      </Link>
                    )}
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1;
                        if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                          return (
                            <Link 
                              key={pageNum} 
                              href={`/blogs?page=${pageNum}`}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                                currentPage === pageNum ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-green-600'
                              }`}
                            >
                              {pageNum}
                            </Link>
                          );
                        } else if (
                          (pageNum === currentPage - 2 && pageNum > 1) || 
                          (pageNum === currentPage + 2 && pageNum < totalPages)
                        ) {
                          return <span key={pageNum} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    {currentPage < totalPages && (
                      <Link href={`/blogs?page=${currentPage + 1}`} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition">
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" /></svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-500">Check back later for new updates and insights.</p>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-1/3">
            <BookingFormSidebar />
          </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
