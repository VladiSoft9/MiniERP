import { useEffect, useState, useTransition, useCallback, useMemo } from 'react'
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
  FilterX,
} from 'lucide-react'
import { fetchItems } from '../services/items'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getItemTypeBadge } from '../utils/itemTypes'
import ItemMasterFilters from './ItemMasterFilters'
import ItemFormModal from './ItemFormModal'

function ItemMaster() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
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

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [uomFilter, setUomFilter] = useState('all')
  const [sortBy, setSortBy] = useState('code_asc')

  const finishedCount = useMemo(
    () => items.filter((item) => item.type === 'finished_good').length,
    [items]
  )
  const semiFinishedCount = useMemo(
    () => items.filter((item) => item.type === 'semi_finished').length,
    [items]
  )
  const rawMaterialCount = useMemo(
    () => items.filter((item) => item.type === 'raw_material').length,
    [items]
  )

  const uomOptions = useMemo(() => {
    const set = new Set()
    items.forEach((item) => {
      if (item.unit_of_measure) set.add(item.unit_of_measure)
    })
    return Array.from(set).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (typeFilter !== 'all' && item.type !== typeFilter) {
          return false
        }

        if (uomFilter !== 'all' && item.unit_of_measure !== uomFilter) {
          return false
        }

        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim()
          const code = (item.code || '').toLowerCase()
          const name = (item.name || '').toLowerCase()
          const desc = (item.description || '').toLowerCase()

          return code.includes(query) || name.includes(query) || desc.includes(query)
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'code_desc') return (b.code || '').localeCompare(a.code || '')
        if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '')
        if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '')
        if (sortBy === 'cost_desc') return (Number(b.standard_cost) || 0) - (Number(a.standard_cost) || 0)
        if (sortBy === 'cost_asc') return (Number(a.standard_cost) || 0) - (Number(b.standard_cost) || 0)
        if (sortBy === 'created_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        if (sortBy === 'created_asc') return new Date(a.created_at || 0) - new Date(b.created_at || 0)
        return (a.code || '').localeCompare(b.code || '')
      })
  }, [items, searchTerm, typeFilter, uomFilter, sortBy])

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    typeFilter !== 'all' ||
    uomFilter !== 'all' ||
    sortBy !== 'code_asc'

  const handleResetFilters = useCallback(() => {
    setSearchTerm('')
    setTypeFilter('all')
    setUomFilter('all')
    setSortBy('code_asc')
  }, [])

  const handleItemSaved = useCallback((savedItem, action) => {
    startTransition(() => {
      setItems((prev) => {
        if (action === 'updated') {
          return prev.map((item) => (item.id === savedItem.id ? savedItem : item))
        }
        return [savedItem, ...prev]
      })
    })

    setToastMessage(
      action === 'updated'
        ? `Item "${savedItem.name}" [${savedItem.code}] was successfully updated.`
        : `Item "${savedItem.name}" [${savedItem.code}] was successfully created!`
    )
  }, [])

  return (
    <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#193b35] text-white shadow-xs">
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
            onClick={() => {
              setEditingItem(null)
              setIsFormOpen(true)
            }}
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

      {/* Search, Filter & Sort Controls */}
      <ItemMasterFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        uomFilter={uomFilter}
        onUomFilterChange={setUomFilter}
        uomOptions={uomOptions}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
        totalCount={items.length}
        filteredCount={filteredItems.length}
        finishedCount={finishedCount}
        semiFinishedCount={semiFinishedCount}
        rawMaterialCount={rawMaterialCount}
      />

      {/* Items Table Card */}
      <section
        aria-label="Items Master Table"
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
      >
        <div className="overflow-x-auto touch-pan-x">
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
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(null)
                        setIsFormOpen(true)
                      }}
                      className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#193b35] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#234f47] transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add New Item</span>
                    </button>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                // Empty Filtered State
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <FilterX size={24} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800">No matching items</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      No catalog items match your active filters or search query.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <FilterX size={13} />
                      <span>Reset Filters</span>
                    </button>
                  </td>
                </tr>
              ) : (
                // Items Listing
                filteredItems.map((item) => (
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
                      <div className="font-medium text-slate-900">
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
                          onClick={() => {
                            setEditingItem(item)
                            setIsFormOpen(true)
                          }}
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
        <div className="flex flex-col gap-2 border-t border-slate-200/80 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {loading
              ? 'Loading items...'
              : hasActiveFilters
                ? `Showing ${filteredItems.length} of ${items.length} items`
                : `Total items: ${items.length}`}
          </span>
          <span className="text-[11px] text-slate-400">
            MiniERP &bull; Item Master Registry
          </span>
        </div>
      </section>

      {/* Add / Edit Item Modal */}
      {isFormOpen && (
        <ItemFormModal
          key={editingItem?.id || 'new-item'}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
          onSuccess={handleItemSaved}
          item={editingItem}
        />
      )}
    </main>
  )
}

export default ItemMaster
