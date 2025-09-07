import "./globals.css";
import { Providers } from "./providers";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";

export const metadata = {
  title: "MirrorMonkey - Multichain Perps Copytrading",
  description: "Track and copy top perpetual futures traders across Hyperliquid, EdgeX, and Avantis. Real-time PnL leaderboard with upcoming automated copytrading features. Powered by Golem DB.",
  keywords: "copytrading, copy trading, perps, perpetual futures, trading, leaderboard, hyperliquid, edgex, avantis, mirror trading, DeFi, automated trading",
  authors: [{ name: "MirrorMonkey Team" }],
  openGraph: {
    title: "MirrorMonkey - Multichain Perps Copytrading",
    description: "Track and copy top perpetual futures traders across multiple DEXs. Automated copytrading coming soon!",
    type: "website",
    locale: "en_US",
    siteName: "MirrorMonkey"
  },
  twitter: {
    card: "summary_large_image",
    title: "MirrorMonkey - Multichain Perps Copytrading",
    description: "Track and copy top traders across Hyperliquid, EdgeX, and Avantis. Automated copytrading coming soon!"
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png"
  }
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
