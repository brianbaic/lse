const quotes = [
  {
    id: 'maya',
    quote: 'We went from static mocks to production-ready pages in one afternoon.',
    name: 'Maya Tran',
    role: 'Design Lead, Octarine',
  },
  {
    id: 'leo',
    quote: 'This finally made component-level editing intuitive for non-engineers.',
    name: 'Leo Carter',
    role: 'Staff Engineer, Northline',
  },
]

export default function NovaTestimonials() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-black text-slate-900" data-schema-id="nova-testimonials-title" data-editable-field="text">Loved by teams that ship fast</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {quotes.map((quote) => (
            <blockquote key={quote.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-base leading-relaxed text-slate-700" data-schema-id={`nova-quote-${quote.id}-quote`} data-editable-field="quote" data-item-id={quote.id}>
                “{quote.quote}”
              </p>
              <footer className="mt-4">
                <p className="text-sm font-bold text-slate-900" data-schema-id={`nova-quote-${quote.id}-name`} data-editable-field="name" data-item-id={quote.id}>{quote.name}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500" data-schema-id={`nova-quote-${quote.id}-role`} data-editable-field="role" data-item-id={quote.id}>{quote.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
