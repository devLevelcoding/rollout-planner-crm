import { useEffect, useState } from 'react'
import { listResource, patchResource } from '../api'
import type { ExpansionPhase, Lead } from '../types'

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [phases, setPhases] = useState<ExpansionPhase[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    listResource<Lead>('leads').then(r => setLeads(r.data)).catch(e => setError(e instanceof Error ? e.message : String(e)))
    listResource<ExpansionPhase>('expansion-phases').then(r => setPhases(r.data)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const assign = async (leadId: number, phaseId: string) => {
    await patchResource('leads', leadId, { phaseId: phaseId ? Number(phaseId) : null })
    load()
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-txt">Leads</h1>
        <p className="text-xs text-txt2 mt-1">Score-ranked pipeline — assign leads to an expansion phase as the plan solidifies.</p>
      </div>

      {error && <div className="mb-4 px-3 py-2 rounded bg-danger/10 border border-danger/30 text-danger text-xs">{error}</div>}

      <div className="rounded border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-txt2">
              <th className="px-3 py-2 font-medium">Score</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">City / Country</th>
              <th className="px-3 py-2 font-medium">Why</th>
              <th className="px-3 py-2 font-medium">Phase</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-txt2">Nothing here yet.</td></tr>
            ) : leads.map(l => (
              <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface2 transition-colors">
                <td className="px-3 py-2 text-txt font-medium">{l.score}</td>
                <td className="px-3 py-2 text-txt">{l.name}</td>
                <td className="px-3 py-2 text-txt2">{[l.city, l.country].filter(Boolean).join(', ') || '—'}</td>
                <td className="px-3 py-2 text-txt2 text-xs">{l.reasons}</td>
                <td className="px-3 py-2">
                  <select
                    value={l.phaseId ?? ''}
                    onChange={e => void assign(l.id, e.target.value)}
                    className="px-2 py-1 rounded bg-surface2 border border-border text-txt text-xs"
                  >
                    <option value="">Unassigned</option>
                    {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
