export default function NovaHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(20,184,166,0.32),transparent_40%)]" />
      <div className="relative mx-auto max-w-6xl">
        <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">Project Nova</p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl" data-schema-id="nova-hero-title" data-editable-field="text">
          Build launch-ready product stories in minutes, not sprints.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-200" data-schema-id="nova-hero-subtitle" data-editable-field="text">
          A visual-first editing environment for modern React teams that want velocity without sacrificing source quality.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950" data-schema-id="nova-hero-primary" data-editable-field="text">Start Designing</button>
          <button className="rounded-lg border border-white/40 px-5 py-3 text-sm font-bold" data-schema-id="nova-hero-secondary" data-editable-field="text">See Case Study</button>
        </div>
      </div>
    </section>
  )
}
