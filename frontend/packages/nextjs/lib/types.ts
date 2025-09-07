export interface WindowPerformance {
  pnl: string;
  roi: string;
  vlm: string;
}

export type TimeWindow = 'day' | 'week' | 'month' | 'allTime';

export interface LeaderboardRow {
  ethAddress: string;
  accountValue: string;
  windowPerformances: [TimeWindow, WindowPerformance][];
  prize: number;
  displayName: string;
}

export interface LeaderboardResponse {
  leaderboardRows: LeaderboardRow[];
}

export interface LeaderboardApiResponse {
  timestamp: string;
  data: LeaderboardRow[];
}