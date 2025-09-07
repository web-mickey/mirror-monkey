# Daily PnL Leaderboard → Golem DB Integration

A complete TypeScript solution for storing and retrieving daily PnL leaderboards on Golem DB blockchain. This project efficiently stores entire leaderboards (50+ traders) as single on-chain entities with comprehensive metadata and querying capabilities.

## 🎯 **What This Does**

This integration solves the problem of storing large trading leaderboards on-chain efficiently:

- **Problem**: Storing individual trades is expensive and clutters the blockchain
- **Solution**: Store complete daily leaderboards as single entities with rich metadata
- **Result**: ~50 traders + analytics stored in one transaction (~17KB) vs 50+ separate transactions

## ✅ **Key Features**

### 📊 Complete Leaderboard Storage
- ✅ Stores **all 50 traders** (not just top 10) in single entity
- ✅ Preserves complete ranking data: rank, name, address, platform, PnL metrics
- ✅ Automatic date extraction from filename (e.g., `2025-09-07.json`)
- ✅ Platform distribution analysis (Avantis, EdgeX, Hyperliquid)
- ✅ Pre-calculated summaries and top performers

### 🔍 Rich Query Capabilities  
- ✅ Query by date: `type = "daily_leaderboard" && date = "2025-09-07"`
- ✅ Query by platform: `platforms = "Hyperliquid,Avantis,EdgeX"`
- ✅ Query by performance: `top_all_time_cents > 10000000000` (>$100M)
- ✅ Query by trader count: `total_traders > 25`
- ✅ Multiple string and numeric annotations for flexible filtering

### 🛠️ Complete Toolchain
- ✅ **Storage Tool**: File-based leaderboard storage with validation
- ✅ **Reading Tool**: On-chain data retrieval and formatted display
- ✅ **Verification Tool**: Data integrity checking
- ✅ **Official Golem DB SDK**: Uses `golem-base-sdk` for reliability

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your private key
```

3. **Store leaderboard data on-chain:**

**From date-named file (recommended):**
```bash
# File: data/2025-09-07.json → automatically uses 2025-09-07 as entity date
npm run leaderboard:today
```

**From any JSON file:**
```bash
npm run leaderboard:file path/to/your-leaderboard.json
```

**From embedded data:**
```bash
npm run leaderboard
```

4. **Read data from blockchain:**

**Read stored leaderboard:**
```bash
npm run leaderboard:read
# or specify date
npm run leaderboard:read 2025-09-07
```

**Verify data integrity:**
```bash
npx tsx src/verify-complete-data.ts
```

## 📋 **How It Works**

### 1. Data Processing Pipeline
```
JSON File → Validation → Date Extraction → Entity Creation → On-Chain Storage
```

1. **Load & Validate** leaderboard JSON file
2. **Extract Date** from filename (e.g., `2025-09-07.json`)
3. **Calculate Analytics** (platform distribution, summaries, leaders)
4. **Create Entity** with complete data + metadata + annotations
5. **Store On-Chain** using official Golem DB SDK
6. **Verify Storage** with query-based confirmation

### 2. Entity Structure
Each leaderboard entity contains:
- **Metadata**: Entity type, version, timestamps, integration info
- **Complete Leaderboard**: All 50 traders with full ranking data
- **Platform Analytics**: Distribution across Avantis, EdgeX, Hyperliquid
- **Performance Summaries**: Top performers, biggest gains, platform leaders
- **Query Annotations**: 12 string + 11 numeric fields for efficient filtering

## 📊 **Live Example Data**

### ✅ Successfully Stored Entity
- **Transaction Hash**: `0x5511ac481ba148368662a28e718a1a6b79284f5b2ed2f1e4581e8fb1d41c73d9`
- **Entity Key**: `0x3cdd3125106eb7159925da1668a325e12a2114a27116c5df632c4902caa89966`
- **Date**: 2025-09-07
- **Total Traders**: **50** (complete leaderboard)
- **Data Size**: 17,128 bytes (single entity)
- **Top Performer**: Anonymous ($309,103,011.997, Avantis)
- **Platform Distribution**: Avantis: 21, EdgeX: 16, Hyperliquid: 13  
- **Total Value Tracked**: $3,039,649,962.954
- **Biggest Weekly Gain**: Anonymous ($96,552,397.644)
- **Biggest Monthly Gain**: Anonymous ($168,507,656.050)

### 📈 Top 10 Traders Preview
```
  1. Anonymous            | Avantis    | $309,103,011.997
  2. thank you jefef      | Avantis    | $166,149,989.784
  3. Anonymous            | EdgeX      | $147,523,455.483
  4. Anonymous            | Hyperliquid | $112,799,229.845
  5. jefe                 | Hyperliquid | $103,786,039.980
  ...and 45 more traders (complete data on-chain)
