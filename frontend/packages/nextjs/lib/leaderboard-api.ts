import { LeaderboardApiResponse } from './types';

export async function fetchLeaderboard(date?: string): Promise<LeaderboardApiResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (date) {
      searchParams.append('date', date);
    }
    
    const url = `/api/leaderboard${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
    
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch leaderboard');
  }
}