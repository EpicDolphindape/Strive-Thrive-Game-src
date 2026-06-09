// Extracted from C:\Users\Hien Minh Pham\Downloads\game\final\js\data.js
// This file is a responsibility slice, not a standalone module.

// --- investment assets and transaction fee rules (source lines 141-169) ---
  const STOCKS = {
    'BNK-V': { code: 'BNK-V', sector: 'Banking',      basePrice: 60_000 },
    'TEC-F': { code: 'TEC-F', sector: 'Technology',   basePrice: 70_000 },
    'CSM-M': { code: 'CSM-M', sector: 'Consumer',     basePrice: 80_000 },
    'REA-V': { code: 'REA-V', sector: 'Real Estate',  basePrice: 150_000 },
    'ENE-G': { code: 'ENE-G', sector: 'Energy',       basePrice: 80_000 },
  };

  /**
   * Stock price change percentages per round (cumulative applied each round).
   * Indexed as [roundIndex] where roundIndex = round - 1.
   */
  const STOCK_PRICE_CHANGES = [
    // Round 1
    { 'BNK-V': 0.04,  'TEC-F': 0.03,  'CSM-M': 0.02,  'REA-V': 0.00,  'ENE-G': 0.00  },
    // Round 2
    { 'BNK-V': 0.00,  'TEC-F': 0.00,  'CSM-M': -0.02, 'REA-V': 0.00,  'ENE-G': 0.09  },
    // Round 3
    { 'BNK-V': 0.04,  'TEC-F': 0.04,  'CSM-M': 0.02,  'REA-V': 0.02,  'ENE-G': 0.02  },
    // Round 4
    { 'BNK-V': -0.05, 'TEC-F': -0.05, 'CSM-M': -0.07, 'REA-V': -0.05, 'ENE-G': -0.05 },
    // Round 5
    { 'BNK-V': 0.03,  'TEC-F': 0.03,  'CSM-M': 0.05,  'REA-V': 0.03,  'ENE-G': 0.03  },
  ];

  /** Stock trading fee percentage (applied on buy/sell) */
  const STOCK_TRADING_FEE = 0.0015; // 0.15%
  /** Stock sell tax rate (applied on sell only) */
  const STOCK_SELL_TAX = 0.001; // 0.10%

