import NovaHero from './NovaHero'
import NovaStats from './NovaStats'
import NovaShowcase from './NovaShowcase'
import NovaTestimonials from './NovaTestimonials'
import NovaCta from './NovaCta'

export default function FullPage() {
  return (
    <div className="min-h-screen bg-white">
      <NovaHero />
      <NovaStats />
      <NovaShowcase />
      <NovaTestimonials />
      <NovaCta />
    </div>
  )
}
