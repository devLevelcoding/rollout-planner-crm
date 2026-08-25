import { useState } from 'react'
import { importCsv } from '../api'

export default function ImportPanel() {
  const [csv, setCsv] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setImporting(true)
    setError(null)
    setResult(null)
    try {
      const r = await importCsv(csv)
      setResult(r)
      setCsv('')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-txt">Import Leads</h1>
        <p className="text-xs text-txt2 mt-1">
          Columns: name, category, address, phone, website, rating, review_count, city, country.
        </p>
      </div>

      {error && <div className="mb-4 px-3 py-2 rounded bg-danger/10 border border-danger/30 text-danger text-xs">{error}</div>}
      {result && (
        <div className="mb-4 px-3 py-2 rounded bg-ok/10 border border-ok/30 text-ok text-xs">
          Imported {result.imported} lead{result.imported === 1 ? '' : 's'}{result.skipped > 0 ? ` (${result.skipped} skipped)` : ''}.
        </div>
      )}

      <div className="p-4 rounded border border-border bg-surface flex flex-col gap-3">
        <textarea
          value={csv}
          onChange={e => setCsv(e.target.value)}
          rows={10}
          placeholder="name,category,address,phone,website,rating,review_count,city,country"
          className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm font-mono text-xs"
        />
        <button
          onClick={() => void submit()}
          disabled={importing || !csv.trim()}
          className="self-end px-4 py-1.5 rounded text-xs font-medium bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {importing ? 'Importing…' : 'Import'}
        </button>
      </div>
    </div>
  )
}
