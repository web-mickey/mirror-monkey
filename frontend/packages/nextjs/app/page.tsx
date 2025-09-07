"use client";

import { LeaderboardTable } from "../components/leaderboard-table";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="max-w-7xl mx-auto mt-2 p-4">
      <div className="page-separator">
        <div className="separator-line"></div>
        <div className="separator-line"></div>
      </div>
      <LeaderboardTable />
    </div>
  );
};

export default Home;
