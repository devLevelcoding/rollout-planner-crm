// Ported verbatim from Worth-Contacting CRM (#12)'s
// src/scoring/lead-score.util.ts (itself from F:\scraper\filter_leads.py's
// _score()) — same 5 additive rules, no changes needed.
export interface ScorableRow {
  website?: string | null;
  rating?: string | number | null;
  reviewCount?: string | number | null;
  phone?: string | null;
}

export interface ScoreResult {
  score: number;
  reasons: string;
}

export function scoreLead(row: ScorableRow): ScoreResult {
  const reasons: string[] = [];
  let score = 0;

  const website = (row.website ?? '').toString().trim();
  const phone = (row.phone ?? '').toString().trim();

  const ratingRaw = row.rating;
  const rating =
    ratingRaw === null || ratingRaw === undefined || ratingRaw === ''
      ? null
      : Number(ratingRaw);
  const ratingValid = rating !== null && !Number.isNaN(rating) ? rating : null;

  const reviewsRaw = row.reviewCount;
  const reviewsParsed =
    reviewsRaw === null || reviewsRaw === undefined || reviewsRaw === '' ? 0 : Number(reviewsRaw);
  const reviews = Number.isNaN(reviewsParsed) ? 0 : reviewsParsed;

  const hasWebsite = Boolean(website && !['', 'none', 'n/a'].includes(website.toLowerCase()));

  if (!hasWebsite) {
    score += 10;
    reasons.push('no website');
    if (reviews > 50) {
      score += 5;
      reasons.push(`${reviews} reviews, no site`);
    }
  } else if (ratingValid !== null && ratingValid < 3.5) {
    score += 5;
    reasons.push(`low rating ${ratingValid}`);
  }

  if (phone) {
    score += 3;
    reasons.push('has phone');
  }

  if (hasWebsite && ratingValid !== null && ratingValid >= 4.0) {
    score += 2;
    reasons.push(`rating ${ratingValid}`);
  }

  return { score, reasons: reasons.join(', ') };
}
