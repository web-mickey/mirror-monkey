#!/usr/bin/env tsx

import { storeDailyLeaderboard } from './daily-leaderboard-golem';
import { LeaderboardEntry } from './types/leaderboard';
import { readFileSync } from 'fs';
import { resolve, basename } from 'path';

/**
 * Load leaderboard data from a JSON file and store it in Golem DB
 * Usage: tsx src/file-based-leaderboard.ts [path/to/leaderboard.json]
 */

async function loadAndStoreLeaderboard(filePath?: string) {
  console.log("=== FILE-BASED LEADERBOARD LOADER ===");
  console.log("");

  try {
    const inputPath = filePath || process.argv[2];
    
    if (!inputPath) {
      console.log("📄 No file path provided, using sample data...");
      // Use the embedded sample data from daily-leaderboard-golem.ts
      await storeDailyLeaderboard();
      return;
    }

    console.log(`📂 Loading leaderboard data from: ${inputPath}`);
    
    const resolvedPath = resolve(inputPath);
    console.log(`├─ Resolved path: ${resolvedPath}`);
    
    // Extract date from filename if it matches YYYY-MM-DD pattern
    const filename = basename(resolvedPath, '.json');
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const dateFromFilename = datePattern.test(filename) ? filename : null;
    
    if (dateFromFilename) {
      console.log(`├─ Date from filename: ${dateFromFilename}`);
    }
    
    const fileContent = readFileSync(resolvedPath, 'utf-8');
    const leaderboardData: LeaderboardEntry[] = JSON.parse(fileContent);
    
    console.log(`✅ Loaded ${leaderboardData.length} leaderboard entries`);
    console.log(`├─ Top performer: ${leaderboardData[0]?.name || 'Unknown'}`);
    console.log(`├─ Platforms found: ${[...new Set(leaderboardData.map(e => e.platform))].join(', ')}`);
    console.log(`└─ Total all-time PnL: $${leaderboardData.reduce((sum, e) => sum + parseFloat(e.allTimePnl), 0).toLocaleString()}`);
    console.log("");
    
    // Validate data structure
    const isValidEntry = (entry: any): entry is LeaderboardEntry => {
      return entry && 
             typeof entry.rank === 'number' &&
             typeof entry.name === 'string' &&
             typeof entry.address === 'string' &&
             typeof entry.platform === 'string' &&
             typeof entry.allTimePnl === 'string' &&
             typeof entry.weeklyPnl === 'string' &&
             typeof entry.monthlyPnl === 'string';
    };
    
    const invalidEntries = leaderboardData.filter((entry, index) => {
      if (!isValidEntry(entry)) {
        console.log(`⚠️ Invalid entry at index ${index}:`, entry);
        return true;
      }
      return false;
    });
    
    if (invalidEntries.length > 0) {
      throw new Error(`Found ${invalidEntries.length} invalid entries in leaderboard data`);
    }
    
    console.log("✅ All entries validated successfully");
    console.log("");
    
    // Store in Golem DB with date from filename if available
    console.log("📡 Storing leaderboard in Golem DB...");
    await storeDailyLeaderboard(leaderboardData, dateFromFilename);
    
  } catch (error) {
    console.error('❌ Failed to load and store leaderboard:', error);
    
    if (error instanceof SyntaxError) {
      console.error('💡 JSON parsing failed - please check file format');
    } else if ((error as any).code === 'ENOENT') {
      console.error('💡 File not found - please check the path');
    }
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  loadAndStoreLeaderboard();
}

export { loadAndStoreLeaderboard };