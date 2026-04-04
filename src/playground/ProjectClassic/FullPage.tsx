import HeroCard from './HeroCard'
import FeatureCard from './FeatureCard'
import PricingCard from './PricingCard'

export default function FullPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroCard />
      <div className="bg-slate-50 border-t border-slate-200">
        <FeatureCard />
      </div>
      <div className="bg-white border-t border-slate-200">
        <PricingCard />
      </div>
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">Built with code as the source of truth.</p>
          <p className="text-slate-400 text-sm">© 2026 Visual Editor. Edit anything on this page directly.</p>
        </div>
      </footer>
    </div>
  )
}
