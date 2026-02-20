import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HowItWorksPage() {
  const steps = [
    {
      icon: "🔍",
      title: "1. Find a Service",
      description: "Search for what you need or browse our categories. See transparent pricing and verified reviews."
    },
    {
      icon: "📅",
      title: "2. Choose Date & Time",
      description: "Select a convenient time slot. Morning, afternoon, or evening - whatever works for you."
    },
    {
      icon: "📝",
      title: "3. Describe Your Job",
      description: "Tell us what needs to be done. Add photos to help the pro come prepared."
    },
    {
      icon: "✅",
      title: "4. Get Matched",
      description: "We'll connect you with a trusted pro. You'll get instant confirmation."
    },
    {
      icon: "👨‍🔧",
      title: "5. Pro Arrives",
      description: "Your pro shows up at the scheduled time and completes the work."
    },
    {
      icon: "💚",
      title: "6. Pay & Review",
      description: "Pay securely after you're satisfied. Leave a review to help others."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Get your home projects done in 6 simple steps
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl">
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}