import { type Recommendation, type Session } from '@/types/schemas';

export type GuideBudget = '$' | '$$' | '$$-$$$' | '$$$' | 'Any';
export type GuideGoal = 'Impress' | 'Fun Night' | 'Deep Talk' | 'Romantic' | 'Surprise Me' | 'Any';
export interface GuideFilters {
  budget: GuideBudget;
  goal: GuideGoal;
  likes: string[];
}

function pickWhy(rec: Recommendation, filters: GuideFilters, session: Session | null): string {
  const parts: string[] = [];
  if (filters.goal !== 'Any') {
    const map: Record<GuideGoal, string> = {
      Impress: 'aims to impress with atmosphere and quality',
      'Fun Night': 'promises an upbeat vibe and energy',
      'Deep Talk': 'is conducive to conversation without loud noise',
      Romantic: 'leans romantic with cozy seating and ambiance',
      'Surprise Me': 'adds novelty to keep the date fresh',
      Any: 'fits broadly with your preferences',
    };
    parts.push(map[filters.goal]);
  }
  if (filters.budget !== 'Any' && rec.estimatedCost) {
    parts.push(`matches your budget (${filters.budget})`);
  }
  const likeMatch = filters.likes.find((l) => rec.title.toLowerCase().includes(l.toLowerCase()) || (rec.description?.toLowerCase().includes(l.toLowerCase()) ?? false));
  if (likeMatch) parts.push(`aligns with "${likeMatch}"`);
  if (session?.dateStartISO && rec.bestTime) parts.push(`pairs well with your start time around ${rec.bestTime}`);
  return parts.length > 0 ? `Picked because it ${parts.join(', ')}.` : 'Picked as a balanced match for your current preferences.';
}

function pickTweak(rec: Recommendation, filters: GuideFilters, session: Session | null): string {
  if (rec.bestTime && /6:|7:|8:/i.test(rec.bestTime) && filters.goal === 'Romantic') {
    return 'Try arriving 15 minutes earlier to catch golden hour lighting.';
  }
  if (filters.goal === 'Impress' && rec.estimatedCost && (rec.estimatedCost === '$' || rec.estimatedCost === '$$')) {
    return 'Consider upgrading to a chef’s tasting or premium seating to elevate the experience.';
  }
  if (filters.goal === 'Deep Talk') {
    return 'Ask for a quiet corner table or bring a short list of conversation starters.';
  }
  if (filters.likes.length >= 2) {
    return 'Chain this with another pick that hits a different like to create contrast.';
  }
  return 'Book a buffer of 10 minutes between activities to keep the pace relaxed.';
}

export function buildGuide(rec: Recommendation, filters: GuideFilters, session: Session | null) {
  const why = pickWhy(rec, filters, session);
  const tweak = pickTweak(rec, filters, session);
  return { why, tweak };
}

export async function runGuideSmokeTest(): Promise<boolean> {
  try {
    const sample: Recommendation = {
      id: 't1',
      title: 'Cozy Italian Dinner',
      description: 'Candlelight and fresh pasta',
      location: 'Downtown',
      estimatedCost: '$$',
      bestTime: '7:00 PM',
    };
    const filters: GuideFilters = { budget: '$$', goal: 'Romantic', likes: ['pasta'] };
    const tip = buildGuide(sample, filters, null);
    const ok = Boolean(tip.why && tip.why.trim().length > 0 && tip.tweak && tip.tweak.trim().length > 0);
    return ok;
  } catch (e) {
    console.log('[DateGuide:smoke] error', e);
    return false;
  }
}
