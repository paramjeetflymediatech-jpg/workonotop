'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function BookingGuide() {
  const steps = [
    {
      icon: "🔍",
      title: "1. Search for a service",
      description: "Type what you need in the search bar (e.g., 'ac repair', 'plumber'). Browse through available services and select the one that matches your needs."
    },
    {
      icon: "📅",
      title: "2. Choose date & time",
      description: "Pick a convenient date and time slot. You can choose from morning, afternoon, or evening slots based on availability."
    },
    {
      icon: "📝",
      title: "3. Describe your job",
      description: "Tell us more about what needs to be done. Add photos if you want - this helps the pro come prepared."
    },
    {
      icon: "✅",
      title: "4. Confirm booking",
      description: "Review your details and confirm. You'll get instant confirmation and can track everything in 'My Bookings'."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-b from-green-50 to-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/help" className="text-green-700 hover:underline mb-2 inline-block">
            ← Back to Help Center
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Booking Guide</h1>
          <p className="text-gray-600 mt-1">Learn how to book a service in 4 simple steps</p>
        </div>
      </div>

      {/* Steps */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{step.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-bold text-gray-900 mb-2">💡 Pro Tip</h3>
          <p className="text-gray-700">
            Book at least 24 hours in advance for best availability. You can always check real-time availability in the app!
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}