import { useEffect, useState, useTransition, useCallback } from 'react'
import {
  ShoppingCart,
  Plus,
  RefreshCw,
  AlertCircle,
  PackageCheck,
  Layers,
  Calendar,
  FileText
} from 'lucide-react'
import { fetchSalesOrders } from '../services/salesOrders'

function formatCurrency(amount) {
  if (amount == null) return '0,00€'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(Number(amount))
}

function formatDate(dateString) {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

function getStatusBadge(status) {
  const map = {
    confirmed: {
      label: 'Confirmed',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10',
      dot: 'bg-emerald-500',
    },
    in_production: {
      label: 'In Production',
      classes: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10',
      dot: 'bg-amber-500',
    },
    delivered: {
      label: 'Delivered',
      classes: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/10',
      dot: 'bg-sky-500',
    },
    draft: {
      label: 'Draft',
      classes: 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-500/10',
      dot: 'bg-slate-400',
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/10',
      dot: 'bg-rose-500',
    },
  }

  const config = map[status] || {
    label: status || 'Unknown',
    classes: 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-400/10',
    dot: 'bg-slate-400',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.classes}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  )
}

function getItemTypeBadge(type) {
  if (type === 'finished_good') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-[#193b35]/10 px-2 py-0.5 text-xs font-semibold text-[#193b35]">
        <PackageCheck size={12} className="text-[#193b35]" />
        Finished Good
      </span>
    )
  }

  if (type === 'semi_finished') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-[#e69c78]/20 px-2 py-0.5 text-xs font-semibold text-[#8f4724]">
        <Layers size={12} className="text-[#8f4724]" />
        Semi-Finished
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      {type || 'Unknown'}
    </span>
  )
}

function SalesOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [, startTransition] = useTransition()

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchSalesOrders()
      startTransition(() => {
        setOrders(data)
      })
    } catch (err) {
      console.error(err)
      setError('Failed to load sales orders. Please check your Supabase connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function init() {
      try {
        const data = await fetchSalesOrders()
        if (!ignore) {
          startTransition(() => {
            setOrders(data)
            setLoading(false)
          })
        }
      } catch (err) {
        if (!ignore) {
          console.error(err)
          setError('Failed to load sales orders. Please check your Supabase connection.')
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#193b35] text-white shadow-xs">
              <ShoppingCart size={19} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales Orders</h1>
          </div>
          <p className="text-sm text-slate-500">
            Track and manage customer sales orders for finished and semi-finished products.
          </p>
        </div>

        {/* Buttons Section */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            title="Refresh Orders"
            className="inline-flex h-9.5 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="inline-flex h-9.5 items-center gap-2 rounded-lg bg-[#193b35] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#234f47] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193b35]"
          >
            <Plus size={15} />
            <span>New Sales Order</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-md bg-rose-100 px-3 py-1 text-xs font-medium text-rose-900 hover:bg-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main section */}
      <section
        aria-label="Sales Orders Table"
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                <th scope="col" className="px-5 py-3.5">
                  Order #
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Customer
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Product / Item
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Classification
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Quantity
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Unit Price
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Total Value
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Dates
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && orders.length === 0 ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-32 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-40 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-24 rounded-full bg-slate-200" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-4 w-12 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-4 w-16 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-4 w-20 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-20 rounded-full bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <FileText size={24} />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-800">No sales orders found</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      There are currently no sales orders in your database.
                    </p>
                  </td>
                </tr>
              ) : (
                // Data Rows
                orders.map((order) => {
                  const item = order.item || {}
                  const uom = item.unit_of_measure || 'pcs'

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-[#f7faf5]/80"
                    >
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-[#193b35]">
                        <span className="rounded-md bg-slate-100/90 px-2 py-1 text-slate-900 ring-1 ring-slate-200/60">
                          {order.order_number}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#193b35]/10 text-xs font-bold text-[#193b35]">
                            {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <span className="font-medium text-slate-900">
                            {order.customer_name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{item.name || 'Unknown Item'}</div>
                        <div className="font-mono text-xs text-slate-400">{item.code || '—'}</div>
                      </td>

                      <td className="px-5 py-4">
                        {getItemTypeBadge(item.type)}
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-slate-800">
                        {Number(order.quantity).toLocaleString()} <span className="text-xs text-slate-400">{uom}</span>
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-xs text-slate-600">
                        {formatCurrency(order.unit_price)}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-sm font-bold text-[#193b35]">
                        {formatCurrency(order.total_value)}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{formatDate(order.order_date)}</span>
                        </div>
                        {order.delivery_date && (
                          <div className="mt-0.5 text-[11px] text-slate-400">
                            Due: {formatDate(order.delivery_date)}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {orders.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
            <span>
              Total: <strong className="text-slate-700">{orders.length}</strong> sales {orders.length > 1 ? 'orders' : 'order'}
            </span>
            <div className="flex items-center gap-4">
              <span>
                Portfolio Value:{' '}
                <strong className="font-mono font-semibold text-[#193b35]">
                  {formatCurrency(orders.reduce((sum, o) => sum + Number(o.total_value || 0), 0))}
                </strong>
              </span>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default SalesOrders