const cards = [
  {
    id: 'orbit-card-1',
    title: 'Component Blocks',
    description: 'Composable building blocks with shared spacing and typography rules.',
  },
  {
    id: 'orbit-card-2',
    title: 'Token Engine',
    description: 'Colors, type scales, and elevation semantics synchronized across projects.',
  },
  {
    id: 'orbit-card-3',
    title: 'Live Hand-off',
    description: 'Design decisions map directly to code with no parallel source of truth.',
  },
]

export default function OrbitGallery() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-5 px-6 py-14 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
