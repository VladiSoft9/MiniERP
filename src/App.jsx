import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ItemMaster from './components/ItemMaster'
import BomTree from './components/BomTree'
import SalesOrders from './components/SalesOrders'
import Inventory from './components/Inventory'
import ProductionOrders from './components/ProductionOrders'
import PurchasingPlan from './components/PurchasingPlan'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const pages = {
    dashboard: <Dashboard />,
    itemMaster: <ItemMaster />,
    bomTree: <BomTree />,
    salesOrders: <SalesOrders />,
    inventory: <Inventory />,
    productionOrders: <ProductionOrders />,
    purchasingPlan: <PurchasingPlan />,
  }

  return (
    <div className="app-shell min-h-screen text-slate-900 lg:flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="min-w-0 flex-1">{pages[activePage] ?? <Dashboard />}</div>
    </div>
  )
}

export default App
