import OrbitHero from './OrbitHero'
import OrbitGallery from './OrbitGallery'
import OrbitStats from './OrbitStats'
import OrbitCta from './OrbitCta'
import OrbitFooter from './OrbitFooter'

export default function FullPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <OrbitHero />
      <OrbitGallery />
      <OrbitStats />
      <OrbitCta />
      <OrbitFooter />
    </div>
  )
}
