import axios, { AxiosInstance } from 'axios';
import {
  HyperliquidTrade,
  HyperliquidUserFillsRequest,
  HyperliquidApiResponse,
  HyperliquidOrder,
  HyperliquidOrderRequest,
  HyperliquidPosition,
  HyperliquidAssetMeta
} from '../types/hyperliquid';

export class HyperliquidAPIClient {
  private readonly baseURL = 'https://api.hyperliquid.xyz';
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Hyperliquid API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Fetch user fills (trade history) for a specific user
   */
  async getUserFills(userAddress: string): Promise<HyperliquidTrade[]> {
    try {
      const request: HyperliquidUserFillsRequest = {
        type: "userFills",
        user: userAddress
      };

      console.log(`Fetching fills for user: ${userAddress}`);
      
      const response = await this.client.post('/info', request);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from Hyperliquid API');
      }

      const fills: HyperliquidTrade[] = response.data.map((fill: any) => ({
        hash: fill.hash,
        tid: fill.tid,
        oid: fill.oid,
        coin: fill.coin,
        side: fill.side,
        sz: fill.sz,
        px: fill.px,
        time: fill.time,
        dir: fill.dir,
        closedPnl: fill.closedPnl || "0",
        fee: fill.fee,
        feeToken: fill.feeToken || "USDC",
        startPosition: fill.startPosition || "0",
        crossed: fill.crossed || false,
        builderFee: fill.builderFee,
        user: userAddress
      }));

      console.log(`Retrieved ${fills.length} fills for user ${userAddress}`);
      return fills;
    } catch (error) {
      console.error('Error fetching user fills:', error);
      throw error;
    }
  }

  /**
   * Fetch recent fills for a user (last N trades)
   */
  async getRecentFills(userAddress: string, limit: number = 100): Promise<HyperliquidTrade[]> {
    const allFills = await this.getUserFills(userAddress);
    
    // Sort by time (most recent first) and limit results
    return allFills
      .sort((a, b) => b.time - a.time)
      .slice(0, limit);
  }

  /**
   * Fetch fills within a specific time range
   */
  async getFillsByTimeRange(
    userAddress: string, 
    startTime: number, 
    endTime: number
  ): Promise<HyperliquidTrade[]> {
    const allFills = await this.getUserFills(userAddress);
    
    return allFills.filter(fill => 
      fill.time >= startTime && fill.time <= endTime
    );
  }

  /**
   * Fetch fills for a specific coin
   */
  async getFillsByCoin(userAddress: string, coin: string): Promise<HyperliquidTrade[]> {
    const allFills = await this.getUserFills(userAddress);
    
    return allFills.filter(fill => fill.coin === coin);
  }

  /**
   * Get user positions
   */
  async getUserPositions(userAddress: string): Promise<HyperliquidPosition[]> {
    try {
      const request = {
        type: "clearinghouseState",
        user: userAddress
      };

      console.log(`Fetching positions for user: ${userAddress}`);
      
      const response = await this.client.post('/info', request);
      
      if (!response.data?.assetPositions) {
        console.log('No positions found for user');
        return [];
      }

      const positions: HyperliquidPosition[] = response.data.assetPositions.map((pos: any) => ({
        user: userAddress,
        coin: pos.position.coin,
        leverage: pos.leverage || { type: "cross", value: 1 },
        maxTradeSzs: pos.maxTradeSzs || [],
        availableToTrade: pos.availableToTrade || [],
        markPx: pos.position.markPx || "0"
      }));

      console.log(`Retrieved ${positions.length} positions for user ${userAddress}`);
      return positions;
    } catch (error) {
      console.error('Error fetching user positions:', error);
      throw error;
    }
  }

  /**
   * Get asset metadata (available trading pairs, decimals, etc.)
   */
  async getAssetMetadata(): Promise<HyperliquidAssetMeta[]> {
    try {
      const request = { type: "meta" };
      
      console.log('Fetching asset metadata...');
      
      const response = await this.client.post('/info', request);
      
      if (!response.data?.universe) {
        throw new Error('No asset metadata found');
      }

      const assets: HyperliquidAssetMeta[] = response.data.universe.map((asset: any) => ({
        name: asset.name,
        szDecimals: asset.szDecimals || 6,
        maxLeverage: asset.maxLeverage || 1,
        onlyIsolated: asset.onlyIsolated || false
      }));

      console.log(`Retrieved metadata for ${assets.length} assets`);
      return assets;
    } catch (error) {
      console.error('Error fetching asset metadata:', error);
      throw error;
    }
  }

  /**
   * Get market data for all perpetuals
   */
  async getAllMids(): Promise<Record<string, string>> {
    try {
      const request = { type: "allMids" };
      
      const response = await this.client.post('/info', request);
      
      if (!response.data) {
        throw new Error('No market data found');
      }

      console.log(`Retrieved market data for ${Object.keys(response.data).length} assets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  /**
   * Get 24h volume statistics
   */
  async get24hVolume(): Promise<any> {
    try {
      const request = { type: "globalStats" };
      
      const response = await this.client.post('/info', request);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching 24h volume:', error);
      throw error;
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getAllMids();
      console.log('✅ Hyperliquid API connection successful');
      return true;
    } catch (error) {
      console.error('❌ Hyperliquid API connection failed:', error);
      return false;
    }
  }

  /**
   * Get API health status
   */
  async getHealthStatus(): Promise<{ status: string; timestamp: number }> {
    try {
      // Try to fetch basic data to verify API health
      const startTime = Date.now();
      await this.getAllMids();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Utility method to format timestamp to readable date
   */
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  /**
   * Utility method to calculate trade value in USD
   */
  static calculateTradeValue(trade: HyperliquidTrade): number {
    return parseFloat(trade.sz) * parseFloat(trade.px);
  }

  /**
   * Utility method to get trade direction as human-readable string
   */
  static getTradeDirection(trade: HyperliquidTrade): string {
    const isBuy = trade.side === "B";
    const isOpening = trade.dir.toLowerCase().includes("open");
    
    if (isOpening) {
      return isBuy ? "Open Long" : "Open Short";
    } else {
      return isBuy ? "Close Short" : "Close Long";
    }
  }

  /**
   * Utility method to filter trades by direction
   */
  static filterTradesByDirection(
    trades: HyperliquidTrade[], 
    direction: "long" | "short" | "open" | "close"
  ): HyperliquidTrade[] {
    return trades.filter(trade => {
      const tradeDir = trade.dir.toLowerCase();
      
      switch (direction) {
        case "long":
          return tradeDir.includes("long");
        case "short":
          return tradeDir.includes("short");
        case "open":
          return tradeDir.includes("open");
        case "close":
          return tradeDir.includes("close");
        default:
          return false;
      }
    });
  }
}