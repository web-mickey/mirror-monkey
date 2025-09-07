"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetchLeaderboard } from "../lib/leaderboard-api";
import { LeaderboardRow } from "../lib/types";
import { FaSortDown, FaSortUp } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

const PLATFORMS = [
  { name: "Hyperliquid", logo: "/hl.png" },
  { name: "EdgeX", logo: "/edgex.png" },
  { name: "Avantis", logo: "/avantis.png" },
];

// Function to get a random platform based on the trader's address
const getPlatformForTrader = (address: string) => {
  // Use the address as a seed for consistent random platform assignment
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash << 5) - hash + address.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % PLATFORMS.length;
  return PLATFORMS[index];
};

export function LeaderboardTable() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"name" | "weeklyPnl" | "monthlyPnl" | "allTimePnl">("allTimePnl");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        const response = await fetchLeaderboard();
        setLeaderboardData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  // Console log top 50 traders after all filtering and sorting
  useEffect(() => {
    if (leaderboardData.length > 0) {
      // Filter out rows where any USD display shows $0
      const filteredData = leaderboardData.filter(trader => {
        const allTimePerf = trader.windowPerformances.find(([window]) => window === "allTime")?.[1];
        const allTimePnl = allTimePerf ? parseFloat(allTimePerf.pnl) : 0;
        const allTimePnlRounded = Math.round(Math.abs(allTimePnl));

        return (
          allTimePnlRounded > 1000 // Only show traders with significant all-time PnL (> $1000)
        );
      });

      // Sort the filtered data
      const sortedDataFull = [...filteredData].sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortField) {
          case "name":
            aValue = a.displayName || "Anonymous";
            bValue = b.displayName || "Anonymous";
            break;
          case "weeklyPnl":
            const aWeeklyPerf = a.windowPerformances.find(([window]) => window === "week")?.[1];
            const bWeeklyPerf = b.windowPerformances.find(([window]) => window === "week")?.[1];
            aValue = aWeeklyPerf ? parseFloat(aWeeklyPerf.pnl) : 0;
            bValue = bWeeklyPerf ? parseFloat(bWeeklyPerf.pnl) : 0;
            break;
          case "monthlyPnl":
            const aMonthlyPerf = a.windowPerformances.find(([window]) => window === "month")?.[1];
            const bMonthlyPerf = b.windowPerformances.find(([window]) => window === "month")?.[1];
            aValue = aMonthlyPerf ? parseFloat(aMonthlyPerf.pnl) : 0;
            bValue = bMonthlyPerf ? parseFloat(bMonthlyPerf.pnl) : 0;
            break;
          case "allTimePnl":
            const aAllTimePerf = a.windowPerformances.find(([window]) => window === "allTime")?.[1];
            const bAllTimePerf = b.windowPerformances.find(([window]) => window === "allTime")?.[1];
            aValue = aAllTimePerf ? parseFloat(aAllTimePerf.pnl) : 0;
            bValue = bAllTimePerf ? parseFloat(bAllTimePerf.pnl) : 0;
            break;
          default: // allTimePnl
            const aAllTimePnlDefault = a.windowPerformances.find(([window]) => window === "allTime")?.[1];
            const bAllTimePnlDefault = b.windowPerformances.find(([window]) => window === "allTime")?.[1];
            aValue = aAllTimePnlDefault ? parseFloat(aAllTimePnlDefault.pnl) : 0;
            bValue = bAllTimePnlDefault ? parseFloat(bAllTimePnlDefault.pnl) : 0;
            break;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });

      const top50 = sortedDataFull.slice(0, 50);
      console.log("🏆 TOP 50 TRADERS (After filtering & sorting):", {
        totalFiltered: sortedDataFull.length,
        sortBy: sortField,
        sortDirection,
        top50Traders: top50.map((trader, index) => ({
          rank: index + 1,
          name: trader.displayName || "Anonymous",
          address: trader.ethAddress,
          platform: getPlatformForTrader(trader.ethAddress).name,
          allTimePnl: trader.windowPerformances.find(([window]) => window === "allTime")?.[1]?.pnl || "0",
          weeklyPnl: trader.windowPerformances.find(([window]) => window === "week")?.[1]?.pnl || "0",
          monthlyPnl: trader.windowPerformances.find(([window]) => window === "month")?.[1]?.pnl || "0",
        })),
      });
    }
  }, [leaderboardData, sortField, sortDirection]);

  if (loading) {
    return (
      <div className="modern-card">
        <div className="flex items-center justify-center h-32">
          <div className="text-white opacity-60">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-card">
        <div className="flex items-center justify-center h-32">
          <div className="text-white">Error: {error}</div>
        </div>
      </div>
    );
  }

  const handleSort = (
    field: "name" | "weeklyPnl" | "monthlyPnl" | "allTimePnl",
  ) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    setCurrentPage(1);
  };

  // Filter out rows where any USD display shows $0
  const filteredData = leaderboardData.filter(trader => {
    const allTimePerf = trader.windowPerformances.find(([window]) => window === "allTime")?.[1];
    const allTimePnl = allTimePerf ? parseFloat(allTimePerf.pnl) : 0;
    const allTimePnlRounded = Math.round(Math.abs(allTimePnl));

    return (
      allTimePnlRounded > 1000 // Only show traders with significant all-time PnL (> $1000)
    );
  });

  const sortedDataFull = [...filteredData].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case "name":
        aValue = a.displayName || "Anonymous";
        bValue = b.displayName || "Anonymous";
        break;
      case "weeklyPnl":
        const aWeeklyPerf = a.windowPerformances.find(([window]) => window === "week")?.[1];
        const bWeeklyPerf = b.windowPerformances.find(([window]) => window === "week")?.[1];
        aValue = aWeeklyPerf ? parseFloat(aWeeklyPerf.pnl) : 0;
        bValue = bWeeklyPerf ? parseFloat(bWeeklyPerf.pnl) : 0;
        break;
      case "monthlyPnl":
        const aMonthlyPerf = a.windowPerformances.find(([window]) => window === "month")?.[1];
        const bMonthlyPerf = b.windowPerformances.find(([window]) => window === "month")?.[1];
        aValue = aMonthlyPerf ? parseFloat(aMonthlyPerf.pnl) : 0;
        bValue = bMonthlyPerf ? parseFloat(bMonthlyPerf.pnl) : 0;
        break;
      case "allTimePnl":
        const aAllTimePerf = a.windowPerformances.find(([window]) => window === "allTime")?.[1];
        const bAllTimePerf = b.windowPerformances.find(([window]) => window === "allTime")?.[1];
        aValue = aAllTimePerf ? parseFloat(aAllTimePerf.pnl) : 0;
        bValue = bAllTimePerf ? parseFloat(bAllTimePerf.pnl) : 0;
        break;
      default: // allTimePnl
        const aAllTimePnlDefault = a.windowPerformances.find(([window]) => window === "allTime")?.[1];
        const bAllTimePnlDefault = b.windowPerformances.find(([window]) => window === "allTime")?.[1];
        aValue = aAllTimePnlDefault ? parseFloat(aAllTimePnlDefault.pnl) : 0;
        bValue = bAllTimePnlDefault ? parseFloat(bAllTimePnlDefault.pnl) : 0;
        break;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  // Limit to top 50 traders only
  const sortedData = sortedDataFull.slice(0, 50);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = sortedData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="modern-card">
      <div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white">
              Top Traders
              <span className="flex items-center gap-1 text-[10px] text-white opacity-50">
                data powered by
                <Image src="/golem.png" alt="Golem" width={70} height={43} />
                DB
              </span>
            </h2>
          </div>
          <div className="flex flex-col text-right text-sm text-white opacity-60">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length}
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="modern-table">
          <thead>
            <tr className="table-header">
              <th className="table-cell-header sortable" onClick={() => handleSort("name")}>
                Trader {sortField === "name" && (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th className="table-cell-header">Platform</th>
              <th className="table-cell-header sortable" onClick={() => handleSort("weeklyPnl")}>
                Weekly PnL {sortField === "weeklyPnl" && (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th className="table-cell-header sortable" onClick={() => handleSort("monthlyPnl")}>
                Monthly PnL {sortField === "monthlyPnl" && (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th className="table-cell-header sortable" onClick={() => handleSort("allTimePnl")}>
                All-Time PnL {sortField === "allTimePnl" && (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th className="table-cell-header"></th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(trader => {
              const weeklyPerformance = trader.windowPerformances.find(([window]) => window === "week")?.[1];
              const monthlyPerformance = trader.windowPerformances.find(([window]) => window === "month")?.[1];
              const allTimePerformance = trader.windowPerformances.find(([window]) => window === "allTime")?.[1];

              const weeklyPnl = weeklyPerformance ? parseFloat(weeklyPerformance.pnl) : 0;
              const monthlyPnl = monthlyPerformance ? parseFloat(monthlyPerformance.pnl) : 0;
              const allTimePnl = allTimePerformance ? parseFloat(allTimePerformance.pnl) : 0;

              const handleCopyTrade = () => {
                // No action - disabled
              };

              const platform = getPlatformForTrader(trader.ethAddress);

              return (
                <tr key={trader.ethAddress} className="table-row">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-white">{trader.displayName || "Anonymous"}</div>
                      <div className="text-xs text-white opacity-60">
                        {trader.ethAddress.slice(0, 6)}...{trader.ethAddress.slice(-4)}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Image
                        src={platform.logo}
                        alt={platform.name}
                        width={16}
                        height={16}
                        style={{ marginRight: "4px" }}
                      />
                      <span className="text-white">{platform.name}</span>
                    </div>
                  </td>
                  <td className={`table-cell ${weeklyPnl >= 0 ? "text-white" : "text-white opacity-60"}`}>
                    {weeklyPnl >= 0 ? "+" : ""}$
                    {weeklyPnl.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className={`table-cell ${monthlyPnl >= 0 ? "text-white" : "text-white opacity-60"}`}>
                    {monthlyPnl >= 0 ? "+" : ""}$
                    {monthlyPnl.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className={`table-cell ${allTimePnl >= 0 ? "text-white" : "text-white opacity-60"}`}>
                    {allTimePnl >= 0 ? "+" : ""}$
                    {allTimePnl.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="table-cell">
                    <button onClick={handleCopyTrade} className="modern-btn modern-btn-active text-xs px-3 py-1">
                      Copytrade
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="flex items-center gap-10">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNumber}
                className={`modern-btn ${currentPage === pageNumber ? "modern-btn-active" : "modern-btn-outline"}`}
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
