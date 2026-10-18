import { Search, X, PackageCheck, Layers, ArrowUpDown, FilterX } from 'lucide-react'

function SalesOrdersFilters({
  searchTerm = '',
  onSearchChange,
  typeFilter = 'all',
  onTypeFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
  sortBy = 'date_desc',
  onSortByChange,
  onResetFilters,
  totalCount = 0,
  filteredCount = 0,
  finishedCount = 0,
  semiFinishedCount = 0,
}) {
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'date_desc'

  return (
    <section
      aria-label="Search and Filter Controls"
      className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input Bar (kept neutral as requested) */}
        <div className="relative flex-1 min-w-[260px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order #, customer, or product name/code..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#193b35] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Controls Cluster with subtle hover interactions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Classification Segmented Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => onTypeFilterChange('all')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all duration-200 cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold hover:shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:shadow-2xs'
              }`}
            >
              <span>All</span>
              <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] text-slate-700">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTypeFilterChange('finished_good')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all duration-200 cursor-pointer ${
                typeFilter === 'finished_good'
                  ? 'bg-[#193b35] text-white shadow-2xs font-semibold hover:bg-[#234f47] hover:shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#193b35]/8'
              }`}
            >
              <PackageCheck size={13} />
              <span>Finished</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  typeFilter === 'finished_good'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {finishedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTypeFilterChange('semi_finished')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all duration-200 cursor-pointer ${
                typeFilter === 'semi_finished'
                  ? 'bg-[#8f4724] text-white shadow-2xs font-semibold hover:bg-[#a6532a] hover:shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#8f4724]/8'
              }`}
            >
              <Layers size={13} />
              <span>Semi-Finished</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  typeFilter === 'semi_finished'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {semiFinishedCount}
              </span>
            </button>
          </div>

          {/* Status Dropdown */}
          <div className="group relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Filter by Status"
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-medium text-slate-700 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-xs hover:text-slate-900 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_production">In Production</option>
              <option value="delivered">Delivered</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-hover:text-slate-600">
              <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="group relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-hover:text-slate-600">
              <ArrowUpDown size={13} />
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              aria-label="Sort Orders"
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-8 pr-8 text-xs font-medium text-slate-700 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-xs hover:text-slate-900 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] cursor-pointer"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="value_desc">Value: High to Low</option>
              <option value="value_asc">Value: Low to High</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-hover:text-slate-600">
              <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 text-xs font-medium text-rose-700 shadow-2xs transition-all duration-200 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-800 hover:shadow-xs active:scale-[0.98] cursor-pointer"
              title="Clear all active filters"
            >
              <FilterX size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter State Feedback Subline */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Matching <strong className="text-slate-800">{filteredCount}</strong> of{' '}
              <strong className="text-slate-800">{totalCount}</strong> sales orders
            </span>
            {searchTerm && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                query: &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-[#193b35] transition-colors hover:underline hover:text-[#234f47] cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}

export default SalesOrdersFilters
