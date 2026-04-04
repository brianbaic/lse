const features = [
  {
    id: 'focus',
    title: 'Conversion Focus',
    description: 'Prebuilt sections optimized for message clarity and call-to-action flow.',
  },
  {
    id: 'speed',
    title: 'Fast Iteration',
    description: 'Edit text and structure visually while keeping source control confidence.',
  },
  {
    id: 'team',
    title: 'Cross-Team Friendly',
    description: 'Designers and developers can collaborate directly on production components.',
  },
]

export default function PulseFeatures() {
  return (
    <section className="bg-white px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-black text-slate-900" data-schema-id="pulse-features-title" data-editable-field="text">A toolkit built for launch teams</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900" data-schema-id={`pulse-feature-${feature.id}-title`} data-editable-field="title" data-item-id={feature.id}>{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600" data-schema-id={`pulse-feature-${feature.id}-description`} data-editable-field="description" data-item-id={feature.id}>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
