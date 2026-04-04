export default function OrbitFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>Orbit UI, Austin TX</p>
        <div className="flex gap-4">
          <a className="hover:text-slate-900" href="#">Docs</a>
          <a className="hover:text-slate-900" href="#">Changelog</a>
          <a className="hover:text-slate-900" href="#">Status</a>
        </div>
      </div>
    </footer>
  )
}
