import {
  ClipboardList,
  GitBranch,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Factory
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import SidebarLogin from './SidebarLogin'
import SidebarUserInfo from './SidebarUserInfo'

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'itemMaster', label: 'Item Master', icon: Package },
  { id: 'bomTree', label: 'BOM Tree', icon: GitBranch },
  { id: 'salesOrders', label: 'Sales Orders', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'productionOrders', label: 'Production Orders', icon: Factory },
  { id: 'purchasingPlan', label: 'Purchasing Plan (MRP)', icon: ClipboardList },
]

function Sidebar({ activePage, onNavigate }) {
  const { user } = useAuth()

  return (
    <aside className="sidebar-shell flex w-full shrink-0 flex-col text-white lg:min-h-screen lg:w-72">
      <div className="flex items-center gap-3 px-6 py-5 lg:px-7 lg:pb-8 lg:pt-8">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[#d4e8a8] text-lg font-bold text-[#183b36]">
          M
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b8c9bd]">Operations</p>
          <h1 className="text-lg font-semibold leading-tight">MiniERP</h1>
        </div>
      </div>

      <div className="flex-1 px-4 lg:px-5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a7b9ad]">Workspace</p>
        <nav aria-label="Main navigation" className="grid grid-cols-2 gap-2 lg:flex lg:flex-col">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={activePage === id ? 'page' : undefined}
              className={`sidebar-link ${activePage === id ? 'sidebar-link-active' : ''}`}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 px-4 py-4 lg:px-5 lg:py-5">
        {user ? <SidebarUserInfo /> : <SidebarLogin />}
      </div>
    </aside>
  )
}

export default Sidebar