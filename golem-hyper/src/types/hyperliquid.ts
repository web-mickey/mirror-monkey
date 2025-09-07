// Hyperliquid API Types for the working integration

export interface HyperliquidTrade {
  hash: string;           // Transaction hash on Hyperliquid
  tid: number;            // Trade ID
  oid?: number;           // Order ID
  coin: string;           // Asset symbol (e.g., "BTC", "ETH", "MKR")
  side: "B" | "A";        // B = Buy, A = Sell
  sz: string;             // Trade size
  px: string;             // Execution price
  time: number;           // Timestamp (ms)
  dir?: string;           // Direction ("Open Long", "Close Short", "Settlement", etc.)
  closedPnl?: string;     // Closed P&L
  fee?: string;           // Trading fee amount
  feeToken?: string;      // Fee token (usually "USDC")
  startPosition?: string; // Position size before trade
  crossed?: boolean;      // Cross margin flag
  user?: string;          // User address (if available)
}

export interface HyperliquidUserFillsRequest {
  type: "userFills";
  user: string;           // User address
  startTime?: number;     // Optional start timestamp
  endTime?: number;       // Optional end timestamp
  limit?: number;         // Optional limit (default: 1000)
}

export interface HyperliquidApiResponse<T> {
  data?: T;
  error?: string;
}

export interface HyperliquidOrder {
  hash: string;
  oid: number;
  coin: string;
  side: "B" | "A";
  limitPx: string;
  sz: string;
  timestamp: number;
  orderType?: string;
}

export interface HyperliquidOrderRequest {
  type: "userOrders";
  user: string;
}

export interface HyperliquidPosition {
  coin: string;
  szi: string;            // Size
  entryPx?: string;       // Entry price
  positionValue?: string; // Position value
  unrealizedPnl?: string; // Unrealized PnL
  leverage?: string;      // Leverage
}

export interface HyperliquidAssetMeta {
  name: string;           // Asset name (e.g., "Bitcoin")
  szDecimals: number;     // Size decimals
  maxLeverage: number;    // Maximum leverage
  onlyIsolated?: boolean; // Isolated margin only
}