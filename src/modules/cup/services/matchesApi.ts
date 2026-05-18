import { mockMatches } from './mockData';
import type { Match } from './types';

export async function fetchMatches(): Promise<Match[]> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  return mockMatches;
}
