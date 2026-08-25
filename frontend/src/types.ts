export interface Lead {
  id: number
  name: string
  category?: string | null
  city?: string | null
  country?: string | null
  website?: string | null
  score: number
  reasons: string
  status: string
  phaseId?: number | null
  phase?: ExpansionPhase | null
}

export interface ExpansionPhase {
  id: number
  name: string
  order: number
  notes?: string | null
  leadCount?: number
  avgScore?: number
}

export interface CountryStat {
  country: string
  count: number
  avgScore: number
  noWebsitePct: number
}
