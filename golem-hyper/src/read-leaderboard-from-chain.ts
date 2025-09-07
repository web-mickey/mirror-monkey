#!/usr/bin/env tsx

import { 
  createClient, 
  Tagged, 
  Annotation 
} from 'golem-base-sdk';
import { CompleteLeaderboardEntity, LeaderboardEntry } from './types/leaderboard';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Read and display leaderboard data stored on Golem DB chain
 */
async function readLeaderboardFromChain(date?: string) {
  console.log("=== READING LEADERBOARD FROM GOLEM DB CHAIN ===");
  console.log("");

  try {
    // Step 1: Initialize and connect to Golem DB
    console.log("1. Connecting to Golem DB...");
    const privateKeyHex = process.env.PRIVATE_KEY!.replace('0x', '');
    const privateKey = new Uint8Array(
      privateKeyHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const client = await createClient(
      60138453033, // ETH Warsaw testnet Chain ID
      new Tagged("privatekey", privateKey),
      "https://ethwarsaw.holesky.golemdb.io/rpc",
      "wss://ethwarsaw.holesky.golemdb.io/rpc/ws"
    );

    const ownerAddress = await client.getOwnerAddress();
    console.log("✅ Connected! Address:", ownerAddress);
    console.log("");

    // Step 2: Query for leaderboard entities (with unique namespace)
    console.log("2. Querying leaderboard entities...");
    const targetDate = date || "2025-09-07";
    const uniqueType = `leaderboard_${ownerAddress.slice(2, 10)}`;
    const query = `type = "${uniqueType}" && date = "${targetDate}"`;
    console.log(`Query: ${query}`);
    console.log(`├─ Using unique type: ${uniqueType}`);
    console.log(`├─ This namespace is unique to: ${ownerAddress}`);
    console.log("");

    const results = await client.queryEntities(query);
    console.log(`✅ Found ${results.length} leaderboard entities for ${targetDate}`);
    console.log("");

    if (results.length === 0) {
      console.log("❌ No leaderboard data found for the specified date");
      console.log("💡 Try querying all leaderboards:");
      
      const allQuery = 'type = "daily_leaderboard"';
      const allResults = await client.queryEntities(allQuery);
      console.log(`📊 Total leaderboard entities in system: ${allResults.length}`);
      
      if (allResults.length > 0) {
        console.log("📅 Available dates:");
        allResults.forEach((entity, index) => {
          try {
            const decoder = new TextDecoder();
            const data = JSON.parse(decoder.decode(entity.storageValue)) as CompleteLeaderboardEntity;
            console.log(`  ${index + 1}. ${data.leaderboard.date} (${data.leaderboard.totalTraders} traders, $${parseFloat(data.summary.total_value_tracked).toLocaleString()})`);
          } catch (e) {
            console.log(`  ${index + 1}. Parse error for entity ${entity.entityKey.slice(0, 16)}...`);
          }
        });
      }
      return;
    }

    // Step 3: Display each leaderboard entity found
    results.forEach((entity, entityIndex) => {
      try {
        console.log(`🏆 === LEADERBOARD ENTITY ${entityIndex + 1} ===`);
        console.log(`📍 Entity Key: ${entity.entityKey}`);
        
        const decoder = new TextDecoder();
        const leaderboardData = JSON.parse(decoder.decode(entity.storageValue)) as CompleteLeaderboardEntity;
        
        // Display metadata
        console.log("");
        console.log("📋 METADATA:");
        console.log(`├─ Entity Type: ${leaderboardData.metadata.entity_type}`);
        console.log(`├─ Version: ${leaderboardData.metadata.version}`);
        console.log(`├─ Created: ${leaderboardData.metadata.created_at}`);
        console.log(`├─ Stored by: ${leaderboardData.metadata.stored_by}`);
        console.log(`├─ Integration: ${leaderboardData.metadata.integration}`);
        console.log(`└─ Data Source: ${leaderboardData.metadata.data_source}`);
        
        // Display leaderboard summary
        console.log("");
        console.log("📊 LEADERBOARD SUMMARY:");
        console.log(`├─ Date: ${leaderboardData.leaderboard.date}`);
        console.log(`├─ Total Traders: ${leaderboardData.leaderboard.totalTraders}`);
        console.log(`├─ Total All-Time PnL: $${parseFloat(leaderboardData.leaderboard.totalAllTimePnl).toLocaleString()}`);
        console.log(`├─ Total Weekly PnL: $${parseFloat(leaderboardData.leaderboard.totalWeeklyPnl).toLocaleString()}`);
        console.log(`├─ Total Monthly PnL: $${parseFloat(leaderboardData.leaderboard.totalMonthlyPnl).toLocaleString()}`);
        
        // Platform distribution
        console.log(`└─ Platform Distribution:`);
        Object.entries(leaderboardData.leaderboard.platformDistribution).forEach(([platform, count]) => {
          console.log(`   ├─ ${platform}: ${count} traders`);
        });
        
        // Top performers summary
        console.log("");
        console.log("🥇 TOP PERFORMERS:");
        console.log(`├─ #1 All-Time: ${leaderboardData.summary.top_performer.name} (${leaderboardData.summary.top_performer.platform})`);
        console.log(`   └─ PnL: $${parseFloat(leaderboardData.summary.top_performer.allTimePnl).toLocaleString()}`);
        console.log(`├─ Biggest Weekly: ${leaderboardData.summary.biggest_weekly_gain.name}`);
        console.log(`   └─ Weekly PnL: $${parseFloat(leaderboardData.summary.biggest_weekly_gain.weeklyPnl).toLocaleString()}`);
        console.log(`├─ Biggest Monthly: ${leaderboardData.summary.biggest_monthly_gain.name}`);
        console.log(`   └─ Monthly PnL: $${parseFloat(leaderboardData.summary.biggest_monthly_gain.monthlyPnl).toLocaleString()}`);
        
        // Platform leaders
        console.log(`└─ Platform Leaders:`);
        Object.entries(leaderboardData.summary.platform_leaders).forEach(([platform, leader]) => {
          console.log(`   ├─ ${platform}: ${leader.name} (#${leader.rank}) - $${parseFloat(leader.allTimePnl).toLocaleString()}`);
        });
        
        // Display full leaderboard (first 20 + count)
        console.log("");
        console.log(`📈 COMPLETE LEADERBOARD (${leaderboardData.leaderboard.topPerformers.length} traders):`);
        
        // Show top 20 in detail
        const displayCount = Math.min(20, leaderboardData.leaderboard.topPerformers.length);
        leaderboardData.leaderboard.topPerformers.slice(0, displayCount).forEach((trader: LeaderboardEntry) => {
          const allTimePnl = parseFloat(trader.allTimePnl);
          const weeklyPnl = parseFloat(trader.weeklyPnl);
          const monthlyPnl = parseFloat(trader.monthlyPnl);
          
          console.log(`${trader.rank.toString().padStart(3)}. ${trader.name.padEnd(20)} | ${trader.platform.padEnd(10)} | All: $${allTimePnl.toLocaleString().padStart(15)} | Week: $${weeklyPnl.toLocaleString().padStart(12)} | Month: $${monthlyPnl.toLocaleString().padStart(12)}`);
        });
        
        if (leaderboardData.leaderboard.topPerformers.length > displayCount) {
          console.log(`     ... and ${leaderboardData.leaderboard.topPerformers.length - displayCount} more traders`);
        }
        
        // Statistics summary
        console.log("");
        console.log("📊 STATISTICS:");
        console.log(`├─ Total Entries Stored: ${leaderboardData.summary.entries_count}`);
        console.log(`├─ Data Complete: ${leaderboardData.leaderboard.topPerformers.length === leaderboardData.leaderboard.totalTraders ? '✅ Yes' : '❌ No'}`);
        console.log(`├─ Average PnL: $${(parseFloat(leaderboardData.summary.total_value_tracked) / leaderboardData.summary.entries_count).toLocaleString()}`);
        console.log(`└─ Storage Efficiency: All ${leaderboardData.leaderboard.totalTraders} traders in single entity`);
        
        console.log("");
        
      } catch (error) {
        console.error(`❌ Error parsing entity ${entityIndex + 1}:`, error);
        console.log(`Entity key: ${entity.entityKey}`);
      }
    });

    // Step 4: Query summary
    console.log("🎯 QUERY SUMMARY:");
    console.log(`├─ Query executed: ${query}`);
    console.log(`├─ Entities found: ${results.length}`);
    console.log(`├─ Connected as: ${ownerAddress}`);
    console.log(`└─ Network: ETH Warsaw Hackathon (Chain ID: 60138453033)`);
    console.log("");
    console.log("=== LEADERBOARD READ COMPLETED ===");

  } catch (error) {
    console.error('❌ Failed to read leaderboard from chain:', error);
    throw error;
  }
}

// Command line interface
async function main() {
  const targetDate = process.argv[2]; // Optional date argument
  
  if (targetDate) {
    console.log(`🎯 Reading leaderboard for specific date: ${targetDate}`);
  } else {
    console.log(`🎯 Reading leaderboard for default date: 2025-09-07`);
    console.log(`💡 Usage: tsx src/read-leaderboard-from-chain.ts [YYYY-MM-DD]`);
  }
  console.log("");
  
  await readLeaderboardFromChain(targetDate);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { readLeaderboardFromChain };