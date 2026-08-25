import { useEffect, useState } from 'react'
import { getGeography } from '../api'
import type { CountryStat } from '../types'

export default function GeographyView() {
  const [countries, setCountries] = useState<CountryStat[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getGeography().then(r => setCountries(r.countries)).catch(e => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-txt">Geography</h1>
        <p className="text-xs text-txt2 mt-1">Unassigned leads ranked by average score — which country/city to prospect next.</p>
      </div>

      {error && <div className="mb-4 px-3 py-2 rounded bg-danger/10 border border-danger/30 text-danger text-xs">{error}</div>}

      <div className="rounded border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-txt2">
              <th className="px-3 py-2 font-medium">Country</th>
              <th className="px-3 py-2 font-medium">Leads</th>
              <th className="px-3 py-2 font-medium">Avg Score</th>
              <th className="px-3 py-2 font-medium">No Website</th>
            </tr>
          </thead>
          <tbody>
            {countries.length === 0 ? (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-txt2">No unassigned leads yet.</td></tr>
            ) : countries.map(c => (
              <tr key={c.country} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-txt font-medium">{c.country}</td>
                <td className="px-3 py-2 text-txt2">{c.count}</td>
                <td className="px-3 py-2 text-ok font-medium">{c.avgScore}</td>
                <td className="px-3 py-2 text-txt2">{c.noWebsitePct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
