// Extracted from js\health.js
// This file is a responsibility slice, not a standalone module.

// --- stock price updates and portfolio calculations (source lines 344-428) ---
  function updateStockPrices(currentPrices, round, marketBranch) {
    const data = (marketBranch && GAME_DATA.MARKET_EVENT_TREE[marketBranch]);
    if (!data || !data.stockParams) {
      // Fallback to static changes if params are missing for some reason
      const changes = (data && data.stockPriceChanges)
        ? data.stockPriceChanges
        : GAME_DATA.STOCK_PRICE_CHANGES[round - 1];
      const newPrices = { ...currentPrices };
      const stockPriceChanges = {};
      for (const [code, changePct] of Object.entries(changes)) {
        newPrices[code] = Math.round(newPrices[code] * (1 + changePct));
        stockPriceChanges[code] = changePct;
      }
      return { newPrices, stockPriceChanges };
    }

    const rMarket = data.stockParams.rMarket;
    const newPrices = { ...currentPrices };
    const stockPriceChanges = {};

    for (const [code, price] of Object.entries(currentPrices)) {
      const params = data.stockParams.stocks[code];
      if (!params) {
        stockPriceChanges[code] = 0;
        continue;
      }

      const { rSector, gamma, mScenario, sigmaBase } = params;
      const sigma = sigmaBase * mScenario;
      // Generate uniform random number in [-sigma, sigma]
      const epsilon = (Math.random() * 2 - 1) * sigma;
      const r_i = rMarket + gamma * rSector + epsilon;

      newPrices[code] = Math.round(price * (1 + r_i));
      stockPriceChanges[code] = r_i;
    }

    return { newPrices, stockPriceChanges };
  }

  /**
   * Calculate portfolio total market value.
   *
   * @param {object} portfolio    { code: { quantity, avgCost } }
   * @param {object} prices       { code: currentPrice }
   * @returns {number} total market value
   */
  function calcPortfolioValue(portfolio, prices) {
    let total = 0;
    for (const [code, pos] of Object.entries(portfolio)) {
      total += pos.quantity * (prices[code] || 0);
    }
    return total;
  }

  /**
   * Calculate unrealised gain/loss for a stock position.
   *
   * @param {{ quantity, avgCost }} position
   * @param {number} currentPrice
   * @returns {{ gainLoss, gainLossPct }}
   */
  function calcStockGainLoss(position, currentPrice) {
    const costBasis = position.avgCost * position.quantity;
    const marketVal = currentPrice * position.quantity;
    const gainLoss  = marketVal - costBasis;
    const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    return { gainLoss, gainLossPct };
  }

  /* ──────────────────────────────────────────────────────────
     END-GAME SCORING
     ────────────────────────────────────────────────────────── */

  /**
   * Calculate final scores for the game-end screen.
   *
   * @param {object} finalStats  { cash, investment, physicalHealth, mentalHealth }
   * @param {number} [benchmarkNetWorth=500_000_000]  Reference net worth for score (optional)
   *
   * @returns {object}
   *   { netWorthScore, wellbeingScore, totalScore,
   *     netWorthLabel, wellbeingLabel,
   *     archetype, label2, label3, badgeFile }
   */

