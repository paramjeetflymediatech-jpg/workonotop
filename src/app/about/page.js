import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About WorkOnTap</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Connecting trusted local tradespeople with homeowners since 2022
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-12">
          
          {/* Our Story */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              WorkOnTap was born from a simple idea: homeowners should be able to find trusted, 
              qualified tradespeople quickly and easily. What started as a small local service 
              in Calgary has grown into a platform connecting thousands of homeowners with 
              verified professionals across Canada.
            </p>
          </div>

          {/* Our Mission */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We're on a mission to take the stress out of home maintenance. By providing 
              transparent pricing, verified reviews, and guaranteed work, we help homeowners 
              feel confident in every booking.
            </p>
          </div>

          {/* Our Values */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="font-semibold text-gray-900 mb-2">Trust</h3>
                <p className="text-sm text-gray-600">Every pro is background-checked and verified</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality</h3>
                <p className="text-sm text-gray-600">We stand behind every job with our guarantee</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="text-3xl mb-3">💚</div>
                <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-sm text-gray-600">Supporting local tradespeople and homeowners</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 bg-green-50 p-8 rounded-2xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">500K+</div>
              <div className="text-sm text-gray-600">Jobs Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">5K+</div>
              <div className="text-sm text-gray-600">Trusted Pros</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">4.8★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}