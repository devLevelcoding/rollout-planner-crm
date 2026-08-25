import { useEffect, useState, type FormEvent } from 'react'
import { createResource, deleteResource, listResource } from '../api'
import type { ExpansionPhase } from '../types'

export default function PhasesView() {
  const [rows, setRows] = useState<ExpansionPhase[]>([])
  const [name, setName] = useState('')
  const [order, setOrder] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    listResource<ExpansionPhase>('expansion-phases').then(r => setRows(r.data.sort((a, b) => a.order - b.order))).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createResource('expansion-phases', { name, order: order ? Number(order) : 0 })
      setName('')
      setOrder('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this phase? Assigned leads become unassigned.')) return
    await deleteResource('expansion-phases', id)
    load()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-txt">Expansion Phases</h1>
        <p className="text-xs text-txt2 mt-1">Ordered rollout sequence — assign leads to a phase from the Leads tab.</p>
      </div>

      {error && <div className="mb-4 px-3 py-2 rounded bg-danger/10 border border-danger/30 text-danger text-xs">{error}</div>}

      <form onSubmit={submit} className="mb-6 p-4 rounded border border-border bg-surface flex items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-txt2 flex-1">
          Name
          <input required placeholder="Phase 1: DACH" value={name} onChange={e => setName(e.target.value)} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-txt2">
          Order
          <input type="number" value={order} onChange={e => setOrder(e.target.value)} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm w-20" />
        </label>
        <button type="submit" className="px-4 py-1.5 rounded text-xs font-medium bg-accent text-white hover:bg-accent/90">Add</button>
      </form>

      <div className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <div className="text-txt2 text-sm text-center py-6 border border-border rounded bg-surface">No phases yet.</div>
        ) : rows.map(p => (
          <div key={p.id} className="p-3 rounded border border-border bg-surface flex items-center justify-between">
            <div>
              <span className="text-sm text-txt font-medium">#{p.order} {p.name}</span>
              <span className="text-xs text-txt2 ml-3">{p.leadCount ?? 0} leads &middot; avg score {p.avgScore ?? 0}</span>
            </div>
            <button onClick={() => void remove(p.id)} className="text-xs text-danger hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
