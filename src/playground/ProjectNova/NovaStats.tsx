const stats = [
  { id: 'teams', label: 'Teams Shipping Weekly', value: '240+' },
  { id: 'speed', label: 'Avg. Build Acceleration', value: '3.7x' },
  { id: 'savings', label: 'Dev Hours Saved / Month', value: '1,900' },
  { id: 'quality', label: 'Design Defect Reduction', value: '62%' },
]

export default function NovaStats() {
  return (
    <section className="border-y border-slate-200 bg-white px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
            <p className="text-3xl font-black text-slate-900" data-schema-id={`nova-stat-${item.id}-value`} data-editable-field="value" data-item-id={item.id}>{item.value}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" data-schema-id={`nova-stat-${item.id}-label`} data-editable-field="label" data-item-id={item.id}>{item.label}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
