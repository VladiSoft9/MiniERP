import { useEffect, useState, useTransition, useCallback, useMemo } from 'react'
import {
  ShoppingCart,
  Plus,
  RefreshCw,
  AlertCircle,
  PackageCheck,
  Layers,
  Calendar,
  FileText,
  FilterX,
  X,
  CheckCircle2
} from 'lucide-react'
import { fetchSalesOrders } from '../services/salesOrders'
import { formatCurrency, formatDate } from '../utils/formatters'
import SalesOrdersKpi from './SalesOrdersKpi'
import SalesOrdersFilters from './SalesOrdersFilters'
import NewSalesOrderForm from './NewSalesOrderForm'

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
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [, startTransition] = useTransition()

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')

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
    loadOrders()
  }, [loadOrders])

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => {
      setToastMessage(null)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Handle new order created from Form
  const handleOrderCreated = useCallback((newOrder) => {
    startTransition(() => {
      setOrders((prev) => [newOrder, ...prev])
    })
    setToastMessage(`Sales order ${newOrder.order_number} was successfully created!`)
  }, [])

  // Sub-counts for filter badges
  const finishedCount = useMemo(
    () => orders.filter((o) => o.item?.type === 'finished_good').length,
    [orders]
  )
  const semiFinishedCount = useMemo(
    () => orders.filter((o) => o.item?.type === 'semi_finished').length,
    [orders]
  )

  // Filtering & Sorting Logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (typeFilter !== 'all' && order.item?.type !== typeFilter) {
          return false
        }

        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false
        }

        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim()
          const orderNum = (order.order_number || '').toLowerCase()
          const customer = (order.customer_name || '').toLowerCase()
          const itemName = (order.item?.name || '').toLowerCase()
          const itemCode = (order.item?.code || '').toLowerCase()

          return (
            orderNum.includes(query) ||
            customer.includes(query) ||
            itemName.includes(query) ||
            itemCode.includes(query)
          )
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'value_desc') return Number(b.total_value || 0) - Number(a.total_value || 0)
        if (sortBy === 'value_asc') return Number(a.total_value || 0) - Number(b.total_value || 0)
        if (sortBy === 'date_asc') return new Date(a.order_date || 0) - new Date(b.order_date || 0)
        return new Date(b.order_date || 0) - new Date(a.order_date || 0)
      })
  }, [orders, searchTerm, typeFilter, statusFilter, sortBy])

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'date_desc'

  const handleResetFilters = useCallback(() => {
    setSearchTerm('')
    setTypeFilter('all')
    setStatusFilter('all')
    setSortBy('date_desc')
  }, [])

  const filteredTotalValue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + Number(o.total_value || 0), 0)
  }, [filteredOrders])

  const totalPortfolioValue = useMemo(() => {
    return orders.reduce((sum, o) => sum + Number(o.total_value || 0), 0)
  }, [orders])

  return (
    <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            title="Refresh Orders"
            className="inline-flex h-9.5 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex h-9.5 items-center gap-2 rounded-lg bg-[#193b35] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#234f47] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193b35] cursor-pointer"
          >
            <Plus size={15} />
            <span>New Sales Order</span>
          </button>
        </div>
      </div>

      {/* Success Toast / Notification */}
      {toastMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error Banner */}
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

      <SalesOrdersKpi orders={orders} loading={loading} />

      <SalesOrdersFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
        totalCount={orders.length}
        filteredCount={filteredOrders.length}
        finishedCount={finishedCount}
        semiFinishedCount={semiFinishedCount}
      />

      {/* Orders Table */}
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
                // Empty Database State
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
              ) : filteredOrders.length === 0 ? (
                // Filter Mismatch Empty State
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <FilterX size={24} />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-800">No matching orders found</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      No sales orders match your current filter or search criteria.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <X size={13} />
                      <span>Reset Filters</span>
                    </button>
                  </td>
                </tr>
              ) : (
                // Data Rows
                filteredOrders.map((order) => {
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

        {/* Footer Summary / Counter */}
        {orders.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-slate-200/80 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing <strong className="text-slate-700">{filteredOrders.length}</strong> of{' '}
              <strong className="text-slate-700">{orders.length}</strong> sales {orders.length > 1 ? 'orders' : 'order'}
            </span>
            <div className="flex items-center gap-4">
              <span>
                {hasActiveFilters ? 'Filtered Value: ' : 'Portfolio Value: '}
                <strong className="font-mono font-semibold text-[#193b35]">
                  {formatCurrency(filteredTotalValue)}
                </strong>
                {hasActiveFilters && (
                  <span className="ml-1 text-slate-400">
                    (Total: {formatCurrency(totalPortfolioValue)})
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </section>

      {isFormOpen && (
        <NewSalesOrderForm
          onClose={() => setIsFormOpen(false)}
          onOrderCreated={handleOrderCreated}
          existingOrders={orders}
        />
      )}
    </main>
  )
}

export default SalesOrders