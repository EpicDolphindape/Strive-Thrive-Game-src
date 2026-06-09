
  function updateStockPrices(currentPrices, round) {
    const changes = GAME_DATA.STOCK_PRICE_CHANGES[round - 1];
    const newPrices = { ...currentPrices };
    for (const [code, changePct] of Object.entries(changes)) {
      newPrices[code] = Math.round(newPrices[code] * (1 + changePct));
    }
    return newPrices;
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

