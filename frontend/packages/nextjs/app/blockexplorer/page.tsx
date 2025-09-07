import type { NextPage } from "next";

export const metadata = {
  title: "Block Explorer",
  description: "Block explorer page",
};

const BlockExplorer: NextPage = () => {
  return (
    <div className="max-w-md mx-auto mt-20 p-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-xl font-bold mb-4 text-center text-card-foreground">Block Explorer</h1>
        <p className="text-center text-muted-foreground">
          Block explorer functionality not available in this minimal auth app.
        </p>
      </div>
    </div>
  );
};

export default BlockExplorer;
