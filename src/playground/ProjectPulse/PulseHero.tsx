export default function PulseHero() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-slate-50 p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" data-schema-id="pulse-badge" data-editable-field="text">
          Project Pulse
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black text-slate-900 md:text-5xl" data-schema-id="pulse-hero-title" data-editable-field="text">
          Turn product updates into polished landing sections in one editing pass.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600" data-schema-id="pulse-hero-subtitle" data-editable-field="text">
          Pulse focuses on conversion-first blocks that are easy to remix visually while preserving clean source files.
        </p>
      </div>
    </section>
  )
}
