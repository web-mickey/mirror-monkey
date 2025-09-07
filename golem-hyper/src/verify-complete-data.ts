#!/usr/bin/env tsx

import { createClient, Tagged } from 'golem-base-sdk';
import { CompleteLeaderboardEntity } from './types/leaderboard';
import dotenv from 'dotenv';

dotenv.config();

async function verifyCompleteData() {
  console.log("=== VERIFYING COMPLETE LEADERBOARD DATA ===");
  
  const privateKeyHex = process.env.PRIVATE_KEY!.replace('0x', '');
  const privateKey = new Uint8Array(
    privateKeyHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  const client = await createClient(
    60138453033,
    new Tagged("privatekey", privateKey),
    "https://ethwarsaw.holesky.golemdb.io/rpc",
    "wss://ethwarsaw.holesky.golemdb.io/rpc/ws"
  );

  // Get the latest/largest entity
  const results = await client.queryEntities('type = "daily_leaderboard" && date = "2025-09-07"');
  
  let largestEntity = null;
  let maxTraders = 0;
  
  for (const entity of results) {
    try {
      const decoder = new TextDecoder();
      const data = JSON.parse(decoder.decode(entity.storageValue)) as CompleteLeaderboardEntity;
      
      if (data.leaderboard.totalTraders > maxTraders) {
        maxTraders = data.leaderboard.totalTraders;
        largestEntity = { entity, data };
      }
    } catch (e) {
      console.log(`Error parsing entity: ${e}`);
    }
  }
  
  if (largestEntity) {
    const { data } = largestEntity;
    console.log(`\n📊 LARGEST ENTITY ANALYSIS:`);
    console.log(`├─ Entity Claims: ${data.leaderboard.totalTraders} traders`);
    console.log(`├─ TopPerformers Array Length: ${data.leaderboard.topPerformers.length}`);
    console.log(`├─ Data Integrity: ${data.leaderboard.totalTraders === data.leaderboard.topPerformers.length ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    
    if (data.leaderboard.topPerformers.length >= 50) {
      console.log(`\n🏆 ALL 50 TRADERS STORED SUCCESSFULLY!`);
      console.log(`\n📈 COMPLETE LEADERBOARD (ALL ${data.leaderboard.topPerformers.length} ENTRIES):`);
      
      data.leaderboard.topPerformers.forEach((trader, index) => {
        const allTime = parseFloat(trader.allTimePnl);
        const weekly = parseFloat(trader.weeklyPnl);
        const monthly = parseFloat(trader.monthlyPnl);
        
        console.log(`${trader.rank.toString().padStart(3)}. ${trader.name.substring(0, 20).padEnd(20)} | ${trader.platform.padEnd(10)} | $${allTime.toLocaleString().padStart(15)} | $${weekly.toLocaleString().padStart(12)} | $${monthly.toLocaleString().padStart(12)}`);
      });
      
      console.log(`\n✅ VERIFICATION: All ${data.leaderboard.topPerformers.length} traders from ranks 1-${data.leaderboard.topPerformers[data.leaderboard.topPerformers.length-1].rank} stored successfully!`);
    } else {
      console.log(`\n❌ INCOMPLETE: Only ${data.leaderboard.topPerformers.length} of ${data.leaderboard.totalTraders} traders stored.`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verifyCompleteData().catch(console.error);
}