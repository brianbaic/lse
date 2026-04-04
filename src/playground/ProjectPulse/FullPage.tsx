import PulseHero from './PulseHero'
import PulseFeatures from './PulseFeatures'
import PulseTimeline from './PulseTimeline'
import PulseFooter from './PulseFooter'

export default function FullPage() {
  return (
    <div className="min-h-screen bg-white">
      <PulseHero />
      <PulseFeatures />
      <PulseTimeline />
      <PulseFooter />
    </div>
  )
}
