import { LeaderboardApiResponse } from './types';

const LEADERBOARD_API_URL = 'http://localhost:3005';

export async function fetchLeaderboard(): Promise<LeaderboardApiResponse> {
  const response = await fetch(`${LEADERBOARD_API_URL}/leaderboard`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
  }
  
  return response.json();
}