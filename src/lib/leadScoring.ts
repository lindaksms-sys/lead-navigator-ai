export interface LeadScoringInput {
  timeline?: string | null;
  budget?: string | null;
  propertyType?: string | null;
  squareFootage?: number | null;
  decisionMaker?: boolean | null;
}

export interface ScoreBreakdown {
  timeline: number;
  budget: number;
  property: number;
  decisionMaker: number;
}

export interface ScoreResult {
  score: number;
  category: 'Hot' | 'Warm' | 'Cold';
  breakdown: ScoreBreakdown;
}

const TIMELINE_SCORES: Record<string, number> = {
  emergency: 50,
  today: 40,
  this_week: 30,
  this_month: 20,
  planning: 10,
};

const BUDGET_SCORES: Record<string, number> = {
  over_10000: 20,
  '5000_10000': 15,
  '2000_5000': 10,
  '500_2000': 5,
  under_500: 0,
  unknown: 0,
};

export function calculateScore(data: LeadScoringInput): ScoreResult {
  const breakdown: ScoreBreakdown = {
    timeline: TIMELINE_SCORES[data.timeline ?? ''] ?? 0,
    budget: BUDGET_SCORES[data.budget ?? ''] ?? 0,
    property: 0,
    decisionMaker: 0,
  };

  if (data.propertyType === 'commercial') {
    breakdown.property = 15;
  } else if ((data.squareFootage ?? 0) > 2000) {
    breakdown.property = 10;
  } else if ((data.squareFootage ?? 0) > 1000) {
    breakdown.property = 5;
  }

  if (data.decisionMaker) {
    breakdown.decisionMaker = 15;
  }

  const raw = breakdown.timeline + breakdown.budget + breakdown.property + breakdown.decisionMaker;
  const score = Math.min(raw, 100);

  let category: 'Hot' | 'Warm' | 'Cold';
  if (score >= 70) category = 'Hot';
  else if (score >= 40) category = 'Warm';
  else category = 'Cold';

  return { score, category, breakdown };
}
