//Game setup ---
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

// Income and health system 
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


// --- score benchmark constant (source lines 297-297) ---
  const SCORE_BENCHMARK = 47.36;

