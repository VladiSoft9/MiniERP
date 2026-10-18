import { useMemo } from 'react'
import { TrendingUp, Clock, PackageCheck, Layers } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

function SalesOrdersKpi({ orders = [], loading = false }) {
  const stats = useMemo(() => {
    const totalValue = orders.reduce((sum, o) => sum + Number(o.total_value || 0), 0)
    const totalOrders = orders.length

    const finishedOrders = orders.filter((o) => o.item?.type === 'finished_good')
    const semiFinishedOrders = orders.filter((o) => o.item?.type === 'semi_finished')

    const finishedValue = finishedOrders.reduce((sum, o) => sum + Number(o.total_value || 0), 0)
    const semiFinishedValue = semiFinishedOrders.reduce((sum, o) => sum + Number(o.total_value || 0), 0)

    const activeOrders = orders.filter(
      (o) => o.status === 'confirmed' || o.status === 'in_production'
    )
    const activeValue = activeOrders.reduce((sum, o) => sum + Number(o.total_value || 0), 0)

    return {
      totalValue,
      totalOrders,
      finishedCount: finishedOrders.length,
      finishedValue,
      semiFinishedCount: semiFinishedOrders.length,
      semiFinishedValue,
      activeCount: activeOrders.length,
      activeValue,
    }
  }, [orders])

  return (
    <section
      aria-label="Sales Orders KPI Summary"
      className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {/* Card 1: Total Portfolio Value */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#193b35]/30 hover:shadow-lg hover:shadow-[#193b35]/8 cursor-default">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d4e8a8] via-[#e69c78] to-transparent transition-all duration-300 group-hover:h-1.5" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 transition-colors group-hover:text-slate-700">
              Portfolio Revenue
            </p>
            <h2 className="mt-1 font-mono text-2xl font-bold tracking-tight text-[#193b35] transition-transform duration-300 group-hover:scale-[1.02] origin-left">
              {loading && orders.length === 0 ? '...' : formatCurrency(stats.totalValue)}
            </h2>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#193b35]/8 text-[#193b35] ring-1 ring-[#193b35]/15 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#193b35] group-hover:text-white group-hover:ring-[#193b35] group-hover:shadow-md group-hover:shadow-[#193b35]/20">
            <TrendingUp size={22} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{stats.totalOrders}</span>
          <span>total registered {stats.totalOrders === 1 ? 'order' : 'orders'}</span>
        </div>
      </div>

      {/* Card 2: Active Pipeline */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10 cursor-default">
        <div className="absolute inset-x-0 top-0 h-1 bg-amber-400/80 transition-all duration-300 group-hover:h-1.5 group-hover:bg-amber-400" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 transition-colors group-hover:text-slate-700">
              Active Pipeline
            </p>
            <h2 className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-900 transition-transform duration-300 group-hover:scale-[1.02] origin-left">
              {loading && orders.length === 0 ? '...' : stats.activeCount}
              <span className="ml-1 text-sm font-normal text-slate-400">
                {stats.activeCount === 1 ? 'order' : 'orders'}
              </span>
            </h2>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white group-hover:ring-amber-500 group-hover:shadow-md group-hover:shadow-amber-500/25">
            <Clock size={22} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-mono font-semibold text-amber-700">
            {formatCurrency(stats.activeValue)}
          </span>
          <span>in confirmed / production</span>
        </div>
      </div>

      {/* Card 3: Finished Goods */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#193b35]/30 hover:shadow-lg hover:shadow-[#193b35]/8 cursor-default">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#193b35] transition-all duration-300 group-hover:h-1.5 group-hover:bg-[#234f47]" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 transition-colors group-hover:text-slate-700">
              Finished Goods
            </p>
            <h2 className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-900 transition-transform duration-300 group-hover:scale-[1.02] origin-left">
              {loading && orders.length === 0 ? '...' : stats.finishedCount}
              <span className="ml-1 text-sm font-normal text-slate-400">
                {stats.finishedCount === 1 ? 'order' : 'orders'}
              </span>
            </h2>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#193b35]/8 text-[#193b35] ring-1 ring-[#193b35]/15 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#193b35] group-hover:text-white group-hover:ring-[#193b35] group-hover:shadow-md group-hover:shadow-[#193b35]/20">
            <PackageCheck size={22} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-mono font-semibold text-[#193b35]">
            {formatCurrency(stats.finishedValue)}
          </span>
          <span>gross sales</span>
        </div>
      </div>

      {/* Card 4: Semi-Finished Goods */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#e69c78]/60 hover:shadow-lg hover:shadow-[#e69c78]/12 cursor-default">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#e69c78] transition-all duration-300 group-hover:h-1.5 group-hover:bg-[#d88761]" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 transition-colors group-hover:text-slate-700">
              Semi-Finished
            </p>
            <h2 className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-900 transition-transform duration-300 group-hover:scale-[1.02] origin-left">
              {loading && orders.length === 0 ? '...' : stats.semiFinishedCount}
              <span className="ml-1 text-sm font-normal text-slate-400">
                {stats.semiFinishedCount === 1 ? 'order' : 'orders'}
              </span>
            </h2>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e69c78]/20 text-[#8f4724] ring-1 ring-[#e69c78]/40 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#8f4724] group-hover:text-white group-hover:ring-[#8f4724] group-hover:shadow-md group-hover:shadow-[#8f4724]/20">
            <Layers size={22} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-mono font-semibold text-[#8f4724]">
            {formatCurrency(stats.semiFinishedValue)}
          </span>
          <span>gross sales</span>
        </div>
      </div>
    </section>
  )
}

export default SalesOrdersKpi
