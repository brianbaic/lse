type HeroCardProps = {
  title?: string
  subtitle?: string
  ctaText?: string
}

const stats = [
  { label: 'Components parsed', value: '128' },
  { label: 'Tailwind classes', value: '4,392' },
  { label: 'Average save time', value: '42ms' },
]

const features = [
  'Class inspector with direct source updates',
  'Live preview powered by your real component logic',
  'Local-first workflow, no cloud lock-in',
  'Friendly for large React + Tailwind codebases',
]

const cards = [
  {
    id: 'starter-kit',
    title: 'Starter Kits',
    description: 'Launch production-ready sections with editable schemas already attached.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'brand-system',
    title: 'Brand System',
    description: 'Control typography, spacing, and color tokens while preserving code patterns.',
    image:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'team-flow',
    title: 'Team Flow',
    description: 'Designers and engineers collaborate on one source of truth without drift.',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
  },
]

export default function HeroCard({
  title = 'Design visually. Keep code canonical.',
  subtitle = 'Edit meaningful UI quickly while preserving real component behavior, structure, and source control workflows.',
  ctaText = 'Open Component',
}: HeroCardProps) {
  return (
    <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Visual Editor Playground
          </p>

          <h1 data-schema-id="title" data-editable-field="title" className="cursor-pointer text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl hover:opacity-75 transition">{title}</h1>

          <p data-schema-id="subtitle" data-editable-field="subtitle" className="cursor-pointer max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg hover:opacity-75 transition">{subtitle}</p>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
              <span data-schema-id="ctaText" data-editable-field="ctaText" className="cursor-pointer hover:opacity-75 transition inline-block">{ctaText}</span>
            </button>
            <button className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
              View Source
            </button>
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {stats.map((item) => (
              <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">What you can edit</h2>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Tip</p>
            <p className="mt-1 text-sm text-amber-900">
              Click any JSX node in the class inspector and tweak its utility classes to see immediate source-backed updates.
            </p>
          </div>
        </aside>
      </div>

      <div data-ve-id="cards-grid" className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img src={card.image} alt={card.title} data-schema-id={`card-${card.id}-image`} data-editable-field="image" data-item-id={card.id} className="cursor-pointer h-36 w-full object-cover hover:opacity-75 transition" />
            <div className="p-4">
              <h3 data-schema-id={`card-${card.id}-title`} data-editable-field="title" data-item-id={card.id} className="cursor-pointer text-base font-semibold text-slate-900 hover:opacity-75 transition">{card.title}</h3>
              <p data-schema-id={`card-${card.id}-description`} data-editable-field="description" data-item-id={card.id} className="cursor-pointer mt-2 text-sm leading-relaxed text-slate-600 hover:opacity-75 transition">{card.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}