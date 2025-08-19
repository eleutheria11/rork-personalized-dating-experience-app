export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  country: string;
  city: string;
  zipCode: string;
  budget: string;
  likes: string[];
  dislikes: string[];
}

export type RelationshipPhase = 'beginning' | 'courting' | 'exclusive' | 'casual' | 'patching';
export type DateGoal = 'impress' | 'fun' | 'conversation' | 'random';

export interface DateRecommendation {
  id?: string;
  title: string;
  description: string;
  location: string;
  estimatedCost: string;
  bestTime: string;
  tips?: string;
  address?: string;
  reservationUrl?: string;
}

export interface DateFeedback {
  id: string;
  venueTitle: string;
  venueLocation?: string;
  wentWell: string;
  wouldReturn: boolean;
  rating: number;
  createdAt: number;
}