const milestones = [
  { id: 'week1', label: 'Week 1', text: 'Define offer and narrative hierarchy.' },
  { id: 'week2', label: 'Week 2', text: 'Design and edit production components visually.' },
  { id: 'week3', label: 'Week 3', text: 'Ship, test variants, and iterate on real traffic.' },
]

export default function PulseTimeline() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-black text-slate-900" data-schema-id="pulse-timeline-title" data-editable-field="text">From brief to launch in three weeks</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {milestones.map((step) => (
            <article key={step.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500" data-schema-id={`pulse-step-${step.id}-label`} data-editable-field="label" data-item-id={step.id}>{step.label}</p>
              <p className="mt-2 text-sm text-slate-700" data-schema-id={`pulse-step-${step.id}-text`} data-editable-field="text" data-item-id={step.id}>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
