const stats = [
  { id: 'orbit-stat-1', label: 'Faster delivery', value: '42%' },
  { id: 'orbit-stat-2', label: 'Reuse rate', value: '88%' },
  { id: 'orbit-stat-3', label: 'Design debt down', value: '31%' },
  { id: 'orbit-stat-4', label: 'Team satisfaction', value: '94%' },
]

export default function OrbitStats() {
  return (
    <section className="bg-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">A measurable design velocity boost</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
