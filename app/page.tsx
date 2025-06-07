import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Building2, CreditCard, MapPin, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl">Parity</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Efficient Tax Collection Management</h1>
              <p className="text-xl text-gray-600 mb-8">
                A comprehensive solution for tax authorities to manage collections, track payments, and monitor
                compliance - even offline.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<CreditCard className="h-10 w-10 text-emerald-600" />}
                title="Offline-First Collection"
                description="Record tax payments even without internet connectivity. Data syncs automatically when connection is restored."
              />
              <FeatureCard
                icon={<MapPin className="h-10 w-10 text-emerald-600" />}
                title="Real-time Tracking"
                description="Monitor collector locations and collection amounts in real-time when connected."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-emerald-600" />}
                title="Vendor Management"
                description="Easily register and manage vendors with comprehensive profiles and payment histories."
              />
              <FeatureCard
                icon={<BarChart3 className="h-10 w-10 text-emerald-600" />}
                title="Advanced Reporting"
                description="Generate detailed reports on collections, compliance, and performance metrics."
              />
              <FeatureCard
                icon={<Building2 className="h-10 w-10 text-emerald-600" />}
                title="Property Management"
                description="Track and manage properties associated with taxpayers for accurate assessment."
              />
              <FeatureCard
                icon={<CreditCard className="h-10 w-10 text-emerald-600" />}
                title="Secure Transactions"
                description="End-to-end encryption and comprehensive audit trails for all transactions."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <span className="font-bold">Parity</span>
            </div>
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} Parity. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