```

## 🔍 **Query Examples**

### Basic Queries
```typescript
// Get today's leaderboard
'type = "daily_leaderboard" && date = "2025-09-07"'

// Find all leaderboards
'type = "daily_leaderboard"'

// Get leaderboards with 50+ traders
'type = "daily_leaderboard" && total_traders >= 50'
```

### Performance-Based Queries
```typescript
// High-value leaderboards (>$1B total)
'top_all_time_cents > 100000000000'

// Find specific top performer
'top_performer = "thank you jefef"'

// Platform-specific leaderboards
'platforms = "Hyperliquid,Avantis,EdgeX"'
```

### Advanced Analytics Queries
```typescript
// Large leaderboards from multiple platforms
'total_traders > 25 && platform_count >= 3'

// High weekly performance
'total_weekly_cents > 10000000000' // >$100M weekly

// Recent leaderboards
'timestamp > 1725677000000' // Unix timestamp
```

## 🏗️ **Project Architecture**

### Core Files
- **`src/daily-leaderboard-golem.ts`** - Main leaderboard storage integration
- **`src/file-based-leaderboard.ts`** - File loader with date extraction
- **`src/read-leaderboard-from-chain.ts`** - On-chain data reader/display tool
- **`src/verify-complete-data.ts`** - Data integrity verification
- **`src/types/leaderboard.ts`** - TypeScript interfaces for leaderboard data

### Data Files
- **`data/2025-09-07.json`** - Leaderboard data file (50 traders, auto-extracts date from filename)

### Configuration
- **`package.json`** - NPM scripts for easy tool execution
- **`.env`** - Private key configuration (create from `.env.example`)
- **`tsconfig.json`** - TypeScript configuration

### Dependencies
- **`golem-base-sdk`** - Official Golem DB SDK for blockchain operations
- **`tsx`** - TypeScript execution runtime
- **`ethers`** - Ethereum utilities
- **`dotenv`** - Environment variable management

## 📈 **Success Metrics & Verification**

### ✅ Storage Success
- **Entity Storage**: Successfully stored 7+ leaderboard entities
- **Data Completeness**: All 50 traders stored (verified with integrity check)
- **Query Functionality**: All entities findable via date, platform, performance queries
- **Transaction Confirmation**: Multiple confirmed on-chain transactions
- **Data Size Efficiency**: 17KB for complete 50-trader leaderboard

### 🔍 Verification Methods
```bash
# 1. Storage verification
npm run leaderboard:today
✅ Created 1 leaderboard entities

# 2. Query verification  
npm run leaderboard:read
✅ Found entities for your leaderboard data

# 3. Data integrity verification
npx tsx src/verify-complete-data.ts
✅ VERIFICATION: All 50 traders from ranks 1-50 stored successfully!
```

## 🌐 **Network Configuration**

- **Chain**: ETH Warsaw Hackathon Testnet
- **Chain ID**: 60138453033
- **RPC Endpoint**: https://ethwarsaw.holesky.golemdb.io/rpc
- **WebSocket**: wss://ethwarsaw.holesky.golemdb.io/rpc/ws
- **Golem DB Contract**: `0x0000000000000000000000000000000060138453`

## 📄 **Required JSON Format**

Your leaderboard file should follow this structure:
```json
[
  {
    "rank": 1,
    "name": "Anonymous",
    "address": "0x77c3ea550d2da44b120e55071f57a108f8dd5e45",
    "platform": "Avantis", 
    "allTimePnl": "309103011.9973880053",
    "weeklyPnl": "7112015.2720489996",
    "monthlyPnl": "42061092.1083469987"
  },
  ...
]
```

## 🚀 **NPM Scripts Reference**

```bash
# Storage Scripts
npm run leaderboard:today           # Store from data/2025-09-07.json (auto-extracts date)
npm run leaderboard:file <path>     # Store from any JSON file
npm run leaderboard                 # Store with embedded data

# Reading Scripts  
npm run leaderboard:read [date]     # Read from chain (optional date)

# Development Scripts
npm run build                       # Compile TypeScript
npx tsx src/verify-complete-data.ts # Verify data integrity
```

---

## ✅ **Status: Production Ready**
- **Latest Transaction**: `0x5511ac481ba148368662a28e718a1a6b79284f5b2ed2f1e4581e8fb1d41c73d9`
- **Latest Entity**: `0x3cdd3125106eb7159925da1668a325e12a2114a27116c5df632c4902caa89966`
- **Data Verified**: ✅ All 50 traders stored and retrievable
- **Integration**: ✅ File → Blockchain → Query workflow complete