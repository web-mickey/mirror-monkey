"use client";

import React from "react";
import { CivicAuthProvider } from "@civic/auth-web3/react";
import { ThemeProvider } from "../components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme="dark"
      disableTransitionOnChange
    >
      <CivicAuthProvider clientId={process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || "YOUR_CIVIC_CLIENT_ID"}>
        {children}
      </CivicAuthProvider>
    </ThemeProvider>
  );
}
