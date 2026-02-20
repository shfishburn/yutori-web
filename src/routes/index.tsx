import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white">
            Thermal wellness, measured.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Track sauna and cold plunge sessions with sensors, see trends over time,
            and get safety-forward guidance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950"
            >
              Shop products
            </Link>
            <a
              href="#app"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white"
            >
              Learn about the app
            </a>
          </div>
        </div>

        <div id="app" className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
            <div className="text-white font-semibold">Saunas</div>
            <div className="mt-2 text-sm text-slate-300">Heat sessions with temperature tracking.</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
            <div className="text-white font-semibold">Cold plunges</div>
            <div className="mt-2 text-sm text-slate-300">Cold exposure sessions with context.</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
            <div className="text-white font-semibold">Sensors + app</div>
            <div className="mt-2 text-sm text-slate-300">Pair sensors and see your history.</div>
          </div>
        </div>
      </section>
    </main>
  )
}
