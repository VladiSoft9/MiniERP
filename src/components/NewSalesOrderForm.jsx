import { useEffect, useState, useId } from 'react'
import {
  X,
  ShoppingCart,
  Plus,
  PackageCheck,
  Layers,
  Building2,
  Calendar,
  AlertCircle,
  Loader2,
  Tag,
  Hash,
  Check,
  ArrowRight,
  Info
} from 'lucide-react'
import {
  fetchEligibleItems,
  createSalesOrder,
  generateNextOrderNumber
} from '../services/salesOrders'
import { formatCurrency } from '../utils/formatters'

function NewSalesOrderForm({ onClose, onOrderCreated, existingOrders = [] }) {
  const formId = useId()

  const [itemMode, setItemMode] = useState('existing')

  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [itemFilter, setItemFilter] = useState('all')

  const [selectedItemId, setSelectedItemId] = useState('')

  const [newItemType, setNewItemType] = useState('finished_good')
  const [newItemCode, setNewItemCode] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemUom, setNewItemUom] = useState('pcs')
  const [newItemCost, setNewItemCost] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')

  const [orderNumber, setOrderNumber] = useState(() =>
    generateNextOrderNumber(existingOrders)
  )
  const [customerName, setCustomerName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0])
  const [deliveryDate, setDeliveryDate] = useState('')
  const [status, setStatus] = useState('confirmed')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadItems() {
      try {
        setLoadingItems(true)
        const data = await fetchEligibleItems()
        if (!ignore) {
          setItems(data)
          if (data.length > 0) {
            setSelectedItemId(data[0].id)
            if (data[0].standard_cost) {
              setUnitPrice(String(data[0].standard_cost))
            }
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error(err)
          setError('Failed to load product catalog. Please retry.')
        }
      } finally {
        if (!ignore) {
          setLoadingItems(false)
        }
      }
    }

    loadItems()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !submitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  const handleItemSelectChange = (id) => {
    setSelectedItemId(id)
    const found = items.find((it) => it.id === id)
    if (found && found.standard_cost) {
      setUnitPrice(String(found.standard_cost))
    }
  }

  const filteredCatalogItems = items.filter((it) => {
    if (itemFilter === 'all') return true
    return it.type === itemFilter
  })

  // Selected item object (if existing mode)
  const currentSelectedItem = items.find((it) => it.id === selectedItemId)

  const currentUom =
    itemMode === 'existing'
      ? currentSelectedItem?.unit_of_measure || 'pcs'
      : newItemUom || 'pcs'

  const numQty = Math.max(0, parseFloat(quantity) || 0)
  const numPrice = Math.max(0, parseFloat(unitPrice) || 0)
  const computedTotalValue = numQty * numPrice

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!orderNumber.trim()) {
      setError('Please provide a sales order number.')
      return
    }

    if (!customerName.trim()) {
      setError('Please provide the customer name.')
      return
    }

    if (numQty <= 0) {
      setError('Quantity must be greater than zero.')
      return
    }

    if (numPrice < 0) {
      setError('Unit price cannot be negative.')
      return
    }

    if (itemMode === 'existing' && !selectedItemId) {
      setError('Please select a product from the catalog.')
      return
    }

    if (itemMode === 'new') {
      if (!newItemCode.trim()) {
        setError('Please provide a unique product code (e.g. FG-BIKE-01).')
        return
      }
      if (!newItemName.trim()) {
        setError('Please provide a product name.')
        return
      }
    }

    setSubmitting(true)

    try {
      const orderPayload = {
        order_number: orderNumber.trim(),
        customer_name: customerName.trim(),
        item_id: itemMode === 'existing' ? selectedItemId : null,
        quantity: numQty,
        unit_price: numPrice,
        status,
        order_date: orderDate || new Date().toISOString().split('T')[0],
        delivery_date: deliveryDate || null,
        notes: notes.trim() || null,
      }

      const newItemPayload =
        itemMode === 'new'
          ? {
            code: newItemCode.trim().toUpperCase(),
            name: newItemName.trim(),
            type: newItemType,
            unit_of_measure: newItemUom.trim() || 'pcs',
            standard_cost: parseFloat(newItemCost) || 0,
            description: newItemDescription.trim() || null,
          }
          : null

      const createdOrder = await createSalesOrder({
        orderData: orderPayload,
        newItemData: newItemPayload,
      })

      if (onOrderCreated) {
        onOrderCreated(createdOrder)
      }

      onClose()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Failed to create sales order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose()
        }
      }}
    >
      {/* Form Dialog Card */}
      <div className="relative w-full sm:max-w-2xl max-h-[94dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-slate-200/90 bg-[#fafbf9] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Form Header */}
        <div className="shrink-0 relative border-b border-slate-100 bg-[#193b35] px-5 py-4 sm:px-6 sm:py-5 text-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d4e8a8] via-[#e69c78] to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d4e8a8] shadow-inner">
                <ShoppingCart size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 id={`${formId}-title`} className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                    New Sales Order
                  </h2>
                  <span className="hidden sm:inline-flex rounded-md bg-[#d4e8a8]/20 px-2 py-0.5 text-[11px] font-mono font-medium text-[#d4e8a8]">
                    {orderNumber}
                  </span>
                </div>
                <p className="text-xs text-[#b8c9bd] truncate">
                  Please fill the form below to create a new sales order.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close dialog"
              className="size-8.5 shrink-0 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form
          id={`${formId}-form`}
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 text-slate-800"
        >
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/95 p-3.5 text-xs text-rose-800 shadow-2xs">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Section 1: Product Selection */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-[#193b35]/10 text-xs font-bold text-[#193b35]">
                  1
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Product Selection
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Choose from existing inventory or create a new product on the fly.
                  </p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setItemMode('existing')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all cursor-pointer ${itemMode === 'existing'
                    ? 'bg-white text-[#193b35] shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Tag size={13} />
                  <span>Catalog Product</span>
                </button>

                <button
                  type="button"
                  onClick={() => setItemMode('new')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all cursor-pointer ${itemMode === 'new'
                    ? 'bg-[#193b35] text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Plus size={13} />
                  <span>Register New</span>
                </button>
              </div>
            </div>

            {itemMode === 'existing' && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-medium text-slate-500 mr-1">Filter catalog:</span>
                  <button
                    type="button"
                    onClick={() => setItemFilter('all')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${itemFilter === 'all'
                      ? 'bg-[#193b35] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                      }`}
                  >
                    All ({items.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemFilter('finished_good')}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${itemFilter === 'finished_good'
                      ? 'bg-[#193b35] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                      }`}
                  >
                    <PackageCheck size={12} />
                    <span>Finished Goods</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemFilter('semi_finished')}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${itemFilter === 'semi_finished'
                      ? 'bg-[#8f4724] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                      }`}
                  >
                    <Layers size={12} />
                    <span>Semi-Finished</span>
                  </button>
                </div>

                {loadingItems ? (
                  <div className="flex items-center justify-center py-6 text-xs text-slate-500 rounded-xl border border-slate-100 bg-slate-50/50">
                    <Loader2 size={16} className="animate-spin mr-2 text-[#193b35]" />
                    <span>Loading products from database...</span>
                  </div>
                ) : filteredCatalogItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 rounded-xl border border-slate-200/80 bg-slate-50">
                    No products found in this category. You can register a new one above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <label htmlFor={`${formId}-existing-item`} className="sr-only">
                        Select Item
                      </label>
                      <select
                        id={`${formId}-existing-item`}
                        value={selectedItemId}
                        onChange={(e) => handleItemSelectChange(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-9 text-xs sm:text-sm font-medium text-slate-800 shadow-2xs focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors cursor-pointer"
                      >
                        {filteredCatalogItems.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name} [{it.code}] — {it.type === 'finished_good' ? 'Finished Good' : 'Semi-Finished'} ({it.unit_of_measure})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Selected Item Showcase Card */}
                    {currentSelectedItem && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#193b35]/15 bg-[#f5f8f3] p-3.5 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-bold ${currentSelectedItem.type === 'finished_good'
                            ? 'bg-[#193b35]/10 text-[#193b35]'
                            : 'bg-[#e69c78]/25 text-[#8f4724]'
                            }`}>
                            {currentSelectedItem.type === 'finished_good' ? (
                              <PackageCheck size={20} />
                            ) : (
                              <Layers size={20} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs sm:text-sm text-slate-900">
                                {currentSelectedItem.name}
                              </span>
                              <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700 border border-slate-200">
                                {currentSelectedItem.code}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Unit of Measure:{' '}
                              <strong className="text-slate-700">{currentSelectedItem.unit_of_measure}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Standard Cost</span>
                          <p className="font-mono text-xs sm:text-sm font-bold text-[#193b35]">
                            {currentSelectedItem.standard_cost != null
                              ? formatCurrency(currentSelectedItem.standard_cost)
                              : '—'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Register New Item */}
            {itemMode === 'new' && (
              <div className="rounded-xl border border-[#193b35]/20 bg-[#f7faf4] p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-[#193b35]/10 pb-2.5">
                  <span className="text-xs font-semibold text-[#193b35] flex items-center gap-1.5">
                    <Info size={14} className="text-[#193b35]" />
                    <span>New item will be permanently added to the Items master catalog</span>
                  </span>
                  <span className="rounded-full bg-[#193b35]/10 px-2 py-0.5 text-[10px] font-bold text-[#193b35]">
                    Catalog Entry
                  </span>
                </div>

                {/* Product Classification Cards */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Item Classification *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setNewItemType('finished_good')}
                      className={`flex items-start gap-3 rounded-xl p-3 text-left border transition-all cursor-pointer ${newItemType === 'finished_good'
                        ? 'border-[#193b35] bg-white ring-2 ring-[#193b35]/20 shadow-xs'
                        : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
                        }`}
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${newItemType === 'finished_good'
                          ? 'bg-[#193b35] text-white'
                          : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        <PackageCheck size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900">Finished Good</span>
                          {newItemType === 'finished_good' && (
                            <span className="flex size-4 items-center justify-center rounded-full bg-[#193b35] text-white">
                              <Check size={10} />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Final saleable products for customers
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewItemType('semi_finished')}
                      className={`flex items-start gap-3 rounded-xl p-3 text-left border transition-all cursor-pointer ${newItemType === 'semi_finished'
                        ? 'border-[#8f4724] bg-white ring-2 ring-[#8f4724]/20 shadow-xs'
                        : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
                        }`}
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${newItemType === 'semi_finished'
                          ? 'bg-[#8f4724] text-white'
                          : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        <Layers size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900">Semi-Finished</span>
                          {newItemType === 'semi_finished' && (
                            <span className="flex size-4 items-center justify-center rounded-full bg-[#8f4724] text-white">
                              <Check size={10} />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Sub-assemblies or intermediate parts
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`${formId}-item-code`}
                      className="block text-[11px] font-semibold text-slate-700 mb-1"
                    >
                      Item Code *
                    </label>
                    <input
                      id={`${formId}-item-code`}
                      type="text"
                      required
                      value={newItemCode}
                      onChange={(e) => setNewItemCode(e.target.value.toUpperCase())}
                      placeholder={newItemType === 'finished_good' ? 'FG-BIKE-PRO' : 'SF-FRAME-29'}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs uppercase text-slate-800 placeholder:text-slate-400 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-item-name`}
                      className="block text-[11px] font-semibold text-slate-700 mb-1"
                    >
                      Item Name *
                    </label>
                    <input
                      id={`${formId}-item-name`}
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Apex Aero 29er"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`${formId}-item-uom`}
                      className="block text-[11px] font-semibold text-slate-700 mb-1"
                    >
                      Unit of Measure
                    </label>
                    <select
                      id={`${formId}-item-uom`}
                      value={newItemUom}
                      onChange={(e) => setNewItemUom(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors cursor-pointer"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="pair">Pair (pair)</option>
                      <option value="set">Set (set)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="m">Meters (m)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-item-cost`}
                      className="block text-[11px] font-semibold text-slate-700 mb-1"
                    >
                      Standard Cost (€)
                    </label>
                    <input
                      id={`${formId}-item-cost`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItemCost}
                      onChange={(e) => {
                        setNewItemCost(e.target.value)
                        setUnitPrice(e.target.value)
                      }}
                      placeholder="0.00"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs text-slate-800 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-item-desc`}
                    className="block text-[11px] font-medium text-slate-700 mb-1"
                  >
                    Product Description (Optional)
                  </label>
                  <input
                    id={`${formId}-item-desc`}
                    type="text"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    placeholder="Short specification or material notes..."
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Information & Financials */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="flex size-6 items-center justify-center rounded-md bg-[#193b35]/10 text-xs font-bold text-[#193b35]">
                2
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Order Details & Pricing
                </h3>
                <p className="text-[11px] text-slate-500">
                  Assign order number, customer name, quantities, and pricing.
                </p>
              </div>
            </div>

            {/* Order # and Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor={`${formId}-order-num`}
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Order Number *
                </label>
                <div className="relative">
                  <Hash
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id={`${formId}-order-num`}
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="SO-2026-001"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8.5 pr-3 font-mono text-xs font-semibold text-[#193b35] focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-customer`}
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Customer / Client *
                </label>
                <div className="relative">
                  <Building2
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id={`${formId}-customer`}
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alpine Cycles Zurich"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8.5 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Quantity and Unit Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor={`${formId}-quantity`}
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Order Quantity *
                </label>
                <div className="relative">
                  <input
                    id={`${formId}-quantity`}
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-3 pr-14 font-mono text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                    {currentUom}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-unit-price`}
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Unit Selling Price (€) *
                </label>
                <div className="relative">
                  <input
                    id={`${formId}-unit-price`}
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-3 pr-8 font-mono text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    €
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="rounded-xl border border-[#193b35]/20 bg-gradient-to-br from-[#193b35]/5 via-[#f5f8f3] to-[#e69c78]/10 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Computed Order Value
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-semibold text-slate-800">{numQty}</span>
                    <span>{currentUom}</span>
                    <span>&times;</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatCurrency(numPrice)}
                    </span>
                    <ArrowRight size={12} className="text-slate-400" />
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-[#193b35]">
                    {formatCurrency(computedTotalValue)}
                  </div>
                  <span className="text-[10px] text-slate-500">Gross sales value (EUR)</span>
                </div>
              </div>
            </div>

            {/* Dates & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label
                  htmlFor={`${formId}-order-date`}
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Order Date
                </label>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id={`${formId}-order-date`}
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8.5 pr-2.5 text-xs text-slate-900 focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-due-date`}
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Delivery Due Date
                </label>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id={`${formId}-due-date`}
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8.5 pr-2.5 text-xs text-slate-900 focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-status`}
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Order Status
                </label>
                <select
                  id={`${formId}-status`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-900 focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors cursor-pointer"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="in_production">In Production</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor={`${formId}-notes`}
                className="block text-[11px] font-medium text-slate-700 mb-1"
              >
                Order Notes (Optional)
              </label>
              <textarea
                id={`${formId}-notes`}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Shipping instructions, custom packaging requirements, priority notes..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
              />
            </div>
          </div>
        </form>

        {/* Form Footer */}
        <div className="shrink-0 bg-white/95 backdrop-blur-xs border-t border-slate-200/80 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs text-slate-500">Order Total:</span>
            <span className="font-mono text-base font-bold text-[#193b35]">
              {formatCurrency(computedTotalValue)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 sm:flex-none h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={`${formId}-form`}
              disabled={submitting}
              className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#193b35] px-5 text-xs font-semibold text-white shadow-xs hover:bg-[#234f47] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193b35] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Create Sales Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewSalesOrderForm
