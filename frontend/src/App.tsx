import { useState } from 'react'
import Sidebar, { type NavItem } from './components/Sidebar'
import GeographyView from './components/GeographyView'
import PhasesView from './components/PhasesView'
import LeadsView from './components/LeadsView'
import ImportPanel from './components/ImportPanel'

const NAV: NavItem[] = [
  { key: 'geography', label: 'Geography' },
  { key: 'phases', label: 'Expansion Phases' },
  { key: 'leads', label: 'Leads' },
  { key: 'import', label: 'Import' },
]

export default function App() {
  const [active, setActive] = useState('geography')

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-[13px]">
      <header className="flex items-center gap-3 h-[46px] px-5 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[15px] font-extrabold tracking-tight text-accent">
          rollout<span className="text-txt2 font-normal">planner</span>
        </span>
        <div className="flex-1" />
        <span className="text-xs text-txt2">Type 3 &middot; Pure leadMarketing reuse</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={NAV} selected={active} onSelect={setActive} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {active === 'geography' && <GeographyView />}
          {active === 'phases' && <PhasesView />}
          {active === 'leads' && <LeadsView />}
          {active === 'import' && <ImportPanel />}
        </main>
      </div>
    </div>
  )
}
