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
    none:       { id: 'none',       label: 'No side job',  wage: 0 },
    waiter:     { id: 'waiter',     label: 'Waiter',        wage: 38_299 },
    shipper:    { id: 'shipper',    label: 'Shipper',       wage: 59_226 },
    tutor:      { id: 'tutor',      label: 'Tutor',         wage: 137_924 },
    freelancer: { id: 'freelancer', label: 'Freelancer',   wage: 157_785 },
  };

  /* ──────────────────────────────────────────────────────────
     EXPENSE CATEGORIES
     ────────────────────────────────────────────────────────── */

  /**
   * Base monthly expense values (VND).
   * In round > 1, "base" shown to player is previous round's actual.
   */
  const BASE_EXPENSES = {
    healthcare:    3_000_000,
    entertainment: 3_000_000,
    housing:         960_000,
    food:            800_000,
    utility:         500_000,
    transport:       500_000,
  };

  /** Base ratios used in MH expense formula (base / 15,000,000) */
  const BASE_RATIOS = {
    healthcare:    3_000_000 / 15_000_000,   // 0.2
    entertainment: 3_000_000 / 15_000_000,   // 0.2
    housing:         960_000 / 15_000_000,   // 0.064
    food:            800_000 / 15_000_000,   // 0.0533
    utility:         500_000 / 15_000_000,   // 0.0333
    transport:       500_000 / 15_000_000,   // 0.0333
  };

  /** Mental health expense formula coefficients */
  const MH_EXPENSE_COEFF = {
    healthcare:    0.33,
    entertainment: 0.23,
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
  function getSavingsRate(balance, round = 1) {
    const adjustment = getSavingsRateAdjustment(round);
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
  const QUINTILE_BREAKPOINTS = [
    // Round 1
    [17_270_000, 18_700_000, 19_920_000, 21_310_000],
    // Round 2
    [22_670_000, 24_400_000, 25_840_000, 27_560_000],
    // Round 3
    [28_080_000, 30_100_000, 31_750_000, 33_810_000],
    // Round 4
    [38_890_000, 41_520_000, 43_720_000, 46_380_000],
    // Round 5
    [49_710_000, 52_940_000, 55_690_000, 59_080_000],
  ];

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
  const MH_WORK_COEFF = 0.078;
  const PH_WORK_COEFF = 0.054;

  /** Base health loss applied to all quintiles before multiplier */
  const BASE_HEALTH_LOSS = 8;

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
      { min: 50, max: 60, text: "You’ve been feeling quite stressed lately, and you keep wishing you could leave work just a little earlier. Maybe it’s time to slow down and give yourself some space to heal.", penalty: 0 },
      { min: 40, max: 49, text: "You visit a mental health professional after weeks of stress and poor sleep. The doctor told that you’re showing signs of anxiety.", penalty: -2 },
      { min: 30, max: 39, text: "You feel exhausted before the day even starts. A check-up suggests early burnout from long-term work stress.", penalty: -5 },
      { min: 20, max: 29, text: "You often have trouble sleeping, lose your appetite, and feels frustrated all the time. The doctor said you're having severe signs of depression.", penalty: -7 },
      { min: 1, max: 19, text: "You're constantly anxious and stressed as hell. Your boss knows this and insists on asking you to quit your job to improve your health.", penalty: -10 }
    ],
    physical: [
      { min: 50, max: 60, text: "You’ve been getting occasional headaches lately, and you’ve been going to bed later than usual. Please remember to get some rest.", penalty: 0 },
      { min: 40, max: 49, text: "You've been having trouble sleeping and often feel exhausted by the end of the day. Your neck and shoulders have also started aching.", penalty: -2 },
      { min: 30, max: 39, text: "You faint at work because of acute stomach pain. The doctor says your lifestyle and diet are clearly not okay.", penalty: -5 },
      { min: 20, max: 29, text: "You end up in the hospital again. This time, the doctor says your body is exhausted and your immune system is struggling.", penalty: -7 },
      { min: 1, max: 19, text: "You are hospitalized because of a heart attack. The doctor is furious because you ignored every warning and kept neglecting your health.", penalty: -10 }
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
      stats: {
        cash:           0,
        investment:     5_000_000,
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
      savingsBalance: 5_000_000,
      hasInsurance:   false,
      // Current stock prices (updated each round)
      currentPrices: {
        'BNK-V': 60_000,
        'TEC-F': 70_000,
        'CSM-M': 80_000,
        'REA-V': 150_000,
        'ENE-G': 80_000,
      },
      loseCondition: null, // 'cash' | 'physical' | 'mental' | null
    };
  }

  /** Expense template for a single round */
  function createRoundDecision(round) {
    const meta = ROUNDS[round - 1];
    return {
      round,
      // Income choices
      otHours: 0,
      sideJob: 'none',
      sideJobHours: 0,
      // Expense choices (monthly, VND)
      expenses: { ...BASE_EXPENSES },
      // Investment choices handled via portfolio + savingsBalance
    };
  }

  /* ──────────────────────────────────────────────────────────
     LIFE EVENTS
     ────────────────────────────────────────────────────────── */
  const LIFE_EVENTS = [
    // Round 1
    {
      id: 'reward_parents',
      round: 1,
      text: "You receive a performance reward from your parents for graduating with an excellent degree.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { cash: 20000000, mentalHealth: 5 }
    },
    {
      id: 'summer_retreat',
      round: 1,
      text: "Your manager organized a one-week summer retreat for the whole department. The retreat resort also has the greatest massage service!",
      probability: 0.10,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5, physicalHealth: 2 }
    },
    {
      id: 'learn_chinese',
      round: 1,
      text: "You decided to self-study Chinese, which is your long-time favorite language, and you're absolutely loving it.",
      probability: 0.40,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5 }
    },
    {
      id: 'wedding_decline',
      round: 1,
      text: "A close friend invites you to be a bridesmaid/groomsman and attend a wedding. However, you are too busy with your work so you decline your friend's invitation.",
      probability: 0.10,
      condition: () => true,
      tag: 'negative',
      impact: { mentalHealth: -3 }
    },
    {
      id: 'food_poisoning',
      round: 1,
      text: "You ordered a lunch that was cheap and delicious from a post on Threads. Unfortunately, you got food poisoning and ended up spending your entire weekend in the hospital T_T.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -2000000 }
    },
    // Round 2
    {
      id: 'police_pull_over',
      round: 2,
      text: "In a moment of distraction while driving, you forgot to use your turn signal and got pulled over by the traffic police. That's how your food budget for the weekend gone away.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -1000000 }
    },
    {
      id: 'chinese_friend',
      round: 2,
      text: "You met a really interesting friend while learning Chinese. The two of you gradually became close, and you can see yourself improving day by day.",
      probability: 0.30,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 10 }
    },
    {
      id: 'laptop_broke',
      round: 2,
      text: "Oh no, the laptop that has been with you for 6 years just broke down. You have no choice but to buy a new one.",
      probability: 1.00,
      condition: (decision) => decision.otHours >= 30,
      tag: 'negative',
      impact: { cash: -20000000 }
    },
    {
      id: 'grandfather_hospital',
      round: 2,
      text: "You heard that your grandfather was hospitalized with atherosclerosis. You sent some money to help your parents with the medical bills and went to the hospital to visit him.",
      probability: 0.30,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -10000000, mentalHealth: -10 }
    },
    {
      id: 'side_job_tip',
      round: 2,
      text: "You performed well at your side job. Your customer was so satisfied so they tipped you!",
      probability: 0.20,
      condition: (decision) => decision.sideJob !== 'none',
      tag: 'positive',
      impact: { cash: 5000000 }
    },
    // Round 3
    {
      id: 'closed_contract_china',
      round: 3,
      text: "Thanks to the Chinese skills you have been building over the past two years, you successfully closed a contract with a company in China. You and your teammate are even sponsored for a trip to Shanghai.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 7 }
    },
    {
      id: 'insomnia',
      round: 3,
      text: "Your career is clearly on the rise, but so is your workload. The pressure starts affecting your sleep, and you develop mild insomnia.",
      probability: 1.00,
      condition: (decision) => (decision.sideJobHours + decision.otHours) >= 40,
      tag: 'negative',
      impact: { physicalHealth: -3 }
    },
    {
      id: 'grandfather_passed',
      round: 3,
      text: "After a year of medical treatment, your grandfather passes away. His departure leaves you deeply saddened.",
      probability: 0.50,
      condition: () => true,
      tag: 'negative',
      impact: { mentalHealth: -7 }
    },
    {
      id: 'bavi_trip',
      round: 3,
      text: "To cheer you up after your family's loss, your colleagues decide to fund you a weekend trip to the famous resort in Ba Vì.",
      probability: 1.00,
      condition: (decision) => decision.otHours > 0,
      tag: 'positive',
      impact: { mentalHealth: 3 }
    },
    {
      id: 'neck_massager',
      round: 3,
      text: "During a company health workshop, you joined the lucky draw with no hope. To your surprise, you won a high-quality neck and shoulder massager, perfectly saving your aching back.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { physicalHealth: 3 }
    },
    {
      id: 'netflix_trial',
      round: 3,
      text: "You accidentally signed up for a 7-day free trial of Netflix account and completely forgot about it. You only realized after 2 months but your bank account already deducted money.",
      probability: 0.10,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -460000 }
    },
    // Round 4
    {
      id: 'fomo_weddings',
      round: 4,
      text: "You are invited to two weddings of your high school friends. You are genuinely happy for them, but you also feel a little FOMO as people around you start to form their family.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -4000000 }
    },
    {
      id: 'projects_reward',
      round: 4,
      text: "You are assigned two more important company projects. Your boss immediately gave you a big reward for your contribution.",
      probability: 0.30,
      condition: () => true,
      tag: 'positive',
      impact: { cash: 10000000 }
    },
    {
      id: 'situationship_cheat',
      round: 4,
      text: "You got cheated on because the person in a situationship with you secretly texted 2 more people. You ended your relationship but still felt heartbroken.",
      probability: 0.10,
      condition: () => true,
      tag: 'negative',
      impact: { mentalHealth: -15 }
    },
    {
      id: 'famous_entrepreneur',
      round: 4,
      text: "During a casual coffee outing, you unexpectedly meet a famous entrepreneur you have admired for a long time. The two of you have a pleasant conversation, and you leave feeling incredibly motivated.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5 }
    },
    {
      id: 'lottery_win',
      round: 4,
      text: "YOU WON THE LOTTERY! The prize reaches 200,000,000 VND.",
      probability: 0.01,
      condition: () => true,
      tag: 'positive',
      impact: { cash: 200000000, mentalHealth: 20 }
    },
    {
      id: 'lost_report',
      round: 4,
      text: "Your report was lost because you forgot to save it. You had to stay up all night to redo it. Don't make this mistake again!",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { mentalHealth: -2, physicalHealth: -2 }
    },
    // Round 5
    {
      id: 'parents_trip',
      round: 5,
      text: "Your parents officially retire. To celebrate, the whole family takes a trip to Phu Quoc, and you find yourself deeply cherishing those moments together.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { cash: -10000000, mentalHealth: 5 }
    },
    {
      id: 'motorbike_fall',
      round: 5,
      text: "You fall off your motorbike on the way to work. The injury is not too serious, but you still need a full week of rest.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -5000000, physicalHealth: -5 }
    },
    {
      id: 'online_scam',
      round: 5,
      text: "You fall for an online scam. Luckily, the amount lost is not too large, but it is definitely a lesson to be more careful next time.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -2000000, mentalHealth: -5 }
    },
    {
      id: 'tiktok_viral',
      round: 5,
      text: "A random video you post on TikTok suddenly goes viral. You keep posting, and after a year, your account grows to over 50,000 followers.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5 }
    },
    {
      id: 'volunteer_local',
      round: 5,
      text: "You sign up for a local volunteer activity. It is tiring, but the experience feels meaningful and leaves you surprisingly happy.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5 }
    }
  ];

  /* ──────────────────────────────────────────────────────────
     MARKET EVENTS
     ────────────────────────────────────────────────────────── */
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
    BASE_EXPENSES,
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
    SAVINGS_RATE_ADJUSTMENTS,

    // Functions
    getOTWage,
    getInsuranceFee,
    getSavingsRate,
    getSavingsTierLabel,
    getIncomeQuintile,
    getHealthcareRecovery,
    getHealthThreshold,
    getCharacterSVG,
    createInitialState,
    createRoundDecision,
  };

})();
