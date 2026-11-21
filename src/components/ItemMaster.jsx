import { useEffect, useState, useTransition, useCallback } from 'react'
import {
  Package,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  Tag,
  Info,
} from 'lucide-react'
import { fetchItems } from '../services/items'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getItemTypeBadge } from '../utils/itemTypes'

function ItemMaster() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [, startTransition] = useTransition()

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchItems()
      startTransition(() => {
        setItems(data)
      })
    } catch (err) {
      console.error('Failed to load items:', err)
      setError('Failed to load items from Supabase. Please check your network and Supabase connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => {
      setToastMessage(null)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  return (
    <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#193b35] text-white shadow-xs">
              <Package size={19} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Item Master</h1>
          </div>
          <p className="text-sm text-slate-500">
            Central registry of all finished products, sub-assemblies, raw materials, and standard costs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadItems}
            disabled={loading}
            title="Refresh Items"
            className="inline-flex h-9.5 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-60 cursor-pointer transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="inline-flex h-9.5 items-center gap-2 rounded-lg bg-[#193b35] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#234f47] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193b35] cursor-pointer transition-colors"
          >
            <Plus size={15} />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`mb-6 flex items-center justify-between rounded-xl border p-4 text-sm shadow-sm animate-in fade-in duration-200 ${typeof toastMessage === 'object' && toastMessage.type === 'error'
            ? 'border-rose-200 bg-rose-50/90 text-rose-800'
            : typeof toastMessage === 'object' && toastMessage.type === 'info'
              ? 'border-sky-200 bg-sky-50/90 text-sky-800'
              : 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
            }`}
        >
          <div className="flex items-center gap-3">
            {typeof toastMessage === 'object' && toastMessage.type === 'error' ? (
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
            ) : typeof toastMessage === 'object' && toastMessage.type === 'info' ? (
              <Info size={18} className="shrink-0 text-sky-600" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            )}
            <span className="font-medium">
              {typeof toastMessage === 'string' ? toastMessage : toastMessage.text}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="rounded-md p-1 hover:opacity-80 transition-opacity cursor-pointer"
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
            onClick={loadItems}
            className="rounded-md bg-rose-100 px-3 py-1 text-xs font-medium text-rose-900 hover:bg-rose-200 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Items Table Card */}
      <section
        aria-label="Items Master Table"
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                <th scope="col" className="px-5 py-3.5">
                  Item Code
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Name & Description
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Classification
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Unit of Measure
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Standard Cost
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Created Date
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && items.length === 0 ? (
                // Loading Skeleton Rows
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-44 rounded-sm bg-slate-200 mb-1.5" />
                      <div className="h-3 w-32 rounded-sm bg-slate-100" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-24 rounded-full bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-12 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-4 w-16 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="mx-auto h-4 w-16 rounded-sm bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Package size={24} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800">No items found</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Your items catalog is currently empty. Click &ldquo;Add New Item&rdquo; to register your first product or material.
                    </p>
                  </td>
                </tr>
              ) : (
                // Items Listing
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="inline-flex items-center gap-1.5">
                        <Tag size={13} className="text-slate-400" />
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                          {item.code}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-slate-900 text-xs sm:text-sm">
                        {item.name}
                      </div>
                      {item.description ? (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No description</span>
                      )}
                    </td>

                    <td className="px-5 py-4 align-top">
                      {getItemTypeBadge(item.type)}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-700 border border-slate-200/60">
                        {item.unit_of_measure || 'pcs'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right align-top font-mono text-xs font-semibold text-slate-900">
                      {item.standard_cost != null ? formatCurrency(item.standard_cost) : '—'}
                    </td>

                    <td className="px-5 py-4 align-top text-xs text-slate-500">
                      {formatDate(item.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 align-top text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title={`Edit ${item.name}`}
                          className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:bg-[#193b35]/10 hover:text-[#193b35] transition-colors cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          title={`Delete ${item.name}`}
                          className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Summary */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
          <span>
            {loading ? 'Loading items...' : `Total items: ${items.length}`}
          </span>
          <span className="text-[11px] text-slate-400">
            MiniERP &bull; Item Master Registry
          </span>
        </div>
      </section>
    </main>
  )
}

export default ItemMaster
