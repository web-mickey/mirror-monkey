import { NextResponse } from "next/server";
import { Tagged, createClient } from "golem-base-sdk";

interface LeaderboardEntry {
  rank: number;
  name: string;
  address: string;
  platform: string;
  allTimePnl: string;
  weeklyPnl: string;
  monthlyPnl: string;
}

interface CompleteLeaderboardEntity {
  metadata: {
    entity_type: string;
    version: string;
    created_at: string;
    stored_by: string;
    integration: string;
    data_source: string;
  };
  leaderboard: {
    date: string;
    timestamp: number;
    totalTraders: number;
    topPerformers: LeaderboardEntry[];
    platformDistribution: Record<string, number>;
    totalAllTimePnl: string;
    totalWeeklyPnl: string;
    totalMonthlyPnl: string;
  };
  summary: {
    top_performer: LeaderboardEntry;
    biggest_weekly_gain: LeaderboardEntry;
    biggest_monthly_gain: LeaderboardEntry;
    platform_leaders: Record<string, LeaderboardEntry>;
    total_value_tracked: string;
    entries_count: number;
  };
}

function convertChainDataToFrontend(chainData: CompleteLeaderboardEntity) {
  return chainData.leaderboard.topPerformers.map((entry: LeaderboardEntry) => {
    const allTimePnl = parseFloat(entry.allTimePnl);
    const weeklyPnl = parseFloat(entry.weeklyPnl);
    const monthlyPnl = parseFloat(entry.monthlyPnl);
    
    // Create more realistic ROI estimates based on trader performance tiers
    // Higher performers likely had larger initial investments
    let estimatedInitialInvestment;
    if (allTimePnl > 100000000) { // >$100M
      estimatedInitialInvestment = allTimePnl * 0.2; // Assume 5x return for mega traders
    } else if (allTimePnl > 50000000) { // >$50M
      estimatedInitialInvestment = allTimePnl * 0.15; // Assume ~6.7x return
    } else if (allTimePnl > 10000000) { // >$10M
      estimatedInitialInvestment = allTimePnl * 0.12; // Assume ~8.3x return
    } else {
      estimatedInitialInvestment = allTimePnl * 0.08; // Assume ~12.5x return for smaller traders
    }
    
    // Ensure minimum investment makes sense
    estimatedInitialInvestment = Math.max(estimatedInitialInvestment, 50000);
    
    // Calculate ROI as (PnL / Initial Investment)
    const weeklyRoi = estimatedInitialInvestment > 0 ? weeklyPnl / estimatedInitialInvestment : 0;
    const monthlyRoi = estimatedInitialInvestment > 0 ? monthlyPnl / estimatedInitialInvestment : 0;
    const allTimeRoi = estimatedInitialInvestment > 0 ? allTimePnl / estimatedInitialInvestment : 0;

    const dayPerf = {
      pnl: "0",
      roi: "0",
      vlm: "0",
    };

    const weekPerf = {
      pnl: entry.weeklyPnl,
      roi: weeklyRoi.toString(),
      vlm: "0",
    };

    const monthPerf = {
      pnl: entry.monthlyPnl,
      roi: monthlyRoi.toString(),
      vlm: "0",
    };

    const allTimePerf = {
      pnl: entry.allTimePnl,
      roi: allTimeRoi.toString(),
      vlm: "0",
    };

    return {
      ethAddress: entry.address,
      accountValue: entry.allTimePnl,
      windowPerformances: [
        ["day" as const, dayPerf],
        ["week" as const, weekPerf],
        ["month" as const, monthPerf],
        ["allTime" as const, allTimePerf],
      ],
      prize: entry.rank,
      displayName: entry.name,
    };
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const privateKeyHex = process.env.PRIVATE_KEY?.replace("0x", "");
    if (!privateKeyHex) {
      return NextResponse.json({ error: "PRIVATE_KEY environment variable is required" }, { status: 500 });
    }

    const privateKey = new Uint8Array(privateKeyHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

    const client = await createClient(
      60138453033, // ETH Warsaw testnet Chain ID
      new Tagged("privatekey", privateKey),
      "https://ethwarsaw.holesky.golemdb.io/rpc",
      "wss://ethwarsaw.holesky.golemdb.io/rpc/ws",
    );

    const ownerAddress = await client.getOwnerAddress();
    const targetDate = date || "2025-09-07";
    const uniqueType = `leaderboard_${ownerAddress.slice(2, 10)}`;
    let query = `type = "${uniqueType}" && date = "${targetDate}"`;

    let results = await client.queryEntities(query);

    // If no results with unique type, try the generic type
    if (results.length === 0) {
      query = `type = "daily_leaderboard" && date = "${targetDate}"`;
      results = await client.queryEntities(query);
    }

    if (results.length === 0) {
      return NextResponse.json({ error: `No leaderboard data found for date: ${targetDate}` }, { status: 404 });
    }

    // Find the entity with the most traders (prefer the largest leaderboard)
    const decoder = new TextDecoder();
    let bestEntity: CompleteLeaderboardEntity | null = null;
    let maxTraders = 0;

    for (const result of results) {
      try {
        const entity = JSON.parse(decoder.decode(result.storageValue)) as CompleteLeaderboardEntity;
        if (entity.leaderboard.totalTraders > maxTraders) {
          maxTraders = entity.leaderboard.totalTraders;
          bestEntity = entity;
        }
      } catch (error) {
        console.warn("Failed to parse leaderboard entity:", error);
        continue;
      }
    }

    if (!bestEntity) {
      return NextResponse.json({ error: "No valid leaderboard data found" }, { status: 404 });
    }

    const leaderboardData = bestEntity;

    const convertedData = convertChainDataToFrontend(leaderboardData);

    return NextResponse.json({
      timestamp: leaderboardData.metadata.created_at,
      data: convertedData,
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard from chain:", error);
    return NextResponse.json(
      { error: `Failed to fetch leaderboard: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    );
  }
}
