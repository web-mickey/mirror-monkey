# 🏆 ETH Warsaw Hackathon Setup

Complete setup guide for using Hyperliquid-Golem DB integration at ETH Warsaw hackathon.

## ✅ Pre-configured for Hackathon

The project is **ready to use** with ETH Warsaw hackathon infrastructure:

- ✅ **RPC Endpoint**: `https://ethwarsaw.holesky.golemdb.io/rpc` (pre-configured)
- ✅ **Network**: Chain ID `60138453033`, Block `#66933+`
- ✅ **Gas Price**: `0.001 gwei` (extremely low cost!)
- ✅ **Golem DB**: Contract `0x0000000000000000000000000000000060138453`

## 🚀 Quick Start (5 minutes)

### 1. Clone & Install
```bash
git clone <repo-url>
cd hyperliquid-golem-db-integration
npm install
```

### 2. Test Connection
```bash
npm run test-rpc
```
Expected output:
```
✅ Network: unknown (Chain ID: 60138453033)
📦 Current block: 66933+
⛽ Gas price: 0.001000251 gwei
🎉 Hackathon RPC connection test PASSED!
```

### 3. Configure Wallet
```bash
cp .env.example .env
# Edit .env file with your private key
```

### 4. Test Hyperliquid API
```bash
npm run test
```
Expected: Fetches 2000+ real trades from Hyperliquid

### 5. Sync Your First Trades
```bash
npm run sync-trades recent 10
```

## 🧪 Live Test Results

**Successfully tested with real infrastructure:**

```
🧪 ETH Warsaw Hackathon RPC Connection...
🔗 Connecting to: https://ethwarsaw.holesky.golemdb.io/rpc
✅ Network: unknown (Chain ID: 60138453033)
📦 Current block: 66933
⛽ Gas price: 0.001000251 gwei
🎉 Hackathon RPC connection test PASSED!

🧪 Hyperliquid API Connection...
✅ Retrieved market data for 426 coins
✅ Retrieved global statistics  
✅ Retrieved metadata for 206 assets
📋 Sample trade: 0.3964 MKR @ $1,830.00 = $725.41
🎉 All tests PASSED!
```

## 💻 Demo Commands

```bash
# Test hackathon RPC (no wallet needed)
npm run test-rpc

# Fetch live Hyperliquid data
npm run sync-trades stats

# Query by coin
tsx src/query-trades.ts coin BTC

# Complex query: ETH buys above $3000
tsx src/query-trades.ts complex ETH B 3000

# Show comprehensive statistics
tsx src/query-trades.ts stats
```

## 📊 What You'll Build

### Real-time Trading Data Pipeline
```
Hyperliquid DEX → TypeScript API → Golem DB → Blockchain Storage
     ↓               ↓              ↓            ↓
  Live Trades → Data Processing → Decentralized → Query Engine
```

### Example Trade Data Stored
```json
{
  "tid": 366762011953327,
  "coin": "MKR", 
  "side": "A",
  "sz": "0.3964",
  "px": "1830.0",
  "value": 725.41,
  "time": 1725531438907,
  "dir": "Close Long",
  "fee": "0.73"
}
```

### Query Capabilities
- **By Asset**: All BTC trades
- **By Time**: Last 24 hours  
- **By Price**: Trades above $50k
- **By User**: Specific wallet address
- **Complex**: BTC buys > $40k in last week

## 🏗️ Architecture Highlights

### 1. Hyperliquid Integration
- **426+ trading pairs** supported
- **Real-time data** fetching
- **2000+ trades** retrieved in tests
- **Full trade history** access

### 2. Golem DB Storage  
- **Blockchain persistence** (immutable)
- **Configurable TTL** (blocks to live)
- **Efficient indexing** (string/numeric annotations)
- **Batch operations** (gas optimization)

### 3. TypeScript Safety
- **Complete type definitions** for all APIs
- **Error handling** and validation
- **CLI tools** for easy usage
- **Comprehensive testing**

## 🎯 Hackathon Use Cases

### 1. DeFi Analytics Dashboard
```typescript
// Get all trades for analysis
const trades = await hyperliquid.getUserFills(userAddress);
const btcTrades = trades.filter(t => t.coin === 'BTC');

// Store permanently on blockchain
await golemDB.saveTrades(btcTrades);

// Query historical data
const profits = await golemDB.getTradesByComplexQuery(
  undefined, 'B', 40000, undefined, lastWeek, now
);
```

### 2. Trading Bot Data Store
```typescript
// Real-time trade monitoring
const recentTrades = await hyperliquid.getRecentFills(botAddress, 100);

// Permanent storage with TTL
await golemDB.saveTrades(recentTrades, 1000000); // ~6 months

// Performance analysis
const stats = await queryService.getStoredTradeStats(botAddress);
```

### 3. Multi-chain Trade Aggregator
```typescript
// Combine Hyperliquid with other DEXs
const hyperliquidTrades = await hyperliquid.getUserFills(user);
// ... fetch from other DEXs ...

// Store all in Golem DB with metadata
const allTrades = [...hyperliquidTrades, ...otherTrades];
await golemDB.saveTrades(allTrades);
```

## 🔧 Advanced Features

### Batch Processing
```bash
# Sync 1000 trades in batches of 10
BATCH_SIZE=10 npm run sync-trades recent 1000
```

### Time-based Queries  
```bash
# Last 24 hours (Unix timestamp)
tsx src/query-trades.ts timerange 1725445438000 1725531838000
```

### Statistical Analysis
```bash
# Comprehensive trading statistics
tsx src/query-trades.ts stats
# Output: Win rate, volume, fees, top coins, etc.
```

## 💰 Cost Analysis (Hackathon Network)

**Extremely low costs thanks to hackathon network:**

- **Gas Price**: 0.001 gwei
- **Single Trade Storage**: ~$0.0001 USD
- **Batch of 10 Trades**: ~$0.001 USD
- **1000 Trades**: ~$0.10 USD

Compare to Ethereum mainnet: **1000x cheaper!**

## 🚨 Important Notes

### For Hackathon Success
1. **Test early**: Run `npm run test-rpc` first
2. **Start small**: Sync 10 trades initially
3. **Monitor gas**: Very cheap, but still track usage
4. **Use real data**: Hyperliquid has 2000+ live trades

### Production Considerations
1. **Rate limits**: Hyperliquid API has limits
2. **Data retention**: Set appropriate BTL values
3. **Error handling**: Network failures are possible
4. **Batch optimization**: Balance speed vs cost

## 🎉 Ready to Ship!

The integration is **hackathon-ready** with:

- ✅ Real chain connections tested
- ✅ Live data integration verified  
- ✅ Low-cost transactions confirmed
- ✅ Complete documentation provided
- ✅ CLI tools for easy demo

**Build the future of DeFi data storage at ETH Warsaw! 🚀**