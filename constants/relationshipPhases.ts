import { RelationshipPhase } from '@/types/types';

export type RelationshipPhaseItem = {
  id: RelationshipPhase;
  label: string;
  tooltip: string;
};

export const RELATIONSHIP_PHASES: RelationshipPhaseItem[] = [
  {
    id: 'beginning',
    label: 'Beginning',
    tooltip: 'You have just met or are starting to spend time together.',
  },
  {
    id: 'courting',
    label: 'Courting / Getting to know each other',
    tooltip: 'Intentionally getting to know each other and exploring chemistry.',
  },
  {
    id: 'exclusive',
    label: 'Dating / Exclusive',
    tooltip: 'You are committed to each other and not seeing other people.',
  },
  {
    id: 'casual',
    label: 'Dating Casually',
    tooltip: 'You are dating without exclusivity and keeping it light.',
  },
  {
    id: 'patching',
    label: 'Patching Things Up',
    tooltip: 'You are reconnecting and working through issues together.',
  },
];

export function getPhaseLabel(id?: RelationshipPhase | null): string {
  const item = RELATIONSHIP_PHASES.find(p => p.id === id);
  return item ? item.label : '';
}
