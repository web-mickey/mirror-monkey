import type { NextPage } from "next";

export const metadata = {
  title: "Debug",
  description: "Debug page",
};

const Debug: NextPage = () => {
  return (
    <div className="max-w-md mx-auto mt-20 p-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-xl font-bold mb-4 text-center text-card-foreground">Debug</h1>
        <p className="text-center text-muted-foreground">
          Debug functionality not available in this minimal auth app.
        </p>
      </div>
    </div>
  );
};

export default Debug;
