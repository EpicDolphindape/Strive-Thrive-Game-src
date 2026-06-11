/**
 * STRIVE & THRIVE — Game Data Constants (data.js)
 * ============================================================
 * All fixed game constants: salaries, side jobs, stocks,
 * expenses, savings rates, income quintiles, event tables,
 * and scoring thresholds.
 *
 * Usage: include before game.js and health.js.
 * All constants live on the global `GAME_DATA` object.
 * ============================================================
 */

const GAME_DATA = (() => {

  /* ──────────────────────────────────────────────────────────
     ROUND META
     ────────────────────────────────────────────────────────── */

  /** Fixed info per round (1-indexed; use ROUNDS[round - 1]) */
  const ROUNDS = [
    { round: 1, age: 22, job: 'Analyst Executive',       monthlySalary: 15_000_000 },
    { round: 2, age: 23, job: 'Analyst Executive',       monthlySalary: 20_000_000 },
    { round: 3, age: 24, job: 'Analyst Executive',       monthlySalary: 25_000_000 },
    { round: 4, age: 25, job: 'Senior Financial Analyst', monthlySalary: 35_000_000 },
    { round: 5, age: 26, job: 'Senior Financial Analyst', monthlySalary: 45_000_000 },
  ];

  /** OT wage formula: monthlySalary / 208 * 1.5 */
  function getOTWage(monthlySalary) {
    return (monthlySalary / 208) * 1.5;
  }

  /** Valid OT / side-job hour choices */
  const HOUR_OPTIONS = [0, 10, 20, 30, 40];

  /* ──────────────────────────────────────────────────────────
     SIDE JOBS
     ────────────────────────────────────────────────────────── */

  const SIDE_JOBS = {
    none:       { id: 'none',       label: 'No side job',              wage: 0 },
    bookkeeper: { id: 'bookkeeper', label: 'Part-time Bookkeeper',     wage: 60_248 },
    adviser:    { id: 'adviser',    label: 'Personal Finance Adviser', wage: 116_476 },
    tutor:      { id: 'tutor',      label: 'Tutor',                    wage: 137_924 },
    blogger:    { id: 'blogger',    label: 'Guest Blogger',            wage: 157_785 },
  };

  const SIDE_JOB_MH_MULTIPLIERS = {
    none:       0.0,
    adviser:    1.00,
    tutor:      1.03,
    bookkeeper: 1.04,
    blogger:    1.14
  };

  const SIDE_JOB_PH_MULTIPLIERS = {
    none:       0.0,
    adviser:    1.00,
    bookkeeper: 1.03,
    blogger:    1.10,
    tutor:      1.11
  };

  /* ──────────────────────────────────────────────────────────
     EXPENSE CATEGORIES
     ────────────────────────────────────────────────────────── */

  /**
   * Base monthly expense values (VND).
   * In round > 1, "base" shown to player is previous round's actual.
   */
  const BASE_EXPENSES = {
    healthcare:    0.0533,    // ratio of salary
    entertainment: 0.3,
    housing:       0.25,
    food:          0.17,
    utility:       0.0467,
    transport:     0.0333,
  };

  const MIN_EXPENSES = {
    housing:       1_500_000,
    food:          1_500_000,
    utility:         400_000,
    transport:       150_000,
    healthcare:      200_000,
    entertainment:         0,
  };

  const BASE_RATIOS = {
    healthcare:    0.0533,
    entertainment: 0.3,
    housing:       0.25,
    food:          0.17,
    utility:       0.0467,
    transport:     0.0333,
  };

  /** Mental health expense formula coefficients */
  const MH_EXPENSE_COEFF = {
    healthcare:   -0.33,
    entertainment: -0.23,
    housing:       1.00,
    food:          0.64,
    utility:       0.27,
    transport:     0.15,
  };

  /* ──────────────────────────────────────────────────────────
     INSURANCE
     ────────────────────────────────────────────────────────── */

  /** Annual insurance fee by round (rounds 1-3 vs 4-5) */
  function getInsuranceFee(round) {
    return round <= 3 ? 24_056_000 : 27_840_000;
  }

  /* ──────────────────────────────────────────────────────────
     SAVINGS / BANK
     ────────────────────────────────────────────────────────── */

  const SAVINGS_TIERS = [
    { label: 'Normal',   minBalance: 1_000_000,       maxBalance: 999_999_999,    rate: 0.065  },
    { label: 'Inspire',  minBalance: 1_000_000_000,   maxBalance: 2_999_999_999,  rate: 0.0675 },
    { label: 'Priority', minBalance: 3_000_000_000,   maxBalance: 4_999_999_999,  rate: 0.068  },
    { label: 'Private',  minBalance: 5_000_000_000,   maxBalance: Infinity,       rate: 0.069  },
  ];

const SAVINGS_RATE_ADJUSTMENTS = [0, 0.005, -0.015, 0.015, -0.005];

  /** Get cumulative savings rate adjustment up to a round */
  function getSavingsRateAdjustment(round) {
    let total = 0;
    for (let r = 1; r <= round; r++) {
      total += SAVINGS_RATE_ADJUSTMENTS[Math.min(r - 1, 4)];
    }
    return total;
  }

  /** Get annual interest rate for a savings balance */
  function getSavingsRate(balance, round = 1, savingsRateAdjustment = 0) {
    const adjustment = (arguments.length >= 3) ? savingsRateAdjustment : getSavingsRateAdjustment(round);
    for (const tier of SAVINGS_TIERS) {
      if (balance >= tier.minBalance && balance <= tier.maxBalance) {
        return Math.max(0, tier.rate + adjustment);
      }
    }
    return 0; // below minimum
  }

  /** Get savings tier label */
  function getSavingsTierLabel(balance) {
    for (const tier of SAVINGS_TIERS) {
      if (balance >= tier.minBalance && balance <= tier.maxBalance) {
        return tier.label;
      }
    }
    return 'No tier';
  }

  /* ──────────────────────────────────────────────────────────
     STOCKS
     ────────────────────────────────────────────────────────── */

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

  /* ──────────────────────────────────────────────────────────
     INCOME QUINTILES (per round)
     ────────────────────────────────────────────────────────── */

  /**
   * Income quintile breakpoints per round.
   * Values are MONTHLY total income in VND.
   * Indexed as [roundIndex][0..3] = [Q1 max, Q2 max, Q3 max, Q4 max]
   * (Q5 = anything above Q4 max)
   */
  const QUINTILE_BREAKPOINTS = (() => {
    const breakpoints = [];
    const HOUR_OPTIONS = [0, 10, 20, 30, 40];
    const activeSideJobs = ['bookkeeper', 'adviser', 'tutor', 'blogger'];
    const sideJobHoursOptions = [10, 20, 30, 40];

    for (let r = 1; r <= 5; r++) {
      const roundMeta = ROUNDS[r - 1];
      const monthlySalary = roundMeta.monthlySalary;
      const otWage = (monthlySalary / 208) * 1.5;

      const incomes = [];

      // 1. Side Job: none (hours is 0)
      for (const ot of HOUR_OPTIONS) {
        incomes.push(monthlySalary + otWage * ot);
      }

      // 2. Active Side Jobs
      for (const jobKey of activeSideJobs) {
        const jobData = SIDE_JOBS[jobKey];
        const jobWage = jobData.wage;
        for (const ot of HOUR_OPTIONS) {
          for (const sh of sideJobHoursOptions) {
            incomes.push(monthlySalary + otWage * ot + jobWage * sh);
          }
        }
      }

      // Sort lowest to highest
      incomes.sort((a, b) => a - b);

      // Calculate the 4 boundaries separating the 5 groups of 17
      const b1 = Math.round((incomes[16] + incomes[17]) / 2);
      const b2 = Math.round((incomes[33] + incomes[34]) / 2);
      const b3 = Math.round((incomes[50] + incomes[51]) / 2);
      const b4 = Math.round((incomes[67] + incomes[68]) / 2);

      breakpoints.push([b1, b2, b3, b4]);
    }
    return breakpoints;
  })();

  /**
   * Get income quintile (1–5) for a monthly income value.
   *
   * @param {number} monthlyIncome
   * @param {number} round  (1-indexed)
   * @returns {number} quintile 1–5
   */
  function getIncomeQuintile(monthlyIncome, round) {
    const breaks = QUINTILE_BREAKPOINTS[round - 1];
    if (monthlyIncome <= breaks[0]) return 1;
    if (monthlyIncome <= breaks[1]) return 2;
    if (monthlyIncome <= breaks[2]) return 3;
    if (monthlyIncome <= breaks[3]) return 4;
    return 5;
  }

  /* ──────────────────────────────────────────────────────────
     HEALTH MULTIPLIERS
     ────────────────────────────────────────────────────────── */

  /** Mental health income-based penalty multipliers by quintile */
  const MH_MULTIPLIERS = { 1: 1.74, 2: 1.53, 3: 1.29, 4: 1.14, 5: 1.00 };

  /** Physical health income-based penalty multipliers by quintile */
  const PH_MULTIPLIERS = { 1: 1.46, 2: 1.33, 3: 1.23, 4: 1.13, 5: 1.00 };

  /** Coefficients for extra-work penalty */
  const MH_WORK_COEFF = 0.048;
  const PH_WORK_COEFF = 0.034;

  /** Base health loss applied to all quintiles before multiplier */
  const BASE_HEALTH_LOSS = 5;

  /**
   * Healthcare spending → physical health recovery (annual).
   * Range breakpoints as [minRatio, maxRatio, recovery]
   */
  const HEALTHCARE_RECOVERY = [
    { minRatio: 0,    maxRatio: 0.01,  recovery: 0 },
    { minRatio: 0.01, maxRatio: 0.03,  recovery: 1 },
    { minRatio: 0.03, maxRatio: 0.06,  recovery: 2 },
    { minRatio: 0.06, maxRatio: 0.10,  recovery: 3 },
    { minRatio: 0.10, maxRatio: 0.15,  recovery: 4 },
    { minRatio: 0.15, maxRatio: Infinity, recovery: 5 },
  ];

  /** Get healthcare recovery score from ratio */
  function getHealthcareRecovery(healthcareExpense, totalIncome) {
    if (totalIncome <= 0) return 0;
    const ratio = healthcareExpense / totalIncome;
    for (const tier of HEALTHCARE_RECOVERY) {
      if (ratio >= tier.minRatio && ratio < tier.maxRatio) return tier.recovery;
    }
    return 5;
  }

  /* ──────────────────────────────────────────────────────────
     HEALTH WARNING THRESHOLDS
     ────────────────────────────────────────────────────────── */

  /**
   * Thresholds that trigger in-game health events.
   * Checked after each round calculation.
   */
  const HEALTH_THRESHOLDS = [
    { min: 50, max: 60, type: 'warning',   penalty: 0,   canWork: true,  label: 'Feeling tired' },
    { min: 40, max: 49, type: 'event',     penalty: -2,  canWork: true,  label: 'Moderate issue' },
    { min: 30, max: 39, type: 'event',     penalty: -5,  canWork: true,  label: 'Significant issue' },
    { min: 20, max: 29, type: 'event',     penalty: -7,  canWork: true,  label: 'Serious issue' },
    { min:  1, max: 19, type: 'critical',  penalty: -10, canWork: false, label: 'Critical — cannot work' },
    { min:  0, max:  0, type: 'lose',      penalty: 0,   canWork: false, label: 'Game Over' },
  ];

  const HEALTH_WARNING_EVENTS = {
    mental: [
      { min: 50, max: 60, text: "You’ve been feeling quite stressed lately, and you keep wishing you could leave work just a little earlier. Maybe it’s time to slow down and give yourself some space to heal.", penalty: 0, cashPenalty: 0 },
      { min: 40, max: 49, text: "You visit a mental health professional after weeks of stress and poor sleep. The doctor told that you’re showing signs of anxiety.", penalty: -2, cashPenalty: 1000000, isMedical: true },
      { min: 30, max: 39, text: "You feel exhausted before the day even starts. A check-up suggests early burnout from long-term work stress.", penalty: -5, cashPenalty: 1000000, isMedical: true },
      { min: 20, max: 29, text: "You often have trouble sleeping, lose your appetite, and feels frustrated all the time. The doctor said you're having severe signs of depression.", penalty: -7, cashPenalty: 10000000, isMedical: true },
      { min: 1, max: 19, text: "You're constantly anxious and stressed as hell. Your boss knows this and insists on asking you to quit your job to improve your health.", penalty: -7, cashPenalty: 0 }
    ],
    physical: [
      { min: 50, max: 60, text: "You’ve been getting occasional headaches lately, and you’ve been going to bed later than usual. Please remember to get some rest.", penalty: 0, cashPenalty: 0 },
      { min: 40, max: 49, text: "You've been having trouble sleeping and often feel exhausted by the end of the day. Your neck and shoulders have also started aching.", penalty: -2, cashPenalty: 1500000, isMedical: true },
      { min: 30, max: 39, text: "You faint at work because of acute stomach pain. The doctor says your lifestyle and diet are clearly not okay.", penalty: -5, cashPenalty: 5000000, isMedical: true },
      { min: 20, max: 29, text: "You end up in the hospital again. This time, the doctor says your body is exhausted and your immune system is struggling.", penalty: -7, cashPenalty: 10000000, isMedical: true },
      { min: 1, max: 19, text: "You are hospitalized because of a heart attack. The doctor is furious because you ignored every warning and kept neglecting your health.", penalty: -10, cashPenalty: 50000000, isMedical: true }
    ]
  };

  /** Get health threshold info for a value */
  function getHealthThreshold(value) {
    for (const t of HEALTH_THRESHOLDS) {
      if (value >= t.min && value <= t.max) return t;
    }
    return null;
  }

  /* ──────────────────────────────────────────────────────────
     SCORING
     ────────────────────────────────────────────────────────── */

  /** Total score benchmark for "above average" comparison */
  const SCORE_BENCHMARK = 47.36;

  /**
   * Net Worth Score bands (0–100).
   * Compared against a benchmark net worth calculated from
   * optimal play. For simplicity we score on a linear scale.
   */
  const NW_SCORE_BANDS = [
    { max: 49,  label: 'Weak',     score: (pct) => pct * 50 / 49 },
    { max: 79,  label: 'Moderate', score: (pct) => 50 + (pct - 50) * 30 / 29 },
    { max: 100, label: 'Strong',   score: (pct) => 80 + (pct - 80) * 20 / 20 },
  ];

  /**
   * Game-end archetypes based on financial and well-being scores.
   */
  const ARCHETYPES = [
    {
      id: 'balanced_achiever',
      label: 'Balanced Achiever',
      condition: (fin, wb) => fin >= 80 && wb >= 80,
      badgeFile: 'assets/outcomes/win/Balanced_Achiever.svg',
    },
    {
      id: 'burnout_rich',
      label: 'Burnout Rich',
      condition: (fin, wb) => fin >= 80 && wb < 50,
      badgeFile: 'assets/outcomes/win/Burnout_Rich.svg',
    },
    {
      id: 'no_pain_no_gain',
      label: 'No Gain — No Pain',
      condition: (fin, wb) => fin < 50 && wb >= 80,
      badgeFile: 'assets/outcomes/win/No_pain_-_No_gain.svg',
    },
    {
      id: 'broke_and_choked',
      label: 'Broke & Choked',
      condition: (fin, wb) => fin < 50 && wb < 50,
      badgeFile: 'assets/outcomes/win/Broke_and_Choked.svg',
    },
    {
      id: 'steady_builder',
      label: 'Steady Builder',
      condition: () => true, // fallback
      badgeFile: 'assets/outcomes/win/Steady_Builder.svg',
    },
  ];

  /**
   * Lose conditions and corresponding badge files.
   */
  const LOSE_CONDITIONS = {
    cash:     {
      label: 'Bankruptcy',
      badgeFile: 'assets/outcomes/lose/Cash.svg',
    },
    physical: {
      label: 'Physical Health Collapse',
      badgeFile: 'assets/outcomes/lose/Physical_health.svg',
    },
    mental:   {
      label: 'Mental Health Collapse',
      badgeFile: 'assets/outcomes/lose/Mental_health.svg',
    },
  };

  /* ──────────────────────────────────────────────────────────
     CHARACTER SVG PATHS
     ────────────────────────────────────────────────────────── */

  const CHARACTER_SVGS = [
    'assets/characters/Character_Round_1.svg',
    'assets/characters/Character_Round_2.svg',
    'assets/characters/Character_Round_3.svg',
    'assets/characters/Character_Round_4.svg',
    'assets/characters/Character_Round_5.svg',
  ];

  function getCharacterSVG(round) {
    return CHARACTER_SVGS[Math.min(round - 1, 4)];
  }

  /* ──────────────────────────────────────────────────────────
     INITIAL STATE TEMPLATE
     ────────────────────────────────────────────────────────── */

  /** Factory: returns a fresh player state object */
  function createInitialState(playerName) {
    return {
      playerName,
      currentRound: 1,
      usedRandomEventIds: [], 
      stats: {
        cash:           0,
        investment:     10_000_000,
        physicalHealth: 70,
        mentalHealth:   70,
      },
      // Per-round decisions + results (populated as game progresses)
      rounds: [],
      // Stock portfolio: { code: { quantity, avgCost } }
      portfolio: {
        'BNK-V': { quantity: 0, avgCost: 0 },
        'TEC-F': { quantity: 0, avgCost: 0 },
        'CSM-M': { quantity: 0, avgCost: 0 },
        'REA-V': { quantity: 0, avgCost: 0 },
        'ENE-G': { quantity: 0, avgCost: 0 },
      },
      savingsBalance: 10_000_000,
      savingsOpening: 10_000_000,
      hasInsurance:   false,
      realizedPnL:    0,
      // Current stock prices (updated each round)
      currentPrices: {
        'BNK-V': 60_000,
        'TEC-F': 70_000,
        'CSM-M': 80_000,
        'REA-V': 150_000,
        'ENE-G': 80_000,
      },
      marketBranch: '1.1',
      savingsRateAdjustment: 0.0,
      inflationRate: 0.0,
      loseCondition: null, // 'cash' | 'physical' | 'mental' | null
    };
  }

  const ROUND_BASE_COSTS = {
    1: {
      healthcare:    799500,
      entertainment: 4500000,
      housing:       3750000,
      food:          2550000,
      utility:       700500,
      transport:     499500
    },
    2: {
      healthcare:    1070000,
      entertainment: 6000000,
      housing:       5000000,
      food:          3400000,
      utility:       930000,
      transport:     666000
    },
    3: {
      healthcare:    1330000,
      entertainment: 7500000,
      housing:       6250000,
      food:          4250000,
      utility:       1170000,
      transport:     832500
    },
    4: {
      healthcare:    1870000,
      entertainment: 10500000,
      housing:       8750000,
      food:          5950000,
      utility:       1630000,
      transport:     1162500
    },
    5: {
      healthcare:    2400000,
      entertainment: 13500000,
      housing:       11250000,
      food:          7650000,
      utility:       2100000,
      transport:     1498500
    }
  };

  function getBaseExpense(category, round) {
    return ROUND_BASE_COSTS[round]?.[category] || 0;
  }

  /** Expense template for a single round */
  function createRoundDecision(round) {
    const expenses = {};
    const categories = ['housing', 'utility', 'food', 'transport', 'healthcare', 'entertainment'];
    categories.forEach(cat => {
      expenses[cat] = getBaseExpense(cat, round);
    });
    return {
      round,
      // Income choices
      otHours: 0,
      sideJob: 'none',
      sideJobHours: 0,
      // Expense choices (monthly, VND)
      expenses,
      // Investment choices handled via portfolio + savingsBalance
    };
  }

  /* ──────────────────────────────────────────────────────────
     4-TYPE EVENT SYSTEM POOLS
     ────────────────────────────────────────────────────────── */

  const RANDOM_EVENTS = [
    {
      id: 'rand_lottery',
      text: "YOU WON THE LOTTERY! The prize reaches 500,000,000 VND.",
      tag: 'positive',
      rarity: 'ultra_rare',
      weight: 1,
      impact: { cash: 500000000, mentalHealth: 15 }
    },
    {
      id: 'rand_retreat',
      text: "Your manager organized a one-week summer retreat for the whole department. The retreat resort also has the greatest massage service!",
      tag: 'positive',
      rarity: 'uncommon',
      weight: 6,
      impact: { mentalHealth: 8, physicalHealth: 4 }
    },
    {
      id: 'rand_massager',
      text: "During a company health workshop, you joined the lucky draw with no hope. To your surprise, you won a high-quality neck and shoulder massager, perfectly saving your aching back.",
      tag: 'positive',
      rarity: 'rare',
      weight: 8,
      impact: { physicalHealth: 5, mentalHealth: 3 }
    },
    {
      id: 'rand_weddings_fomo',
      text: "You are invited to two weddings of your high school friends. You are genuinely happy for them, but you also feel a little FOMO as people around you start to form their family.",
      tag: 'positive',
      rarity: 'common',
      weight: 10,
      impact: { mentalHealth: 1 }
    },
    {
      id: 'rand_volunteer',
      text: "You sign up for a local volunteer activity. It is tiring, but the experience feels meaningful and leaves you surprisingly happy.",
      tag: 'positive',
      rarity: 'common',
      weight: 10,
      impact: { mentalHealth: 5, physicalHealth: 1 }
    },
    {
      id: 'rand_entrepreneur',
      text: "During a casual coffee outing, you unexpectedly meet a famous entrepreneur you have admired for a long time. The two of you have a pleasant conversation, and you leave feeling incredibly motivated.",
      tag: 'positive',
      rarity: 'rare',
      weight: 5,
      impact: { mentalHealth: 8 }
    },
    {
      id: 'rand_dog',
      text: "Your neighbor recently adopted an adorable Golden Retriever. You quickly became fond of the dog, and it seems to like you just as much. Since then, you've been spending time playing with it and occasionally taking it out for walks.",
      tag: 'positive',
      rarity: 'common',
      weight: 9,
      impact: { mentalHealth: 6, physicalHealth: 2 }
    },
    {
      id: 'rand_thailand',
      text: "Thanks to your office's outstanding performance and its success in bringing in new clients, management has decided to reward the entire team with an 8-day, 7-night trip to Thailand.",
      tag: 'positive',
      rarity: 'very_rare',
      weight: 4,
      impact: { mentalHealth: 12, physicalHealth: 4 }
    },
    {
      id: 'rand_lucky_money',
      text: "You accidentally found an old lucky money envelope while tidying up your wardrobe. To your surprise, the amount of money inside the envelope is quite high.",
      tag: 'positive',
      rarity: 'uncommon',
      weight: 7,
      impact: { cash: 5000000, mentalHealth: 2 }
    },
    {
      id: 'rand_dyson',
      text: "You write a heartfelt review praising the durability and practicality of your 5-year-old Dyson vacuum cleaner. To your surprise, the post goes viral that even Dyson notices it and decides to send you their latest vacuum model as a gift.",
      tag: 'positive',
      rarity: 'very_rare',
      weight: 3,
      impact: { cash: 15000000, mentalHealth: 8 }
    },
    {
      id: 'rand_decline_wedding',
      text: "A close friend invites you to be a bridesmaid/groomsman and attend a wedding. However, you are too busy with your work so you decline your friend's invitation.",
      tag: 'negative',
      rarity: 'common',
      weight: 10,
      impact: { mentalHealth: -2 }
    },
    {
      id: 'rand_police',
      text: "In a moment of distraction while driving, you forgot to use your turn signal and got pulled over by the traffic police. That's how your food budget for the weekend gone away.",
      tag: 'negative',
      rarity: 'common',
      weight: 10,
      impact: { cash: -1000000, mentalHealth: -2 }
    },
    {
      id: 'rand_grandfather_hospital',
      text: "You heard that your grandfather was hospitalized with atherosclerosis. You sent some money to help your parents with the medical bills and went to the hospital to visit him.",
      tag: 'negative',
      rarity: 'uncommon',
      weight: 8,
      impact: { cash: -5000000, mentalHealth: -3 }
    },
    {
      id: 'rand_grandfather_death',
      text: "After a year of medical treatment, your grandfather passes away. His departure leaves you deeply saddened.",
      tag: 'negative',
      rarity: 'rare',
      weight: 5,
      impact: { mentalHealth: -7 }
    },
    {
      id: 'rand_netflix',
      text: "You accidentally signed up for a 7-day free trial of Netflix account and completely forgot about it. You only realized after 2 months but your bank account already deducted money.",
      tag: 'negative',
      rarity: 'common',
      weight: 10,
      impact: { cash: -400000, mentalHealth: -1 }
    },
    {
      id: 'rand_cheated',
      text: "You got cheated on because the person in a situationship with you secretly texted 2 more people. You ended your relationship but still felt heartbroken.",
      tag: 'negative',
      rarity: 'rare',
      weight: 6,
      impact: { mentalHealth: -6 }
    },
    {
      id: 'rand_report_lost',
      text: "Your report was lost because you forgot to save it. You had to stay up all night to redo it. Don't make this mistake again!",
      tag: 'negative',
      rarity: 'uncommon',
      weight: 8,
      impact: { mentalHealth: -2, physicalHealth: -2 }
    },
    {
      id: 'rand_scam',
      text: "You get tricked by an online scam and lose a lot of money. The financial loss really hurts, but what makes you angrier is how stupid you feel for believing them. You are left feeling totally embarrassed and deeply frustrated.",
      tag: 'negative',
      rarity: 'ultra_rare',
      weight: 2,
      impact: { cash: -80000000, mentalHealth: -10 }
    },
    {
      id: 'rand_storm',
      text: "A powerful storm hits Hanoi, causing widespread flooding across the city. Unfortunately, your vehicle breaks down in the middle of the flooded streets. You have no choice but to walk home and pay for costly repairs afterward.",
      tag: 'negative',
      rarity: 'rare',
      weight: 5,
      impact: { cash: -5000000, mentalHealth: -4 }
    },
    {
      id: 'rand_mother_accident',
      text: "While on her way to the market, your mother is involved in a traffic accident. Worried, you rush home to check on her. Fortunately, her injuries are not serious, but you decide to take three days off work to stay by her side and help with her recovery.",
      tag: 'negative',
      rarity: 'very_rare',
      weight: 4,
      impact: { cash: -2000000, mentalHealth: -2, physicalHealth: -2 }
    },
    {
      id: 'rand_flat_tire',
      text: "While commuting home after a long day, your motorbike suddenly gets a flat tire. You have to push the bike to the nearest repair shop and arriving home much later than expected.",
      tag: 'negative',
      rarity: 'common',
      weight: 9,
      impact: { cash: -200000, mentalHealth: -2 }
    },
    {
      id: 'rand_ac_broken',
      text: "Hanoi's temperature in this summer can surge up to more than 40 degrees. However, your AC suddenly stops working. The repair technician cannot come until next week, leaving you to suffer through several ultra-hot days.",
      tag: 'negative',
      rarity: 'uncommon',
      weight: 7,
      impact: { cash: -2500000, mentalHealth: -2, physicalHealth: -1 }
    },
    {
      id: 'rand_driving_fail',
      text: "After weeks of preparation, you take the driving license test with confidence. Unfortunately, a small mistake during the practical exam makes you fail! Better luck next time.",
      tag: 'negative',
      rarity: 'uncommon',
      weight: 6,
      impact: { cash: -1000000, mentalHealth: -3 }
    },
    {
      id: 'rand_luggage_lost',
      text: "While traveling, you discover that your checked luggage has gone missing. Although the airline eventually compensates part of the loss, replacing your belongings is still frustrating.",
      tag: 'negative',
      rarity: 'very_rare',
      weight: 5,
      impact: { cash: -5000000, mentalHealth: -3 }
    }
  ];

  const JOB_REWARD_EVENTS = {
    1: {
      minor: {
        id: 'job_y1_minor',
        text: "You occasionally stay after work to help your colleagues. Over time, you build stronger relationships with your teammates and gain valuable insights from more experienced coworkers.",
        tag: 'positive',
        impact: { mentalHealth: 3 }
      },
      moderate: {
        id: 'job_y1_moderate',
        text: "You frequently stay late to assist with unexpected tasks. One of the senior staff members is impressed by your attitude and shares a collection of work guides and notes that he has compiled over the years.",
        tag: 'positive',
        impact: { mentalHealth: 4 }
      },
      major: {
        id: 'job_y1_major',
        text: "During a small project, you voluntarily cleared a backlog of paperwork and administrative tasks, helping the team finish ahead of schedule. Your team leader rewards you for your timely support.",
        tag: 'positive',
        impact: { cash: 5000000, mentalHealth: 4 }
      }
    },
    2: {
      minor: {
        id: 'job_y2_minor',
        text: "Because of your willingness to help outside regular working hours, you are selected to join an internal professional training program reserved for high-performing employees.",
        tag: 'positive',
        impact: { mentalHealth: 4 }
      },
      moderate: {
        id: 'job_y2_moderate',
        text: "An internal project falls behind schedule. You volunteer to provide additional support and help the team deliver on time. Your department manager rewards you for your contribution.",
        tag: 'positive',
        impact: { cash: 5000000, mentalHealth: 5 }
      },
      major: {
        id: 'job_y2_major',
        text: "You are chosen to join a short business trip with senior managers to work on a potential acquisition deal involving a technology startup in Singapore.",
        tag: 'positive',
        impact: { cash: 10000000, mentalHealth: 5 }
      },
      exceptional: {
        id: 'job_y2_exceptional',
        text: "Your annual performance review places you among the top 5% most dedicated employees in the company. Senior management grants you a special bonus in recognition of your efforts.",
        tag: 'positive',
        impact: { cash: 15000000, mentalHealth: 8 }
      }
    },
    3: {
      minor: {
        id: 'job_y3_minor',
        text: "A new manager is assigned to your office. You are asked to help him settle into his new role, and your intelligence and work ethic quickly earn his trust and appreciation.",
        tag: 'positive',
        impact: { mentalHealth: 5 }
      },
      moderate: {
        id: 'job_y3_moderate',
        text: "Thanks to your hard work, a project negotiation is completed one week ahead of schedule. The client is highly satisfied, and the team's performance bonus increases significantly.",
        tag: 'positive',
        impact: { cash: 10000000, mentalHealth: 6 }
      },
      major: {
        id: 'job_y3_major',
        text: "You are recognized as one of the five most outstanding employees during the first six months of the year. As a reward, you receive a 3-day, 2-night vacation package at a Vinpearl Resort in Nha Trang.",
        tag: 'positive',
        impact: { cash: 15000000, mentalHealth: 8 }
      },
      exceptional: {
        id: 'job_y3_exceptional',
        text: "A high-value project exceeds expectations. The board decides to distribute an additional bonus to the core team, and you receive one of the largest shares.",
        tag: 'positive',
        impact: { cash: 30000000, mentalHealth: 8 }
      }
    },
    4: {
      minor: {
        id: 'job_y4_minor',
        text: "You are invited to join a task force focused on improving internal workflows. Your recommendations significantly reduce processing time across the department.",
        tag: 'positive',
        impact: { mentalHealth: 5 }
      },
      moderate: {
        id: 'job_y4_moderate',
        text: "A long-term client specifically requests that you continue working on future projects because of the excellent quality of your previous work.",
        tag: 'positive',
        impact: { cash: 10000000, mentalHealth: 7 }
      },
      major: {
        id: 'job_y4_major',
        text: "You represent your department at an international professional conference alongside senior leadership. The trip helps you expand your professional network considerably.",
        tag: 'positive',
        impact: { cash: 15000000, mentalHealth: 8 }
      },
      exceptional: {
        id: 'job_y4_exceptional',
        text: "You play a key role in a fundraising deal with a private LP from the United Kingdom. The transaction successfully raises USD 1 million, and your team receives an immediate performance bonus.",
        tag: 'positive',
        impact: { cash: 40000000, mentalHealth: 10 }
      }
    },
    5: {
      minor: {
        id: 'job_y5_minor',
        text: "Many junior employees seek your career advice. The company formally recognizes your contributions to mentoring and developing younger staff members.",
        tag: 'positive',
        impact: { mentalHealth: 5 }
      },
      moderate: {
        id: 'job_y5_moderate',
        text: "You become a professional mentor for the company's Fresh Graduate Recruitment Program. You share your experiences with candidates and earn admiration from many young applicants.",
        tag: 'positive',
        impact: { cash: 15000000 }
      },
      major: {
        id: 'job_y5_major',
        text: "Thanks to the reputation you have built over the years, you are invited to join an important fundraising project involving a major European pension fund. You spend one month in France working directly with the client.",
        tag: 'positive',
        impact: { cash: 25000000, mentalHealth: 8 }
      },
      exceptional: {
        id: 'job_y5_exceptional',
        text: "At the company's year-end ceremony, you are awarded the title of Employee of the Year. The achievement comes with a substantial bonus and widespread recognition from colleagues, clients, and senior management.",
        tag: 'positive',
        impact: { cash: 60000000, mentalHealth: 12 }
      }
    }
  };

  const EXPENSE_PENALTY_EVENTS = {
    housing: [
      {
        id: 'exp_housing_1',
        prob: 0.50,
        text: "Living in overcrowded accommodation reduces comfort and sleep quality.",
        tag: 'negative',
        impact: { mentalHealth: -3, physicalHealth: -2 }
      },
      {
        id: 'exp_housing_2',
        prob: 0.30,
        text: "Frequent conflicts with roommates create stress and reduce well-being.",
        tag: 'negative',
        impact: { mentalHealth: -4 }
      },
      {
        id: 'exp_housing_3',
        prob: 0.20,
        text: "Housing instability requires an unexpected move.",
        tag: 'negative',
        impact: { mentalHealth: -2, cash: -500000 }
      }
    ],
    food: [
      {
        id: 'exp_food_1',
        prob: 0.50,
        text: "A prolonged period of low-cost meals reduces energy and physical well-being.",
        tag: 'negative',
        impact: { physicalHealth: -4 }
      },
      {
        id: 'exp_food_2',
        prob: 0.30,
        text: "Inadequate nutrition affects concentration and work performance.",
        tag: 'negative',
        impact: { mentalHealth: -2 }
      },
      {
        id: 'exp_food_3',
        prob: 0.20,
        text: "A nutrition-related health issue occurs.",
        tag: 'negative',
        impact: { physicalHealth: -3, cash: -300000 },
        isMedical: true
      }
    ],
    utility: [
      {
        id: 'exp_utility_1',
        prob: 0.40,
        text: "Limited spending results in unstable internet access.",
        tag: 'negative',
        impact: { mentalHealth: -2 }
      },
      {
        id: 'exp_utility_2',
        prob: 0.40,
        text: "Insufficient utility usage reduces living comfort.",
        tag: 'negative',
        impact: { mentalHealth: -2, physicalHealth: -1 }
      },
      {
        id: 'exp_utility_3',
        prob: 0.20,
        text: "Deferred maintenance or unpaid service fees generate additional costs.",
        tag: 'negative',
        impact: { cash: -300000 }
      }
    ],
    transport: [
      {
        id: 'exp_transport_1',
        prob: 0.50,
        text: "Reliance on low-cost transportation significantly increases travel time.",
        tag: 'negative',
        impact: { mentalHealth: -2 }
      },
      {
        id: 'exp_transport_2',
        prob: 0.30,
        text: "Transportation constraints cause you to miss an important opportunity.",
        tag: 'negative',
        impact: { cash: -500000 }
      },
      {
        id: 'exp_transport_3',
        prob: 0.20,
        text: "Long and inconvenient travel routines reduce well-being.",
        tag: 'negative',
        impact: { mentalHealth: -1, physicalHealth: -2 }
      }
    ],
    healthcare: [
      {
        id: 'exp_healthcare_1',
        prob: 0.50,
        text: "A health issue is not addressed early enough.",
        tag: 'negative',
        impact: { physicalHealth: -5 }
      },
      {
        id: 'exp_healthcare_2',
        prob: 0.30,
        text: "A minor health problem becomes more serious.",
        tag: 'negative',
        impact: { physicalHealth: -4, mentalHealth: -2 }
      },
      {
        id: 'exp_healthcare_3',
        prob: 0.20,
        text: "An unexpected medical bill occurs.",
        tag: 'negative',
        impact: { cash: -1000000, physicalHealth: -2 },
        isMedical: true
      }
    ]
  };

  // Flat helper array of all events for back-compatibility and quick checks
  const LIFE_EVENTS = [
    ...RANDOM_EVENTS,
    ...Object.values(JOB_REWARD_EVENTS).flatMap(yearObj => Object.values(yearObj)),
    ...Object.values(EXPENSE_PENALTY_EVENTS).flat()
  ];

  /* ──────────────────────────────────────────────────────────
     MARKET EVENTS
     ────────────────────────────────────────────────────────── */
  const MARKET_EVENT_TREE = {
    '1.1': {
      id: '1.1',
      year: 1,
      title: "Stable start",
      scenarioOverview: "The world market is starting the year in a fairly calm mood. In Vietnam, the economy is also holding steady as attention increasingly shifts toward digitalization across industries. The rapid rise of e-commerce and the wider adoption of online banking are creating significant new opportunities for both businesses and consumers, driving innovation, improving efficiency, and expanding access to markets.",
      events: [
        { title: "Digital Banking Campaign", text: "Major banks launch fee-free transfers and cashback campaigns across popular payment apps. App sign-ups rise quickly, while more small shops begin accepting QR payments.", impact: "Bank Stock +4% · Tech Stock +3%" },
        { title: "Shopping Festival", text: "The emergence of the double-day sale trend has ignited a massive consumer wave across various sectors, driven by fashion, beauty, electronics, and home appliances.", impact: "Consumer Stock +2%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.04, 'TEC-F': 0.03, 'CSM-M': 0.02, 'REA-V': 0.00, 'ENE-G': 0.00 },
      savingsRateAdjustment: 0.0,
      inflationRate: 0.0,
      children: ['2.1', '2.2'],
      sectorInfo: "In a relatively calm global backdrop, Vietnam's macroeconomic environment is holding steady, characterized by an accelerating shift toward structural digitalization across industries. Technology has emerged as a high-conviction growth engine, fundamentally supported by a rapid expansion in enterprise digital adoption and e-commerce infrastructure. The banking sector is experiencing a profound operational evolution; although broader market fluctuations require a discerning look at asset valuations, aggressive zero-fee transfer campaigns and payment app incentives are driving a historic surge in retail customer acquisition. This rapid expansion of digital banking channels and widespread QR-code merchant adoption is drastically lowering transaction friction and improving systemic liquidity velocity. Concurrently, the consumer discretionary sector is benefiting from an unprecedented volume catalyst brought on by the institutionalization of \"double-day\" online shopping festivals, which are unlocking robust demand in high-turnover segments like electronics, beauty, and apparel. Real estate continues to chart a steady path, anchored by long-term urbanization trends and steady accommodation demand from the younger demographic, while energy names function as reliable defensive anchors tied closely to baseline domestic industrial consumption. Navigating this foundational environment requires looking beyond short-term index volatility and focusing heavily on digital execution metrics. The primary strategic objective for investors in this phase is identifying the specific operators that can successfully monetize this initial wave of digital migration to secure scalable, long-term market share.",
      stockParams: {
        rMarket: -0.1094,
        stocks: {
          'BNK-V': { rSector: -0.1817, gamma: -0.34, mScenario: 0.85, sigmaBase: 0.2630 },
          'TEC-F': { rSector: 0.1644, gamma: 0.091, mScenario: 0.90, sigmaBase: 0.2580 },
          'CSM-M': { rSector: -0.3525, gamma: -0.004, mScenario: 1.00, sigmaBase: 0.3185 },
          'REA-V': { rSector: 0.2647, gamma: -0.292, mScenario: 1.15, sigmaBase: 0.6427 },
          'ENE-G': { rSector: -0.3474, gamma: -0.585, mScenario: 1.10, sigmaBase: 0.3781 }
        }
      }
    },
    '2.1': {
      id: '2.1',
      year: 2,
      title: "Middle East tension",
      scenarioOverview: "Tension in the Middle East suddenly increases, making global investors more nervous. Oil and shipping costs rise, so many countries face higher prices and more uncertain trade. Vietnam is affected mainly through imported fuel, transport costs, and slightly higher inflation. The economy is not in crisis, but daily expenses are significantly higher, especially food, electricity, and transportation.",
      events: [
        { title: "Escalating Tensions", text: "Rising oil prices cause hardship for many households and businesses. Meanwhile, many speculators take advantage of this opportunity to invest heavily in the energy sector.", impact: "Energy Stock +9%" },
        { title: "Consumer Caution", text: "Offline shopping was significantly affected, but online shopping maintained its momentum despite the global news, with regular shopping and sales-hunting going on as usual.", impact: "Consumer Stock -2% · Inflation +1.5% · Savings return +0.5%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.00, 'TEC-F': 0.00, 'CSM-M': -0.02, 'REA-V': 0.00, 'ENE-G': 0.09 },
      savingsRateAdjustment: 0.005,
      inflationRate: 0.015,
      children: ['3.1', '3.2'],
      sectorInfo: "As geopolitical tensions escalate in the Middle East, the macroeconomic landscape is increasingly characterized by imported inflation and renewed supply chain friction. Energy equities find themselves closely tied to the volatility of global commodity benchmarks, with market participants actively evaluating how rising oil and shipping costs will filter into forward operational outlooks. Within the consumer discretionary space, shifting household budgets are driving a pronounced bifurcation in retail dynamics. As higher food, electricity, and fuel costs weigh heavily on daily disposable income, traditional brick-and-mortar operations face an increasingly complex environment, prompting shoppers to become highly selective. However, digital retail channels continue to demonstrate resilience, supported by value-conscious consumers aggressively engaging in promotional events to stretch their purchasing power. The banking sector is navigating this period with a more cautious operational framework, balancing the traditional margin benefits of a higher-interest-rate environment against tightening systemic liquidity. Consequently, financial institutions appear to be prioritizing funding discipline and robust balance sheet management over aggressive credit expansion amid these global uncertainties. Real estate remains highly sensitive to these macroeconomic crosswinds, as elevated input costs from transportation bottlenecks and a restrictive financing climate complicate project timelines and buyer sentiment. Meanwhile, technology faces a shifting fundamental test; while secular digitalization trends remain intact, the sector is increasingly expected to validate its valuations through tangible cost efficiency rather than relying on broader market optimism. Ultimately, this phase is defined by a complex rotation toward defensive positioning, requiring investors to carefully evaluate how escalating external input costs will cascade through domestic margins and consumer habits.",
      stockParams: {
        rMarket: -0.1931,
        stocks: {
          'BNK-V': { rSector: -0.3097, gamma: 0.3980, mScenario: 0.90, sigmaBase: 0.1453 },
          'TEC-F': { rSector: 0.7622, gamma: -0.4400, mScenario: 0.85, sigmaBase: 0.1898 },
          'CSM-M': { rSector: 0.1079, gamma: -0.2370, mScenario: 1.05, sigmaBase: 0.2199 },
          'REA-V': { rSector: 0.0236, gamma: 0.1675, mScenario: 1.20, sigmaBase: 0.2365 },
          'ENE-G': { rSector: 0.3369, gamma: 0.23933, mScenario: 1.60, sigmaBase: 0.1331 }
        }
      }
    },
    '2.2': {
      id: '2.2',
      year: 2,
      title: "Virus-XIX Outbreak",
      scenarioOverview: "At the start of the year, a city in China reports a small cluster of patients with a strange new pneumonia. At first, the news feels far away, but within weeks, Virus-XIX spreads across Asia and then into major economies around the world. This is the first time people have witnessed these phenomena: flights are cut, factories slow down, and shopping streets become quiet. Vietnam - as the neighbor of China - is reached early. Malls, restaurants, tourism, and other activities cool down, forcing people to get familiar with online payments, delivery apps, and digital services.",
      events: [
        { title: "Pause & Online Boom", text: "Economic and social activities seemed to have been put on “pause.” The things that grew the most were the number of infected patients and the quarantine zones set up across many cities. Online services and social networks boomed.", impact: "Tech Stock +6% · Consumer Stock -5%" },
        { title: "Global Market Drop", text: "Just 3 months after Virus-XIX was detected, also immediately after it was declared a global pandemic, stock indices in major markets such as the U.S., the U.K., and Japan fell by 20%–30%. Vietnam’s VN-Index lost about 30% of its value.", impact: "All Stocks -30% · Savings return -0.5%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.30, 'TEC-F': -0.24, 'CSM-M': -0.35, 'REA-V': -0.30, 'ENE-G': -0.30 },
      savingsRateAdjustment: -0.005,
      inflationRate: 0.0,
      children: ['3.3', '3.4'],
      sectorInfo: "As uncertainty spreads faster than reliable information, the outbreak quickly flips the market from cautious optimism to survival mode, as Vietnam responds with early distancing measures and a national lockdown that disrupts normal business activity. The macro picture is still positive on paper, but only just: growth slows to a three-decade low, while inflation stays contained enough to give policymakers room to act. The central bank steps in aggressively, telling lenders to cut or delay loan payments for virus-hit firms and then lowering policy rates again to keep credit flowing. Banking therefore becomes less a story of expansion and more a story of damage control, where liquidity support matters as much as earnings quality. Consumer companies enter unfamiliar territory as shopping streets grow quieter and households become more cautious with spending, forcing many businesses to rethink how they reach customers. Yet within the disruption, a new pattern starts to emerge: consumers are spending less time outside and more time online. Technology becomes one of the few sectors with a clear structural tailwind, benefiting from rising demand for digital payments, delivery platforms, remote communication, and online services. Real estate finds itself caught between uncertainty and inactivity, as investment decisions are postponed and buyers wait for greater visibility on the future. Energy faces pressure from a world that is suddenly traveling less, producing less, and consuming less fuel than anyone expected. As the crisis deepens, investors are confronted with a difficult question: is this merely a temporary interruption to normal life, or the beginning of a fundamental shift in how people work, shop, travel, and interact?",
      stockParams: {
        rMarket: 0.1327,
        stocks: {
          'BNK-V': { rSector: 0.3706, gamma: -0.3913, mScenario: 1.15, sigmaBase: 0.1898 },
          'TEC-F': { rSector: 0.1953, gamma: 0.14968, mScenario: 0.85, sigmaBase: 0.1954 },
          'CSM-M': { rSector: 0.1714, gamma: 0.165508, mScenario: 1.00, sigmaBase: 0.3566 },
          'REA-V': { rSector: 0.0510, gamma: -1.12351, mScenario: 1.25, sigmaBase: 0.2290 },
          'ENE-G': { rSector: -0.0422, gamma: 0.1968242, mScenario: 1.30, sigmaBase: 0.2500 }
        }
      }
    },
    '3.1': {
      id: '3.1',
      year: 3,
      title: "Conflict gets worse",
      scenarioOverview: "In the Middle East, attacks continue daily as neither side shows any sign of backing down. This keeps disrupting the energy supply chain, driving up energy and shipping costs. Vietnam, like many other countries, is feeling the direct impact of this tension, especially through rising fuel prices, imported goods, and transport services.",
      events: [
        { title: "Defensive Investing", text: "Crowd psychology makes the investors reduce risky investments and move more money into cash or safer assets. Stock market is facing a cold period.", impact: "All Stocks -5% · Savings return +1.0%" },
        { title: "Gold Rush", text: "This period sees a crazy surge in domestic gold prices. Even though gold prices are skyrocketing, people are still rushing to buy it, making it extremely difficult for the government to stabilize the value of this asset.", impact: "Inflation +2.0%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.05, 'TEC-F': -0.05, 'CSM-M': -0.05, 'REA-V': -0.05, 'ENE-G': 0.10 },
      savingsRateAdjustment: 0.01,
      inflationRate: 0.02,
      children: ['4.1'],
      sectorInfo: "This next phase of the market story is no longer defined by uncertainty alone but by the accumulation of pressure points that are beginning to interact with one another. As the Middle Eastern conflict intensifies and global markets absorb the shock of a rapidly spreading pandemic, investors are being forced to reassess assumptions about growth, liquidity, and resilience. Energy and logistics costs remain elevated, while the sharp sell-off across major equity markets has weakened risk appetite and heightened sensitivity to earnings visibility. Financial institutions may continue to attract attention as systemically important pillars of the economy, yet the focus is likely to shift toward balance-sheet strength and asset quality rather than expansion alone. Consumer-oriented businesses face a more cautious spending environment as households prioritize essentials over discretionary purchases, while technology companies benefit from accelerating digital adoption but must prove that rising demand can translate into sustainable profitability. Real estate remains highly dependent on confidence and financing conditions, making sentiment particularly fragile during periods of market stress. Meanwhile, energy companies stand closest to the source of the disruption, creating opportunities tied to supply constraints and pricing power, though such opportunities may arrive with heightened volatility. In a market increasingly driven by resilience rather than optimism, investors may find that the distinction between defensive strength and cyclical vulnerability becomes more important than ever.",
      stockParams: {
        rMarket: -0.1127,
        stocks: {
          'BNK-V': { rSector: 0.2012, gamma: 0.3989, mScenario: 0.92, sigmaBase: 0.1302 },
          'TEC-F': { rSector: 0.7697, gamma: -0.05666, mScenario: 0.88, sigmaBase: 0.1946 },
          'CSM-M': { rSector: -0.0124, gamma: 0.1900, mScenario: 1.08, sigmaBase: 0.1949 },
          'REA-V': { rSector: -0.0828, gamma: 1.2900, mScenario: 1.30, sigmaBase: 0.2304 },
          'ENE-G': { rSector: -0.0221, gamma: 1.2100, mScenario: 2.80, sigmaBase: 0.1296 }
        }
      }
    },
    '3.2': {
      id: '3.2',
      year: 3,
      title: "Negotiation progress",
      scenarioOverview: "Global markets receive some good news as peace talks and diplomatic efforts begin to show progress. Investors are still careful, but the fear of a major crisis is lower than before. Vietnam does not see a huge boom, but the calmer global mood helps stabilize trade, prices, and investor confidence. Inflation pressure becomes easier to manage, and businesses feel a little more confident about planning ahead.",
      events: [
        { title: "Stable Budgets", text: "At the urgent call of many countries around the world, numerous negotiations have taken place and are beginning to show positive signs, bringing good news: food, fuel, and transportation prices become more stable.", impact: "Inflation -2%" },
        { title: "Economic Policy Package", text: "A new economic policy package receives strong public support as it focuses on stabilizing prices, improving public services, and keeping businesses active. The announcement gives the market a much-needed confidence boost.", impact: "Other Stocks +2% · Savings return -1.5%" },
        { title: "Brighter Business Outlook", text: "Hiring plans improve, delayed projects restart, and bonus expectations become positive.", impact: "Bank Stock +4% · Tech Stock +4%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.04, 'TEC-F': 0.04, 'CSM-M': 0.02, 'REA-V': 0.02, 'ENE-G': 0.02 },
      savingsRateAdjustment: -0.015,
      inflationRate: -0.02,
      children: ['4.1'],
      sectorInfo: "As peace talks gain traction, Vietnam’s market begins to shift from a cost-shock mindset toward cautious recovery, helped by a policy backdrop that keeps inflation in check while still leaning toward growth. Banking starts to regain its role as the market’s main transmission channel, since a calmer macro backdrop gives lenders room to support activity, although the market will still prefer balance-sheet discipline over aggressive growth. Technology also looks less fragile than before, but now the story is no longer about surviving turbulence; it is about whether companies can turn a more stable trade environment into real execution and earnings quality. Consumer names may see sentiment improve as inflation pressure softens, yet the recovery is likely to be gradual rather than broad, with the stronger players proving they can capture demand without stretching inventory or margins. Real estate remains sensitive, but the new policy support gives the sector breathing room and may separate short-term relief from genuine recovery. Energy still sits close to the macro headlines, and while calmer transport and fuel costs can ease pressure, the market will continue to price it as a cyclical sector that can turn quickly when sentiment changes.",
      stockParams: {
        rMarket: 0.3085,
        stocks: {
          'BNK-V': { rSector: 0.3617, gamma: 0.0830, mScenario: 1.00, sigmaBase: 0.4304 },
          'TEC-F': { rSector: -0.3227, gamma: 0.2572, mScenario: 0.90, sigmaBase: 0.2608 },
          'CSM-M': { rSector: 0.0868, gamma: -0.5260, mScenario: 1.05, sigmaBase: 0.2719 },
          'REA-V': { rSector: 2.4747, gamma: -0.1678, mScenario: 1.28, sigmaBase: 0.3207 },
          'ENE-G': { rSector: -0.0261, gamma: 1.7400, mScenario: 1.22, sigmaBase: 0.2120 }
        }
      }
    },
    '3.3': {
      id: '3.3',
      year: 3,
      title: "The pandemic gets worse",
      scenarioOverview: "Virus-XIX does not slow down as expected. Large medical companies race to develop a vaccine, and governments pour money into hospitals, labs, and emergency health systems. However, a new variant appears before the world can fully catch up, making early vaccine plans less effective. Many countries continue lockdowns, ask people to stay home, and limit public activities, creating a huge wave of job losses. For Vietnam, this becomes one of the hardest years since the Reform era.",
      events: [
        { title: "Policy Caution", text: "There are no longer the “free-fall” drops seen last year; nevertheless, the economy remains highly sensitive and fragile this year. Uncertainty from virus variants makes current healthcare hard to control, and policy moves are being made with great caution.", impact: "Consumer Stock -5% · Savings return +1.5%" },
        { title: "Digital Transformation Boom", text: "A bright spot this year is the rapid development of digital transformation. The trends of working from home, online delivery, and conducting activities digitally have forced us to adapt and upgrade our technology infrastructure.", impact: "Tech Stock +8% · Inflation +2%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.03, 'TEC-F': 0.08, 'CSM-M': -0.05, 'REA-V': -0.05, 'ENE-G': -0.02 },
      savingsRateAdjustment: 0.015,
      inflationRate: 0.02,
      children: ['4.2'],
      sectorInfo: "Vietnam entered this phase with the economy still holding up better than many peers, but the cushion was thin: the country had expanded by 2.9% in the earlier shock year, and the next wave of outbreaks kept growth under pressure even as policymakers tried to keep the system moving. The market’s first reaction was not panic in the old sense, but a careful repricing of what “normal” even meant, as tighter curbs in key cities slowed activity and made every sector rethink visibility. Banking becomes the market’s nerve center again, because liquidity support and policy easing can soften the blow, yet credit quality and repayment discipline remain the real tests beneath the surface. Consumer names stay under pressure as households become more selective, but the story begins to split: offline spending weakens while online shopping, delivery, and social commerce gain traction much faster than before. Technology is where the market finds its clearest growth narrative, since remote work, digital payments, and online services suddenly feel less like convenience and more like infrastructure. Real estate remains unpredictable because the sector still needs confidence, financing, and mobility all at once, and although this phase gives it very little of any of those, it may release promising outlooks. Energy stays tied to the pace of movement in the real economy, so it can recover when activity returns and makes it best to escape the drag from a world that is still operating below normal.",
      stockParams: {
        rMarket: -0.5188,
        stocks: {
          'BNK-V': { rSector: 1.5142, gamma: 0.0949, mScenario: 1.12, sigmaBase: 0.1904 },
          'TEC-F': { rSector: 1.2032, gamma: -0.4997, mScenario: 0.86, sigmaBase: 0.1896 },
          'CSM-M': { rSector: 0.1861, gamma: -0.06417, mScenario: 1.20, sigmaBase: 0.2951 },
          'REA-V': { rSector: 0.6529, gamma: -0.1509433, mScenario: 1.28, sigmaBase: 0.1914 },
          'ENE-G': { rSector: 0.5660, gamma: -0.0747, mScenario: 1.08, sigmaBase: 0.1996 }
        }
      }
    },
    '3.4': {
      id: '3.4',
      year: 3,
      title: "Pandemic under control",
      scenarioOverview: "After a stressful year, many countries begin to respond more seriously. Governments invest more in healthcare services, expand hospitals, build quarantine areas, and support vaccine research. This year, Vietnam and many other countries succeed in rolling out free vaccination programs on a large scale. Thanks to early awareness, public cooperation, and a strong sense of community support, the situation becomes much more controlled. Digital transformation, online payments, delivery apps, and remote services become part of everyday life.",
      events: [
        { title: "Policy Rate Cut", text: "As the epidemic came more under control, governments began timely economic policies to help the economy recover. Central banks repeatedly cut policy rates, and the surge of retail F0 investors pushed the VN-Index back up.", impact: "All Stocks +5% · Savings return -1.5%" },
        { title: "Business Support Packages", text: "Besides cutting interest rates, our government aggressively rolled out business support packages, tax deferrals, and accelerated public investment disbursement. A large volume of payments flowed back into the market.", impact: "Bank Stock +4% · Inflation -1%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.09, 'TEC-F': 0.05, 'CSM-M': 0.05, 'REA-V': 0.05, 'ENE-G': 0.05 },
      savingsRateAdjustment: -0.015,
      inflationRate: -0.01,
      children: ['4.3', '4.4'],
      sectorInfo: "With widespread, free vaccination programs successfully rolled out and the immediate systemic shocks of the pandemic largely mitigated, the macroeconomic landscape has transitioned into a highly accommodative recovery phase. The central thesis of this period is driven by unprecedented liquidity. Repeated policy rate cuts by the central bank, coupled with aggressive fiscal stimulus, including tax deferrals, business support packages, and accelerated public investment disbursement, have flooded the system with cheap capital. This environment has catalyzed a historic influx of retail \"F0\" investors, whose search for yield has driven broad-based multiple expansion across the benchmark index. Technology stands out as the market's primary structural beneficiary. The pandemic effectively forced a multi-year digital transformation into a single cycle. With online payments, delivery logistics, and remote enterprise solutions now permanently embedded in everyday consumer and corporate habits, the sector is experiencing explosive top-line growth and commanding significant growth premiums. Banking serves as the primary conduit for this systemic liquidity. To alleviate the financial burden on domestic enterprises and stimulate credit demand, the central bank executed consecutive policy rate cuts. This deliberate injection of systemic liquidity, lower funding cost, combined with a historic surge of retail capital into alternative asset classes, left commercial banks highly liquid and under little pressure to compete for deposits. However, government-backed credit support initiatives have helped insulate balance sheets, positioning banks as high-momentum vehicles for capturing the broader economic rebound. Real estate has emerged as a high-beta outperformer in this cycle. Despite lingering operational bottlenecks, the sector is being aggressively re-rated. The combination of rock-bottom borrowing costs and accelerated public infrastructure disbursement has channeled substantial speculative capital into property assets, as investors look for traditional hedges against future inflation in a highly liquid market. Energy equities are tracking a steady, fundamentally driven recovery, mirroring the gradual normalization of industrial activity and the stabilization of global supply chains as pandemic restrictions ease. Conversely, the consumer discretionary sector, while positive, is exhibiting a more muted recovery profile. Although digital retail channels are thriving, the broader consumer base remains somewhat cautious after a stressful economic year, resulting in steady but comparatively slower revenue normalization against the broader high-flying market.",
      stockParams: {
        rMarket: 0.2906,
        stocks: {
          'BNK-V': { rSector: 0.6106, gamma: -0.10808, mScenario: 0.92, sigmaBase: 0.2009 },
          'TEC-F': { rSector: 0.8259, gamma: 0.05914, mScenario: 1.00, sigmaBase: 0.2037 },
          'CSM-M': { rSector: 0.1176, gamma: 0.10826, mScenario: 0.95, sigmaBase: 0.2951 },
          'REA-V': { rSector: 0.6529, gamma: -0.13736, mScenario: 1.03, sigmaBase: 0.2163 },
          'ENE-G': { rSector: 0.2785, gamma: -0.10826, mScenario: 0.90, sigmaBase: 0.3070 }
        }
      }
    },
    '4.1': {
      id: '4.1',
      year: 4,
      title: "Global storms: Trade tensions rise",
      scenarioOverview: "The Middle East becomes a \"chessboard\" in the tech and geopolitical cold war between the US and China. While the US pressures Middle Eastern countries to limit tech cooperation with Beijing, China tries to use these same nations to access advanced US technology. This sparks a New Cold War between the two superpowers.",
      events: [
        { title: "Trade Barriers", text: "Political conflicts between major powers stoke fears about slower trade and weaker demand. Investors are moving into defense mode.", impact: "Consumer Stock -7% · Other Stocks -5%" },
        { title: "Tech Relocation", text: "Vietnam welcomes a wave of top tech corporations moving factories and R&D centers here. Government approves national strategy for semiconductor development.", impact: "Tech Stock +8% · Inflation +2%" },
        { title: "Risk Aversion", text: "Risk aversion moves money out of stocks and into safe bank savings.", impact: "Savings return +1.5%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.05, 'TEC-F': 0.03, 'CSM-M': -0.07, 'REA-V': -0.05, 'ENE-G': -0.05 },
      savingsRateAdjustment: 0.015,
      inflationRate: 0.02,
      children: ['5.1'],
      sectorInfo: "The market narrative is evolving once again, shifting from concerns over conflict and disruption toward a world increasingly shaped by strategic rivalry. As the United States and China deepen their competition for technological leadership, investors are becoming more selective, favoring businesses with clear visibility on growth while remaining cautious toward sectors exposed to global trade frictions. Concerns about slower cross-border commerce and rising supply-chain costs continue to weigh on sentiment, yet Vietnam finds itself in a uniquely advantageous position as multinational corporations accelerate diversification efforts and expand their presence in the country. Technology stands at the center of this transition, supported by growing interest in semiconductor development, advanced manufacturing, and digital infrastructure, though expectations are rising alongside opportunities. Financial institutions may benefit from stronger capital flows and investment activity, but markets are likely to reward those capable of balancing growth with prudent risk management. Real estate remains closely tied to the investment cycle, where industrial and strategic assets could attract renewed attention even as broader confidence remains uneven. Consumer businesses face a more complex environment in which spending resilience matters as much as growth, particularly if global uncertainty begins to influence household behavior. Meanwhile, energy companies continue to navigate a landscape shaped by geopolitics rather than fundamentals alone, leaving investors to determine whether volatility represents risk, opportunity, or a combination of both. In this phase of the story, the winners may be defined less by where they operate today and more by how effectively they position themselves within the emerging global order.",
      stockParams: {
        rMarket: 0.2548,
        stocks: {
          'BNK-V': { rSector: -0.4451, gamma: 0.2370, mScenario: 0.93, sigmaBase: 0.4148 },
          'TEC-F': { rSector: -0.2034, gamma: 0.4200, mScenario: 1.08, sigmaBase: 0.2289 },
          'CSM-M': { rSector: 0.0344, gamma: -0.0189, mScenario: 1.00, sigmaBase: 0.2107 },
          'REA-V': { rSector: 1.0862, gamma: -0.0800, mScenario: 1.50, sigmaBase: 0.3199 },
          'ENE-G': { rSector: -0.1938, gamma: 0.1680, mScenario: 1.35, sigmaBase: 0.1837 }
        }
      }
    },
    '4.2': {
      id: '4.2',
      year: 4,
      title: "The biggest financial scandal",
      scenarioOverview: "Nothing too dramatic happens in the global economy this year. However, Vietnam's economy was severely shaken by a major financial scandal, a 'mega-case' involving one of the largest conglomerates and one of the biggest banks in the South. The total damage reached 700 trillion VND, which was later recognized as one of the largest embezzlement, fraud, and money laundering cases in Vietnam's history.",
      events: [
        { title: "Real Estate Freeze", text: "The scandal-ridden conglomerate holds a massive amount of real estate and related projects. As credit funding to this sector is significantly cut off and investor confidence lost, the stock market plummets.", impact: "Real Estate Stock -12% · Bank Stock -8%" },
        { title: "Savings Panic & Drop", text: "The loss of savings deposits has plunged tens of thousands of Bank S's customer families into hardship, indirectly dragging down domestic consumer demand and overall economic growth.", impact: "Consumer Stock -7% · Savings return -1.0%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.08, 'TEC-F': -0.02, 'CSM-M': -0.07, 'REA-V': -0.12, 'ENE-G': -0.02 },
      savingsRateAdjustment: -0.01,
      inflationRate: 0.01,
      children: ['5.2'],
      sectorInfo: "Vietnam’s market has now moved from external caution to an internal trust shock because this year's arrest tied to a banking crisis became the turning point after which confidence in the property-finance complex weakened sharply. In the real economy, the scandal landed on top of an already softer growth backdrop in the subsequent period, with the leading financial experts noting a slowdown as domestic demand and external trade both lost momentum. Banking is no longer just a policy-sensitive sector here; it becomes the market’s pressure point, where liquidity, funding trust, and deposit behavior matter more than headline scale. The safest names may still hold up, but the market will increasingly punish anything that looks too closely tied to opaque credit growth or balance-sheet stress. To defend their deposit bases, prevent potential capital runs, and stabilize balance sheets against interbank volatility, commercial banks aggressively hiked deposit yields. The State Bank of Vietnam temporarily permitted flexible rate adjustments to inject stability and attract idle capital back into the regulated banking system. Real estate turns into the clearest symbol of the reset: not every project disappears, but the sector’s valuation is now being judged through a lens of survival, refinancing, and credibility rather than expansion. Consumer businesses also feel the spillover, as deposit losses and weaker household confidence quietly narrow spending appetite and make demand recovery uneven. Technology, by contrast, can look comparatively resilient, since it is less directly exposed to the scandal and may continue to attract capital as investors search for cleaner growth stories. Energy remains more cyclical, but in a nervous market it can still benefit when investors rotate toward names that are less entangled with domestic trust issues. During this stage, the market is not rewarding optimism; it is rewarding transparency, discipline, and the ability to stay standing when confidence is the first thing to disappear.",
      stockParams: {
        rMarket: 0.0287,
        stocks: {
          'BNK-V': { rSector: 0.1452, gamma: -0.5638, mScenario: 1.35, sigmaBase: 0.2176 },
          'TEC-F': { rSector: 0.3563, gamma: 0.2412, mScenario: 0.75, sigmaBase: 0.1581 },
          'CSM-M': { rSector: -0.1209, gamma: -0.1274, mScenario: 1.15, sigmaBase: 0.2997 },
          'REA-V': { rSector: 0.4119, gamma: -0.2706, mScenario: 1.60, sigmaBase: 0.2796 },
          'ENE-G': { rSector: 0.1870, gamma: 0.4312, mScenario: 0.95, sigmaBase: 0.2001 }
        }
      }
    },
    '4.3': {
      id: '4.3',
      year: 4,
      title: "Living with Virus-XIX",
      scenarioOverview: "After two years of struggle, the world becomes more familiar with the pandemic. Vaccines are widely available, and countries start shifting from “fighting the virus” to “living with the virus.” Streets reopen and quarantine rules are mainly applied to infected people instead of the whole community. Domestic and international trade slowly recover, while factories, offices, and service businesses restart their normal activities. In Vietnam, people begin to feel hopeful again. The economy is not fully healed yet, but consumers are less cautious than before.",
      events: [
        { title: "Stimulus Packages", text: "The economy gradually resumed activity. The Vietnamese government took cautious but steady steps such as slowly lowering interest rates and launching stimulus packages to circulate liquidity.", impact: "Bank Stock +3% · Savings return -1.0%" },
        { title: "E-commerce Habits", text: "Online shopping during the pandemic gradually became a habit. E-commerce platforms were motivated to run more campaigns to attract consumers.", impact: "Consumer Stock +5% · Tech Stock +2%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.03, 'TEC-F': 0.02, 'CSM-M': 0.05, 'REA-V': 0.02, 'ENE-G': 0.02 },
      savingsRateAdjustment: -0.01,
      inflationRate: 0.01,
      children: ['5.3'],
      sectorInfo: "Seeing the virus shock begins to ease, Vietnam moves into a careful reopening phase: the State Bank leans toward support, keeps credit flowing, and targets credit growth while still watching inflation closely, giving the market a reason to believe the worst of the freeze may be behind it. Banking becomes the first place investors look for that recovery signal, because easier liquidity can help activity normalize, but the sector still needs to prove that support is turning into healthy lending rather than just short-term relief. Technology starts to feel more like an essential layer of the economy than a defensive niche, as Vietnam’s digital shift accelerates and e-commerce expands faster than the global average. Consumer names also begin to regain color, since online shopping habits formed during the lockdowns do not disappear—they harden into routine, and the best operators are the ones that can keep turning campaigns and vouchers into repeat traffic. Real estate remains under pressure, but the story is no longer only about absence; it is about whether buyers, lenders, and developers can slowly find the confidence to re-enter the same room. Energy stays tied to the pace of physical activity, so as factories, offices, and transport gradually come back online, the sector can recover, though not without the usual swings that come with a reopening trade. The market is not healed yet, and investors can still feel the damage underneath, but the direction of travel has changed from pure fear to selective rebuilding. The names that survive this phase are the ones that can live with caution, adapt to digital behavior, and turn reopening into something more durable than a brief bounce.",
      stockParams: {
        rMarket: -0.2906,
        stocks: {
          'BNK-V': { rSector: 0.6106, gamma: 0.10808, mScenario: 1.00, sigmaBase: 0.2009 },
          'TEC-F': { rSector: 0.8259, gamma: -0.05914, mScenario: 0.88, sigmaBase: 0.2037 },
          'CSM-M': { rSector: 0.1176, gamma: 0.10826, mScenario: 1.05, sigmaBase: 0.2951 },
          'REA-V': { rSector: 0.6529, gamma: -0.13736, mScenario: 1.08, sigmaBase: 0.2163 },
          'ENE-G': { rSector: 0.2785, gamma: 0.10826, mScenario: 1.27, sigmaBase: 0.3070 }
        }
      }
    },
    '4.4': {
      id: '4.4',
      year: 4,
      title: "Delayed economic pressure",
      scenarioOverview: "Virus-XIX still exists, but it is no longer the only topic people talk about. Most people have learned to live with it. However, the delayed economic effects of the pandemic now begin to appear more clearly. During the outbreak, many countries used large stimulus packages and low interest rates to protect businesses and households. These policies pushes the inflation to its highest level in 30 years, becoming a new challenge for both the world and Vietnam. The pandemic is calmer, but the economic repair work is far from over.",
      events: [
        { title: "Fed Interest Hike", text: "To stamp out inflation, the Fed was forced to reverse policy urgently by hiking interest rates repeatedly. As rates rose, “cheap money” disappeared. Capital pulled strongly out of risky assets.", impact: "All Stocks -5% · Savings return +2.0%" },
        { title: "Commercial Bank Failure", text: "A large U.S. commercial bank failed after customers withdrew deposits en masse, creating a liquidity imbalance. This raised concerns about the stability of the global financial system.", impact: "Bank Stock -5% · Inflation +3.0%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.10, 'TEC-F': -0.05, 'CSM-M': -0.05, 'REA-V': -0.05, 'ENE-G': -0.05 },
      savingsRateAdjustment: 0.02,
      inflationRate: 0.03,
      children: ['5.4'],
      sectorInfo: "As the delayed economic bill from pandemic-era monetary easing comes due, the macroeconomic landscape in this period is defined by persistent inflationary pressures that squeeze corporate margins and consumer purchasing power alike. In this restrictive climate, technology continues to act as a resilient structural outperformer, insulated by non-discretionary corporate digitization budgets and a systemic shift toward enterprise efficiency. The banking sector presents a more complex outlook; while operational activity remains steady, credit analysts are increasingly monitoring escalating asset quality risks and potential pressure on net interest margins driven by a higher cost of capital. Also, the central bank raised benchmark rates systematically to cool down persistent price pressures, but moved with relative caution to avoid completely choking off credit flow to the manufacturing and export sectors that are still in the middle of long-term economic repair. Energy names offer a reliable defensive hedge, as sticky commodity pricing and steady domestic utility demand provide a stable floor for their revenue streams. On the downside, the consumer discretionary sector is bearing the direct brunt of macroeconomic headwinds, facing complex variation as eroded real wages force households to prioritize essential goods over retail spending. Also, the notable highlight is heavily mirrored in real estate, where high borrowing costs, stringent credit tightening, and weak buyer sentiment continue to freeze transactional volume and delay project completions on the ground. Consequently, the overarching market thesis has fundamentally rotated away from liquidity-driven expansion toward sharp operational divergence between sectors. Successfully compounding capital in this late cycle environment requires looking past speculative growth narratives and strictly prioritizing underlying cash flow durability and strong pricing power.",
      stockParams: {
        rMarket: 0.1120,
        stocks: {
          'BNK-V': { rSector: 0.2155, gamma: -0.43625, mScenario: 0.95, sigmaBase: 0.1483 },
          'TEC-F': { rSector: 0.6351, gamma: 0.02782, mScenario: 1.20, sigmaBase: 0.1900 },
          'CSM-M': { rSector: -0.0294, gamma: 0.25875, mScenario: 1.03, sigmaBase: 0.2323 },
          'REA-V': { rSector: -0.0587, gamma: 1.05835, mScenario: 1.15, sigmaBase: 0.2665 },
          'ENE-G': { rSector: 0.0739, gamma: 0.14836, mScenario: 0.97, sigmaBase: 0.1434 }
        }
      }
    },
    '5.1': {
      id: '5.1',
      year: 5,
      title: "Geopolitical tension eases",
      scenarioOverview: "After a year of intense geopolitical conflict and tension, things have taken a more positive turn this year. Many negotiation talks have taken place, most notably the US-China Summit in Beijing. Here, the two nations reached mutual commitments on semiconductor technology. Vietnam is also reaping the rewards, with a double wave of FDI inflows from both superpowers pouring into our country.",
      events: [
        { title: "Semiconductor FDI", text: "Following last year's signings, the semiconductor factories and AI centers that Vietnam co-developed with big technology corporations in the U.S. have officially gone into operation.", impact: "Tech Stock +5%" },
        { title: "FTSE Emerging Market Upgrade", text: "After many efforts to upgrade technical infrastructure and legal frameworks, Vietnam's stock market will finally be upgraded by FTSE Russell from a Frontier Market to a Secondary Emerging Market.", impact: "All Stocks +3% · Savings return -0.5%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.03, 'TEC-F': 0.08, 'CSM-M': 0.03, 'REA-V': 0.03, 'ENE-G': 0.03 },
      savingsRateAdjustment: -0.005,
      inflationRate: -0.01,
      children: [],
      sectorInfo: "Vietnam entered this final phase with policy clearly leaning back toward growth support: the State Bank had been pressing for lower lending rates, while official statistics showed disbursed FDI in the first five months of this year at an estimated US$8.9 billion, up 7.9% year on year. That sets the tone for a market where liquidity is easier, capital is moving faster, and investor attention is gradually shifting from survival to selective growth. From here, the market story changes texture. Banking no longer reads like a defensive shelter alone; it starts to look like the main transmission channel of the easing cycle, where cheaper funding, stronger credit appetite, and a more forgiving policy stance can reignite momentum. In a market like this, lenders that combine scale with discipline may quietly outperform the crowded names that chase volume too aggressively. Technology steps into a more constructive spotlight as global supply chains continue to search for balance and Vietnam remains positioned as a natural landing point for strategic capital. The market may be willing to pay for that promise, but only for companies that can turn geopolitical interest into visible contracts, execution, and margins. Consumer businesses begin to feel the first real pulse of recovery as sentiment improves and financing pressure eases. Still, this is not a broad-based spending boom; it is a phase of gradual normalization. The strongest names will be those that can capture returning demand without overreaching on inventory or pricing power. Real estate, meanwhile, becomes the most dramatic chapter of the phase. The policy backstop offers breathing room, and that breathing room alone can change the tone of the entire sector. But investors should treat relief and recovery as two different things. Some names may simply survive longer; a smaller group may actually rebuild. Energy sits somewhere between macro and narrative. With liquidity improving and industrial activity likely to strengthen, the sector can regain attention, but it remains sensitive to both policy direction and the market’s appetite for cyclical exposure. Hence, the market is not asking who suffered most last year. It is asking who is best positioned to convert a softer policy backdrop into a real earnings turn.",
      stockParams: {
        rMarket: 0.3284,
        stocks: {
          'BNK-V': { rSector: 0.3186, gamma: 0.2500, mScenario: 0.93, sigmaBase: 0.2307 },
          'TEC-F': { rSector: -0.2831, gamma: 0.2700, mScenario: 0.90, sigmaBase: 0.2776 },
          'CSM-M': { rSector: 0.0936, gamma: -1.0300, mScenario: 0.98, sigmaBase: 0.2719 },
          'REA-V': { rSector: 1.4222, gamma: -0.6700, mScenario: 1.12, sigmaBase: 0.4168 },
          'ENE-G': { rSector: 0.5089, gamma: -0.4400, mScenario: 0.88, sigmaBase: 0.4395 }
        }
      }
    },
    '5.2': {
      id: '5.2',
      year: 5,
      title: "Post-scandal aftermath",
      scenarioOverview: "While the rest of the world remains peaceful, the Vietnamese government is struggling to fix the damage from the recent major scandal: a frozen real estate and bond market, coupled with public confidence hitting rock bottom. To prevent an economic crash, the Central Bank is forced to reverse its policy to save dying businesses.",
      events: [
        { title: "Interest Rate Cuts", text: "The Central Bank cuts interest rates four times in a row to pump money into the system, allowing businesses to borrow capital at much lower rates.", impact: "Bank Stock +4% · Savings return -1.5%" },
        { title: "Real Estate Debt Decree", text: "The government issues a decree allowing businesses to delay their debt payments without being flagged as bad debt by banks. This decree has saved real estate businesses that were on the verge of bankruptcy.", impact: "Real Estate Stock +8% · Inflation +1%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.04, 'TEC-F': 0.00, 'CSM-M': 0.00, 'REA-V': 0.08, 'ENE-G': 0.00 },
      savingsRateAdjustment: -0.015,
      inflationRate: 0.01,
      children: [],
      sectorInfo: "The market’s story now wraps up inward, because after the scandal the biggest risk is no longer external uncertainty but a collapse in trust at home. As the economy struggled to hold together, GDP still expanded 5.05% and CPI rose 3.25%, but the real story was a trust shock that froze parts of the property and bond channels and forced policymakers into damage-control mode. The central bank is pushed back into an easing stance to keep the system from tightening too hard, and that gives banks some breathing room even as credit quality and depositor confidence remain under a microscope. Real estate stays at the center of the stress, with funding channels frozen and sentiment still fragile, so the sector looks less like a growth engine and more like a long, difficult repair job. Consumer names, by contrast, start to find a pulse again as livestream shopping, vouchers, and digital campaigns pull bargain hunters back into the market and revive a slice of household spending. Technology becomes the cleanest story on the board, helped by the market’s appetite for AI and anything that feels forward-looking, while also benefiting from capital rotating away from scandal-linked sectors. At the same time, energy can still hold attention as a cyclical play, but in a market like this, it is more a rotation trade than a conviction bet. The broader economy is still healing from the shock, with growth slowing and domestic demand only normalizing gradually. In this final phase, investors are not chasing expansion; they are searching for the names that still look believable enough to survive the reset.",
      stockParams: {
        rMarket: 0.0790,
        stocks: {
          'BNK-V': { rSector: 0.1940, gamma: 0.3869, mScenario: 1.30, sigmaBase: 0.1950 },
          'TEC-F': { rSector: 0.3900, gamma: 0.2278, mScenario: 0.80, sigmaBase: 0.1470 },
          'CSM-M': { rSector: -0.1270, gamma: 0.3134, mScenario: 1.08, sigmaBase: 0.2610 },
          'REA-V': { rSector: 2.2470, gamma: -0.3438, mScenario: 1.50, sigmaBase: 0.2680 },
          'ENE-G': { rSector: 0.2600, gamma: -0.3198, mScenario: 0.95, sigmaBase: 0.1650 }
        }
      }
    },
    '5.3': {
      id: '5.3',
      year: 5,
      title: "Ready for development",
      scenarioOverview: "Another piece of good news is that Vietnam was one of the countries that controlled inflation best last year. Continuing that momentum, this year our country is ready to kickstart a dynamic economy, increasing investment in emerging sectors such as technology and digital transformation. At the same time, the government is also creating favorable conditions for the resumption of production and construction activities.",
      events: [
        { title: "Livestream E-commerce", text: "Livestream shopping exploded. E-commerce platforms launch more campaigns, loyalty programs and promote digital advertising, featuring many celebrities and attractive voucher packages.", impact: "Consumer Stock +8% · Inflation +1%" },
        { title: "AI Integration in Business", text: "The real estate market has yet to recover due to the ongoing economic difficulties following the pandemic. However, the market is being boosted by technological advancements, specifically the emergence of AI.", impact: "Tech Stock +8% · Savings return -0.5%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.02, 'TEC-F': 0.08, 'CSM-M': 0.08, 'REA-V': 0.00, 'ENE-G': 0.02 },
      savingsRateAdjustment: -0.005,
      inflationRate: 0.01,
      children: [],
      sectorInfo: "With post-pandemic headwinds finally subsiding and inflation largely contained, the macroeconomic landscape is shifting from a defensive stance to proactive expansion. The focus is no longer on mere recovery but on structural modernization, supported by policies aimed at revitalizing industrial activity. Technology has definitively transitioned from a thematic growth narrative to the market's core driver. Catalyzed by rapid advancements in artificial intelligence, the sector is commanding a significant premium, absorbing the bulk of investor enthusiasm as businesses across the board rush to integrate digital solutions. On the retail front, consumer discretionary is experiencing a structural evolution rather than a simple bounce-back. The traditional shopping recovery is being aggressively amplified by the livestream e-commerce boom; operators who effectively leverage digital campaigns, gamified promotions, and influencer ecosystems are successfully monetizing a highly engaged, deal-seeking demographic, driving tangible revenue growth. Energy demand is tracking in lockstep with this physical reawakening—as factory floors power up and construction projects resume, power consumption is normalizing, providing a solid, fundamentally driven floor for the sector. Banking serves as the stable anchor for this renewed momentum. Tame inflation has afforded policymakers the runway to maintain supportive liquidity, allowing financial institutions to confidently underwrite these emerging technological and industrial initiatives without immediate tightening concerns. Real estate, however, remains the primary laggard. While developers are attempting to construct a forward-looking narrative around AI-integrated smart properties to attract capital, the fundamental realities on the ground—cautious buyers and lingering liquidity hangovers—continue to weigh heavily, leaving the sector to trade more on speculative future models than present-day cash flows. The lingering hesitations of the previous years are being aggressively paved over by digital gold rushes and a hunger for innovation, meaning the challenge for investors is no longer about avoiding the freeze but rather holding on tight as the velocity of change accelerates.",
      stockParams: {
        rMarket: 0.0893,
        stocks: {
          'BNK-V': { rSector: 0.2666, gamma: 0.479186, mScenario: 0.92, sigmaBase: 0.1786 },
          'TEC-F': { rSector: 1.3883, gamma: -0.077954, mScenario: 0.87, sigmaBase: 0.1796 },
          'CSM-M': { rSector: 0.0822, gamma: -0.333060, mScenario: 0.95, sigmaBase: 0.2502 },
          'REA-V': { rSector: -0.0290, gamma: -0.164259, mScenario: 1.10, sigmaBase: 0.2348 },
          'ENE-G': { rSector: 0.2855, gamma: 0.229973, mScenario: 0.90, sigmaBase: 0.1642 }
        }
      }
    },
    '5.4': {
      id: '5.4',
      year: 5,
      title: "AI becomes the trend",
      scenarioOverview: "Virus-XIX changed the world faster than expected, especially in technology. After years of remote work, online payments, digital banking, and e-commerce, people are much more open to using digital tools in daily life. As the economy becomes more stable, AI starts to rise as a new growth engine. Businesses begin applying AI in customer service, finance, logistics, education, and marketing.",
      events: [
        { title: "Generative AI Chatbots", text: "A public AI chatbot becomes popular worldwide and turns artificial intelligence from a niche tech topic into a mainstream business trend. Companies begin testing AI tools.", impact: "Tech Stock +10% · Savings return -0.5%" },
        { title: "Economic Recovery", text: "Vietnam’s recovery story becomes stronger as exports improve, manufacturing activity picks up, and FDI inflows rise. Factories receive more orders.", impact: "All Stocks +4% · Inflation +1%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.04, 'TEC-F': 0.14, 'CSM-M': 0.04, 'REA-V': 0.04, 'ENE-G': 0.04 },
      savingsRateAdjustment: -0.005,
      inflationRate: 0.01,
      children: [],
      sectorInfo: "Moving past the delayed inflationary pressures of the previous cycle, the macroeconomic environment has entered a final stage of a definitive structural pivot driven by synchronized industrial recoveries and an unprecedented technological inflection point. Technology has firmly consolidated its position as the market's primary growth vanguard, catalyzed by the global mainstreaming of generative artificial intelligence and a sweeping corporate mandate to embed digital tools into core logistics and customer ecosystems. Providing a steady baseline for this expansion, the banking sector is exhibiting renewed stability, capturing healthier credit demand as corporate balance sheets normalize and export-oriented businesses scale up operations. This industrial reawakening is directly feeding into energy names, which are capturing structural upside as rising foreign direct investment, busier industrial zones, and accelerating manufacturing activity drive a substantial utilization baseline across power infrastructure. Conversely, the consumer discretionary space is mapping a more uneven and fragmented trajectory; despite a broader lift in public sentiment, underlying retail volumes suggest that consumer habits remain highly value-conscious and thoroughly digital-first, heavily penalizing operators slow to modernize. Real estate similarly finds itself in a transitional phase, working through lingering bottlenecks but gradually anchoring its recovery to the broader economic stability and long-term tech-integrated infrastructure demands. Ultimately, the market landscape has transformed from a battleground of defensive insulation into a highly selective race for digital and operational scalability. Alpha generation in this mature cycle shifts away from broad-index exposure, requiring a strategic focus on those resilient operators capable of translating macro normalization into sustainable corporate expansion.",
      stockParams: {
        rMarket: -0.1127,
        stocks: {
          'BNK-V': { rSector: 0.2121, gamma: 0.567090, mScenario: 0.93, sigmaBase: 0.1942 },
          'TEC-F': { rSector: 0.7670, gamma: -0.056710, mScenario: 0.85, sigmaBase: 0.1942 },
          'CSM-M': { rSector: -0.2552, gamma: 0.567094, mScenario: 0.98, sigmaBase: 0.1942 },
          'REA-V': { rSector: -0.0720, gamma: 1.812110, mScenario: 1.10, sigmaBase: 0.2299 },
          'ENE-G': { rSector: -0.0166, gamma: 0.292490, mScenario: 0.95, sigmaBase: 0.1293 }
        }
      }
    }
  };

  const MARKET_PRICE_BOUNDS = {
    '1.1': {
      'BNK-V': { min: 43730, max: 70556 },
      'CSM-M': { min: 45881, max: 96841 },
      'ENE-G': { min: 54234, max: 120779 },
      'REA-V': { min: 11130, max: 232862 },
      'TEC-F': { min: 47135, max: 79643 },
    },
    '2.1': {
      'BNK-V': { min: 35614, max: 57461 },
      'CSM-M': { min: 46442, max: 98024 },
      'ENE-G': { min: 59683, max: 132916 },
      'REA-V': { min: 12184, max: 254903 },
      'TEC-F': { min: 61445, max: 103823 },
    },
    '2.2': {
      'BNK-V': { min: 33646, max: 54287 },
      'CSM-M': { min: 36910, max: 77905 },
      'ENE-G': { min: 43354, max: 96550 },
      'REA-V': { min: 15156, max: 183763 },
      'TEC-F': { min: 46939, max: 79312 },
    },
    '3.1': {
      'BNK-V': { min: 38724, max: 62480 },
      'CSM-M': { min: 50874, max: 107380 },
      'ENE-G': { min: 73019, max: 162615 },
      'REA-V': { min: 13159, max: 275297 },
      'TEC-F': { min: 62363, max: 105374 },
    },
    '3.2': {
      'BNK-V': { min: 48472, max: 105354 },
      'CSM-M': { min: 97137, max: 150442 },
      'ENE-G': { min: 131253, max: 204516 },
      'REA-V': { min: 125507, max: 329875 },
      'TEC-F': { min: 104220, max: 150250 },
    },
    '3.3': {
      'BNK-V': { min: 35026, max: 71315 },
      'CSM-M': { min: 16922, max: 121014 },
      'ENE-G': { min: 39099, max: 114572 },
      'REA-V': { min: 43648, max: 199010 },
      'TEC-F': { min: 97241, max: 131734 },
    },
    '3.4': {
      'BNK-V': { min: 55119, max: 88931 },
      'CSM-M': { min: 71608, max: 151144 },
      'ENE-G': { min: 77784, max: 173227 },
      'REA-V': { min: 14906, max: 311854 },
      'TEC-F': { min: 71432, max: 120696 },
    },
    '4.1': {
      'BNK-V': { min: 65216, max: 105223 },
      'CSM-M': { min: 75425, max: 159200 },
      'ENE-G': { min: 128911, max: 287088 },
      'REA-V': { min: 22071, max: 461754 },
      'TEC-F': { min: 110976, max: 187513 },
    },
    '4.2': {
      'BNK-V': { min: 28949, max: 68804 },
      'CSM-M': { min: 27110, max: 105227 },
      'ENE-G': { min: 51746, max: 188000 },
      'REA-V': { min: 10360, max: 155002 },
      'TEC-F': { min: 66650, max: 149659 },
    },
    '4.3': {
      'BNK-V': { min: 48399, max: 78090 },
      'CSM-M': { min: 27449, max: 57937 },
      'ENE-G': { min: 37635, max: 83814 },
      'REA-V': { min: 10822, max: 226408 },
      'TEC-F': { min: 98313, max: 166117 },
    },
    '4.4': {
      'BNK-V': { min: 48345, max: 78002 },
      'CSM-M': { min: 61950, max: 130758 },
      'ENE-G': { min: 76529, max: 170432 },
      'REA-V': { min: 11081, max: 231839 },
      'TEC-F': { min: 64408, max: 108828 },
    },
    '5.1': {
      'BNK-V': { min: 76071, max: 122738 },
      'CSM-M': { min: 79009, max: 166765 },
      'ENE-G': { min: 13861, max: 30869 },
      'REA-V': { min: 18585, max: 388814 },
      'TEC-F': { min: 143373, max: 242254 },
    },
    '5.2': {
      'BNK-V': { min: 49524, max: 117705 },
      'CSM-M': { min: 46749, max: 181457 },
      'ENE-G': { min: 75502, max: 274311 },
      'REA-V': { min: 14226, max: 256248 },
      'TEC-F': { min: 86606, max: 194469 },
    },
    '5.3': {
      'BNK-V': { min: 54205, max: 123401 },
      'CSM-M': { min: 14620, max: 76510 },
      'ENE-G': { min: 33335, max: 141534 },
      'REA-V': { min: 12055, max: 374974 },
      'TEC-F': { min: 126011, max: 272077 },
    },
    '5.4': {
      'BNK-V': { min: 39980, max: 64505 },
      'CSM-M': { min: 34213, max: 72213 },
      'ENE-G': { min: 58132, max: 129462 },
      'REA-V': { min: 11189, max: 116834 },
      'TEC-F': { min: 43716, max: 73865 },
    },
  };

  const MARKET_EVENTS = [
    {
      year: 1,
      title: "Markets hold steady as consumers chill",
      description: "The economy is kicking off the year on a pretty solid footing. Aside from a few minor shifts in digital trends and shopping habits keeping things interesting, the market is playing it cool with record-low volatility.",
      events: [
        { title: "Digital Banking Campaign", text: "A major digital banking campaign stokes popularity among young customers. More people are opening online accounts.", impact: "Bank Stock +4% · Tech Stock +3%" },
        { title: "Shopping Festival", text: "A large shopping festival increases both online and offline purchases.", impact: "Consumer Stock +2%" }
      ]
    },
    {
      year: 2,
      title: "Geopolitical tensions stoke market anxiety",
      description: "After a calm starting year, the market reverses. Rising tensions stoke fears over vital shipping lanes, pushing oil prices up and stoking living costs.",
      events: [
        { title: "Escalating Tensions", text: "Escalating tensions stoke fears over vital shipping lanes. Oil prices stoke upward.", impact: "Energy Stock +9%" },
        { title: "Essential Inflation", text: "Spikes in fuel costs filter down to everyday essentials. Inflation rises and confidence fades.", impact: "Inflation +1.5% · Savings return +0.5%" },
        { title: "Consumer Caution", text: "Consumers start reducing spending on non-essential goods. Retail activity slows down.", impact: "Consumer Stock -2%" }
      ]
    },
    {
      year: 3,
      title: "A breath of fresh air",
      description: "After a difficult year, the market finally gets some room to breathe. Inflation pressure eases, policy support becomes clearer, and households start to feel less squeezed.",
      events: [
        { title: "New Economic Policy", text: "A new economic policy package stabilizes prices and stabilizes businesses, boosting confidence.", impact: "Other Stocks +2% · Savings return -1.5%" },
        { title: "Stable Budgets", text: "Food, fuel, and transportation prices become more stable.", impact: "Inflation -2%" },
        { title: "Brighter Business Outlook", text: "Hiring plans improve, delayed projects restart, and bonus expectations become positive.", impact: "Bank Stock +4% · Tech Stock +4%" }
      ]
    },
    {
      year: 4,
      title: "Global storms: Trade tensions rise",
      description: "After a year of recovery, the economy is running into serious trouble. Growing tensions make investors nervous and supply chains unpredictable.",
      events: [
        { title: "Trade Barriers", text: "Political conflicts between major powers stoke fears about slower trade and weaker demand.", impact: "Consumer Stock -7% · Other Stocks -5%" },
        { title: "Logistics Delays", text: "New restrictions and logistics delays make imported goods and raw materials much more expensive.", impact: "Inflation +2%" },
        { title: "Market Volatility", text: "Risk aversion moves money out of stocks and into safe bank savings.", impact: "Savings return +1.5%" }
      ]
    },
    {
      year: 5,
      title: "The calm after the storm: Markets bounce back",
      description: "Negotiations show progress. Trade barriers ease, global markets turn positive, and businesses enjoy a much more stable environment.",
      events: [
        { title: "Global Negotiations", text: "Talks between major blocs reduce uncertainty and stoke stock market buying.", impact: "All Stocks +3% · Savings return -0.5%" },
        { title: "Normalized Supply Chains", text: "Supply chains return to normal, lowering operating costs and production expenses.", impact: "Consumer Stock +2%" }
      ]
    }
  ];

  /* ──────────────────────────────────────────────────────────
     PUBLIC API
     ────────────────────────────────────────────────────────── */
  return {
    ROUNDS,
    HOUR_OPTIONS,
    SIDE_JOBS,
    SIDE_JOB_MH_MULTIPLIERS,
    SIDE_JOB_PH_MULTIPLIERS,
    BASE_EXPENSES,
    MIN_EXPENSES,
    BASE_RATIOS,
    MH_EXPENSE_COEFF,
    SAVINGS_TIERS,
    STOCKS,
    STOCK_PRICE_CHANGES,
    STOCK_TRADING_FEE,
    STOCK_SELL_TAX,
    QUINTILE_BREAKPOINTS,
    MH_MULTIPLIERS,
    PH_MULTIPLIERS,
    MH_WORK_COEFF,
    PH_WORK_COEFF,
    BASE_HEALTH_LOSS,
    HEALTHCARE_RECOVERY,
    HEALTH_THRESHOLDS,
    HEALTH_WARNING_EVENTS,
    SCORE_BENCHMARK,
    ARCHETYPES,
    LOSE_CONDITIONS,
    CHARACTER_SVGS,
    LIFE_EVENTS,
    MARKET_EVENTS,
    MARKET_EVENT_TREE,
    MARKET_PRICE_BOUNDS,
    SAVINGS_RATE_ADJUSTMENTS,
    RANDOM_EVENTS,
    JOB_REWARD_EVENTS,
    EXPENSE_PENALTY_EVENTS,

    // Functions
    getOTWage,
    getInsuranceFee,
    getSavingsRate,
    getSavingsTierLabel,
    getIncomeQuintile,
    getHealthcareRecovery,
    getHealthThreshold,
    getCharacterSVG,
    getBaseExpense,
    createInitialState,
    createRoundDecision,
  };

})();
