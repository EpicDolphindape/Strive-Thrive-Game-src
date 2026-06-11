// data (new).js
// Extracted updated side-job, savings, income quintile, and health constants from data (2).js

const SIDE_JOB_MH_MULTIPLIERS = {
  none:       0.0,
  adviser:    1.00,
  tutor:      1.03,
  bookkeeper: 1.04,
  blogger:    1.14,
};

const SIDE_JOB_PH_MULTIPLIERS = {
  none:       0.0,
  adviser:    1.00,
  bookkeeper: 1.03,
  blogger:    1.10,
  tutor:      1.11,
};

const BASE_RATIOS = {
  healthcare:    0.0533,
  entertainment: 0.3,
  housing:       0.25,
  food:          0.17,
  utility:       0.0467,
  transport:     0.0333,
};

const MH_EXPENSE_COEFF = {
  healthcare:    -0.33,
  entertainment: -0.23,
  housing:        1.00,
  food:           0.64,
  utility:        0.27,
  transport:      0.15,
};

const SAVINGS_RATE_ADJUSTMENTS = [0, 0.005, -0.015, 0.015, -0.005];

function getSavingsRateAdjustment(round) {
  let total = 0;
  for (let r = 1; r <= round; r++) {
    total += SAVINGS_RATE_ADJUSTMENTS[Math.min(r - 1, 4)];
  }
  return total;
}

function getSavingsRate(balance, round = 1, savingsRateAdjustment = 0) {
  const adjustment = (arguments.length >= 3) ? savingsRateAdjustment : getSavingsRateAdjustment(round);
  for (const tier of SAVINGS_TIERS) {
    if (balance >= tier.minBalance && balance <= tier.maxBalance) {
      return Math.max(0, tier.rate + adjustment);
    }
  }
  return 0; // below minimum
}

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

    for (const ot of HOUR_OPTIONS) {
      incomes.push(monthlySalary + otWage * ot);
    }

    for (const jobKey of activeSideJobs) {
      const jobData = SIDE_JOBS[jobKey];
      const jobWage = jobData.wage;
      for (const ot of HOUR_OPTIONS) {
        for (const sh of sideJobHoursOptions) {
          incomes.push(monthlySalary + otWage * ot + jobWage * sh);
        }
      }
    }

    incomes.sort((a, b) => a - b);
    const b1 = Math.round((incomes[16] + incomes[17]) / 2);
    const b2 = Math.round((incomes[33] + incomes[34]) / 2);
    const b3 = Math.round((incomes[50] + incomes[51]) / 2);
    const b4 = Math.round((incomes[67] + incomes[68]) / 2);
    breakpoints.push([b1, b2, b3, b4]);
  }

  return breakpoints;
})();

function getIncomeQuintile(monthlyIncome, round) {
  const breaks = QUINTILE_BREAKPOINTS[round - 1];
  if (monthlyIncome <= breaks[0]) return 1;
  if (monthlyIncome <= breaks[1]) return 2;
  if (monthlyIncome <= breaks[2]) return 3;
  if (monthlyIncome <= breaks[3]) return 4;
  return 5;
}

const MH_WORK_COEFF = 0.048;
const PH_WORK_COEFF = 0.034;
const BASE_HEALTH_LOSS = 5;
