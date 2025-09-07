// PnL Leaderboard Types for Golem DB Integration

export interface LeaderboardEntry {
  rank: number;
  name: string;
  address: string;
  platform: string;
  allTimePnl: string;
  weeklyPnl: string;
  monthlyPnl: string;
}

export interface DailyLeaderboard {
  date: string;
  timestamp: number;
  totalTraders: number;
  topPerformers: LeaderboardEntry[];
  platformDistribution: Record<string, number>;
  totalAllTimePnl: string;
  totalWeeklyPnl: string;
  totalMonthlyPnl: string;
}

export interface LeaderboardMetadata {
  entity_type: "DAILY_PNL_LEADERBOARD";
  version: string;
  created_at: string;
  stored_by: string;
  integration: string;
  data_source: string;
}

export interface CompleteLeaderboardEntity {
  metadata: LeaderboardMetadata;
  leaderboard: DailyLeaderboard;
  summary: {
    top_performer: LeaderboardEntry;
    biggest_weekly_gain: LeaderboardEntry;
    biggest_monthly_gain: LeaderboardEntry;
    platform_leaders: Record<string, LeaderboardEntry>;
    total_value_tracked: string;
    entries_count: number;
  };
}