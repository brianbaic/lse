const cards = [
  {
    id: 'handoff',
    title: 'Zero-Drift Handoff',
    description: 'Design and engineering update the exact same source artifacts in real time.',
  },
  {
    id: 'guardrails',
    title: 'Built-In Guardrails',
    description: 'Your team can move fast while preserving class patterns, variants, and structure.',
  },
  {
    id: 'ai',
    title: 'AI-Assisted Refinement',
    description: 'Generate alternatives and apply edits directly where your components live.',
  },
]

export default function NovaShowcase() {
  return (
    <section className="bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-black text-slate-900" data-schema-id="nova-showcase-title" data-editable-field="text">Why teams switch to visual-first coding</h2>
        <p className="mt-3 max-w-3xl text-slate-600" data-schema-id="nova-showcase-subtitle" data-editable-field="text">All the leverage of component systems, with none of the handoff friction.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900" data-schema-id={`nova-card-${card.id}-title`} data-editable-field="title" data-item-id={card.id}>{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600" data-schema-id={`nova-card-${card.id}-description`} data-editable-field="description" data-item-id={card.id}>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
