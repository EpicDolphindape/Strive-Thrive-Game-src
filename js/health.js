/**
 * STRIVE & THRIVE — Health & Score Calculations (health.js)
 * ============================================================
 * Pure calculation functions — no DOM, no side effects.
 * All inputs/outputs are plain numbers.
 *
 * Depends on: data.js  (GAME_DATA must be available globally)
 * ============================================================
 */

const HEALTH = (() => {

  /* ──────────────────────────────────────────────────────────
     INCOME CALCULATION
     ────────────────────────────────────────────────────────── */

  /**
   * Calculate all income components for one round.
   *
   * @param {object} params
   * @param {number}   params.monthlySalary   From GAME_DATA.ROUNDS
   * @param {number}   params.otHours         0 | 10 | 20 | 30 | 40
   * @param {string}   params.sideJob         key in GAME_DATA.SIDE_JOBS
   * @param {number}   params.sideJobHours    0 | 10 | 20 | 30 | 40
   * @param {number}   params.savingsBalance  For interest calculation
   * @param {number}   params.round           1–5
   *
   * @returns {object}
   *   { mainJobMonthly, mainJobAnnual,
   *     otMonthly, otAnnual,
   *     sideJobMonthly, sideJobAnnual,
   *     savingsInterest,
   *     totalMonthly, totalAnnual }
   */
  function calcIncome({ monthlySalary, otHours, sideJob, sideJobHours, savingsBalance, round = 1, savingsRateAdjustment = 0 }) {
    // Main salary
    const mainJobMonthly = monthlySalary;
    const mainJobAnnual  = mainJobMonthly * 12;

    // OT
    const otWage         = GAME_DATA.getOTWage(monthlySalary);
    const otMonthly      = otWage * otHours;
    const otAnnual       = otMonthly * 12;

    // Side job
    const sideJobData    = GAME_DATA.SIDE_JOBS[sideJob] || GAME_DATA.SIDE_JOBS.none;
    const sideJobMonthly = sideJobData.wage * sideJobHours;
    const sideJobAnnual  = sideJobMonthly * 12;

    // Savings interest (annual)
    const savingsRate     = GAME_DATA.getSavingsRate(savingsBalance, round, savingsRateAdjustment);
    const savingsInterest = savingsBalance * savingsRate;

    // Totals
    const totalMonthly = mainJobMonthly + otMonthly + sideJobMonthly;
    const totalAnnual  = mainJobAnnual  + otAnnual  + sideJobAnnual + savingsInterest;

    return {
      mainJobMonthly, mainJobAnnual,
      otMonthly,      otAnnual,
      sideJobMonthly, sideJobAnnual,
      savingsInterest,
      totalMonthly,   totalAnnual,
    };
  }

  /* ──────────────────────────────────────────────────────────
     EXPENSE CALCULATION
     ────────────────────────────────────────────────────────── */

  /**
   * Calculate annual expense totals.
   *
   * @param {object} expenses  Monthly values: { housing, food, utility, transport, healthcare, entertainment }
   * @param {number} insuranceFee  Annual insurance fee (0 if not purchased)
   *
   * @returns {object}
   *   { annual: { housing, food, ... }, totalAnnual }
   */
  function calcExpenses(expenses, insuranceFee = 0, inflationRate = 0) {
    const annual = {};
    let totalAnnual = 0;

    for (const [key, monthly] of Object.entries(expenses)) {
      const adjustedMonthly = monthly * (1 + inflationRate);
      annual[key] = adjustedMonthly * 12;
      totalAnnual += adjustedMonthly * 12;
    }

    annual.insurance = insuranceFee;
    totalAnnual += insuranceFee;

    return { annual, totalAnnual };
  }

  /* ──────────────────────────────────────────────────────────
     MENTAL HEALTH CALCULATION
     ────────────────────────────────────────────────────────── */

  /**
   * Calculate the mental health change for one round.
   * Returns a breakdown object and the final delta.
   *
   * @param {object} params
   * @param {number}   params.totalMonthlyIncome   monthly (used for quintile + ratios)
   * @param {number}   params.otHours
   * @param {number}   params.sideJobHours
   * @param {object}   params.monthlyExpenses      { healthcare, entertainment, housing, food, utility, transport }
   * @param {number}   params.round                1–5
   * @param {number}   [params.eventEffect=0]      Sum of life event MH impacts
   *
   * @returns {object}
   *   { incomePenalty, extraworkPenalty, expenseEffect, eventEffect, totalDelta }
   */
  function calcMentalHealthDelta({
    totalMonthlyIncome,
    otHours,
    sideJob,
    sideJobHours,
    monthlyExpenses,
    round,
    eventEffect = 0,
  }) {
    // 1. Income-based penalty
    const quintile     = GAME_DATA.getIncomeQuintile(totalMonthlyIncome, round);
    const multiplier   = GAME_DATA.MH_MULTIPLIERS[quintile];
    const incomePenalty = GAME_DATA.BASE_HEALTH_LOSS * multiplier; // annual loss

    // 2. Overtime & Side-job penalty
    const overtimePenalty = 5 * 0.048 * otHours;
    const mhJobMultiplier = GAME_DATA.SIDE_JOB_MH_MULTIPLIERS[sideJob || 'none'] || 0;
    const sideJobPenalty  = 5 * 0.048 * sideJobHours * mhJobMultiplier;
    const extraworkPenalty = overtimePenalty + sideJobPenalty;

    // 3. Expense-adjusted MH effect
    //    effect = 15 × Σ( coeff_i × (baseRatio_i - actualRatio_i) )
    const income = totalMonthlyIncome;
    let expenseSum = 0;
    const coeffMap = GAME_DATA.MH_EXPENSE_COEFF;
    const baseMap  = GAME_DATA.BASE_RATIOS;

    const expenseKeys = ['healthcare', 'entertainment', 'housing', 'food', 'utility', 'transport'];
    for (const key of expenseKeys) {
      const actualRatio = income > 0 ? (monthlyExpenses[key] || 0) / income : 0;
      const baseRatio   = baseMap[key];
      const coeff       = coeffMap[key];
      expenseSum += coeff * (baseRatio - actualRatio);
    }
    const expenseEffect = 10.57 * expenseSum;

    // 4. Total delta (positive = health increases, negative = decreases)
    const totalDelta = -incomePenalty - extraworkPenalty + expenseEffect + eventEffect;

    return { incomePenalty, overtimePenalty, sideJobPenalty, extraworkPenalty, expenseEffect, eventEffect, totalDelta };
  }

  /* ──────────────────────────────────────────────────────────
     PHYSICAL HEALTH CALCULATION
     ────────────────────────────────────────────────────────── */

  /**
   * Calculate the physical health change for one round.
   *
   * @param {object} params
   * @param {number}   params.totalMonthlyIncome
   * @param {number}   params.otHours
   * @param {string}   params.sideJob
   * @param {number}   params.sideJobHours
   * @param {number}   params.monthlyHealthcare    Player's healthcare expense per month
   * @param {number}   params.round               1–5
   * @param {number}   [params.eventEffect=0]
   *
   * @returns {object}
   *   { incomePenalty, overtimePenalty, sideJobPenalty, extraworkPenalty, healthcareRecovery, eventEffect, totalDelta }
   */
  function calcPhysicalHealthDelta({
    totalMonthlyIncome,
    otHours,
    sideJob,
    sideJobHours,
    monthlyHealthcare,
    round,
    eventEffect = 0,
  }) {
    // 1. Income-based penalty
    const quintile      = GAME_DATA.getIncomeQuintile(totalMonthlyIncome, round);
    const multiplier    = GAME_DATA.PH_MULTIPLIERS[quintile];
    const incomePenalty = GAME_DATA.BASE_HEALTH_LOSS * multiplier;

    // 2. Overtime & Side-job penalty
    const overtimePenalty = 5 * 0.034 * otHours;
    const phJobMultiplier = GAME_DATA.SIDE_JOB_PH_MULTIPLIERS[sideJob || 'none'] || 0;
    const sideJobPenalty  = 5 * 0.034 * sideJobHours * phJobMultiplier;
    const extraworkPenalty = overtimePenalty + sideJobPenalty;

    // 3. Healthcare recovery (annual, stepped)
    const annualHealthcare = monthlyHealthcare * 12;
    const annualIncome     = totalMonthlyIncome * 12;
    const healthcareRecovery = GAME_DATA.getHealthcareRecovery(annualHealthcare, annualIncome);

    // 4. Total delta
    const totalDelta = -incomePenalty - extraworkPenalty + healthcareRecovery + eventEffect;

    return { incomePenalty, overtimePenalty, sideJobPenalty, extraworkPenalty, healthcareRecovery, eventEffect, totalDelta };
  }

  /* ──────────────────────────────────────────────────────────
     APPLY ROUND RESULTS
     ────────────────────────────────────────────────────────── */

  /**
   * Apply one full round of decisions to the player state.
   * Returns a new state object (does NOT mutate input).
   *
   * @param {object} state      Current player state (from GAME_DATA.createInitialState)
   * @param {object} decisions  Round decisions (from GAME_DATA.createRoundDecision)
   * @param {Array}  events     Life events that fired: [{ mhImpact, phImpact, cashImpact }, ...]
   *
   * @returns {object}  New state + breakdown
   */
  function applyRound(state, decisions, events = []) {
    const round   = state.currentRound;
    const meta    = GAME_DATA.ROUNDS[round - 1];

    // Helper to check if event is unconditional (start of round event or health warning)
    const isUnconditionalEvent = (eventId) => {
      return true;
    };

    // ── Life event totals (including all events for complete delta description)
    const eventCashTotal = events.reduce((s, e) => s + (e.cashImpact || 0), 0);
    const eventMHTotal   = events.reduce((s, e) => s + (e.mhImpact   || 0), 0);
    const eventPHTotal   = events.reduce((s, e) => s + (e.phImpact   || 0), 0);

    // Starting event totals (already applied to state.stats at the start of the round)
    const startingCash = events.filter(e => isUnconditionalEvent(e.id)).reduce((s, e) => s + (e.cashImpact || 0), 0);
    const startingMH   = events.filter(e => isUnconditionalEvent(e.id)).reduce((s, e) => s + (e.mhImpact   || 0), 0);
    const startingPH   = events.filter(e => isUnconditionalEvent(e.id)).reduce((s, e) => s + (e.phImpact   || 0), 0);

    // ── Income
    const incomeResult = calcIncome({
      monthlySalary:   meta.monthlySalary,
      otHours:         decisions.otHours,
      sideJob:         decisions.sideJob,
      sideJobHours:    decisions.sideJobHours,
      savingsBalance:  state.savingsBalance,
      round,
      savingsRateAdjustment: state.savingsRateAdjustment || 0,
    });

    // ── Expenses
    const insuranceFee = state.hasInsurance ? GAME_DATA.getInsuranceFee(round) : 0;
    const expenseResult = calcExpenses(decisions.expenses, insuranceFee, state.inflationRate || 0);

    // ── Net cash (annual) — events affect cash directly
    const netIncome = incomeResult.totalAnnual - expenseResult.totalAnnual + eventCashTotal;

    // ── Mental health
    const mhDelta = calcMentalHealthDelta({
      totalMonthlyIncome: incomeResult.totalMonthly,
      otHours:            decisions.otHours,
      sideJob:            decisions.sideJob,
      sideJobHours:       decisions.sideJobHours,
      monthlyExpenses:    decisions.expenses,
      round,
      eventEffect:        eventMHTotal,
    });

    // ── Physical health
    const phDelta = calcPhysicalHealthDelta({
      totalMonthlyIncome: incomeResult.totalMonthly,
      otHours:            decisions.otHours,
      sideJob:            decisions.sideJob,
      sideJobHours:       decisions.sideJobHours,
      monthlyHealthcare:  decisions.expenses.healthcare || 0,
      round,
      eventEffect:        eventPHTotal,
    });

    // ── New stat values (subtract already applied starting event impacts and main job salary pre-added at round start, and auto-withdraw savings balance)
    const mainJobAnnual = meta.monthlySalary * 12;
    const newCash     = state.stats.cash + netIncome - startingCash - mainJobAnnual + state.savingsBalance;
    const newPH       = Math.max(0, Math.min(100, state.stats.physicalHealth + phDelta.totalDelta - startingPH));
    const newMH       = Math.max(0, Math.min(100, state.stats.mentalHealth   + mhDelta.totalDelta - startingMH));

    // ── Check lose conditions
    let loseCondition = null;
    if (newCash <= 0)    loseCondition = 'cash';
    else if (newPH <= 0) loseCondition = 'physical';
    else if (newMH <= 0) loseCondition = 'mental';

    // ── Build new state (immutable pattern)
    const newState = {
      ...state,
      currentRound: round + 1,
      savingsBalance: 0, // Auto-withdraw resets savings balance to 0 for the next round
      stats: {
        cash:           newCash,
        investment:     state.stats.investment, // updated separately via stock logic
        physicalHealth: newPH,
        mentalHealth:   newMH,
      },
      loseCondition,
      rounds: [
        ...state.rounds,
        {
          round,
          decisions,
          events,
          income:  incomeResult,
          expense: expenseResult,
          netIncome,
          mhDelta,
          phDelta,
          marketBranch:          state.marketBranch || '1.1',
          savingsRateAdjustment: state.savingsRateAdjustment || 0,
          inflationRate:         state.inflationRate || 0,
          endStats: {
            cash:           newCash,
            investment:     state.stats.investment,
            physicalHealth: newPH,
            mentalHealth:   newMH,
          },
        },
      ],
    };

    return { newState, income: incomeResult, expense: expenseResult, mhDelta, phDelta, netIncome };
  }

  /* ──────────────────────────────────────────────────────────
     STOCK CALCULATIONS
     ────────────────────────────────────────────────────────── */

  /**
   * Update stock prices for a given round.
   * Returns an object { newPrices, stockPriceChanges }.
   *
   * @param {object} currentPrices  { 'BNK-V': price, ... }
   * @param {number} round          1-indexed
   * @param {string} marketBranch   branch key e.g. '1.1'
   * @returns {object}              { newPrices, stockPriceChanges }
   */
  function updateStockPrices(currentPrices, round, marketBranch) {
    const data = (marketBranch && GAME_DATA.MARKET_EVENT_TREE[marketBranch]);
    const bounds = GAME_DATA.MARKET_PRICE_BOUNDS ? GAME_DATA.MARKET_PRICE_BOUNDS[marketBranch] : null;

    if (!data || !data.stockParams) {
      // Fallback to static changes if params are missing for some reason
      const changes = (data && data.stockPriceChanges)
        ? data.stockPriceChanges
        : GAME_DATA.STOCK_PRICE_CHANGES[round - 1];
      const newPrices = { ...currentPrices };
      const stockPriceChanges = {};
      for (const [code, changePct] of Object.entries(changes)) {
        let nextPrice = Math.round(newPrices[code] * (1 + changePct));
        if (bounds && bounds[code]) {
          const { min, max } = bounds[code];
          nextPrice = Math.max(min, Math.min(max, nextPrice));
        }
        newPrices[code] = nextPrice;
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

      let nextPrice = Math.round(price * (1 + r_i));
      if (bounds && bounds[code]) {
        const { min, max } = bounds[code];
        nextPrice = Math.max(min, Math.min(max, nextPrice));
      }
      newPrices[code] = nextPrice;
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
      total += pos.quantity * (prices[code] || 0) * (1 + GAME_DATA.STOCK_TRADING_FEE);
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
  function calcFinalScore(finalStats, benchmarkNetWorth = 500_000_000) {
    const netWorth = finalStats.cash + finalStats.investment;

    // Net worth score (0-100 linear relative to benchmark × 2)
    const rawNW = Math.min(100, Math.max(0, (netWorth / (benchmarkNetWorth * 2)) * 100));
    const netWorthScore = Math.round(rawNW);

    // Well-being score
    const wellbeingScore = Math.round((finalStats.physicalHealth + finalStats.mentalHealth) / 2);

    // Total score
    const totalScore = Math.round((netWorthScore + wellbeingScore) / 2);

    // Labels
    const netWorthLabel  = netWorthScore  >= 80 ? 'Strong' : netWorthScore  >= 50 ? 'Moderate' : 'Weak';
    const wellbeingLabel = wellbeingScore >= 80 ? 'Strong' : wellbeingScore >= 50 ? 'Moderate' : 'Weak';

    // Archetype (Label 1)
    const archetype = GAME_DATA.ARCHETYPES.find(a => a.condition(netWorthScore, wellbeingScore));

    // Label 2: direction gap
    const gap = netWorthScore - wellbeingScore;
    let label2;
    if (gap >  10) label2 = 'Finance-led';
    else if (gap < -10) label2 = 'Well-being-led';
    else label2 = 'Aligned';

    // Label 3: health balance
    const healthGap = Math.abs(finalStats.physicalHealth - finalStats.mentalHealth);
    let label3;
    if      (healthGap < 15) label3 = 'Health Aligned';
    else if (healthGap < 25) label3 = 'Slightly Health Imbalanced';
    else {
      const dir = finalStats.physicalHealth > finalStats.mentalHealth
        ? 'Physical-heavy' : 'Mental-heavy';
      label3 = `Health Imbalanced (${dir})`;
    }

    return {
      netWorth,
      netWorthScore,
      wellbeingScore,
      totalScore,
      netWorthLabel,
      wellbeingLabel,
      archetype,
      label2,
      label3,
      badgeFile: archetype?.badgeFile || '',
      aboveBenchmark: totalScore > GAME_DATA.SCORE_BENCHMARK,
    };
  }

  /* ──────────────────────────────────────────────────────────
     PUBLIC API
     ────────────────────────────────────────────────────────── */
  return {
    calcIncome,
    calcExpenses,
    calcMentalHealthDelta,
    calcPhysicalHealthDelta,
    applyRound,
    updateStockPrices,
    calcPortfolioValue,
    calcStockGainLoss,
    calcFinalScore,
  };

})();
