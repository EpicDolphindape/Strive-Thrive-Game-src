// health (new).js
// Extracted updated expense, side-job, and health-related logic from health.js

function calcIncome({ monthlySalary, otHours, sideJob, sideJobHours, savingsBalance, round = 1, savingsRateAdjustment = 0 }) {
  const mainJobMonthly = monthlySalary;
  const mainJobAnnual  = mainJobMonthly * 12;

  const otWage         = GAME_DATA.getOTWage(monthlySalary);
  const otMonthly      = otWage * otHours;
  const otAnnual       = otMonthly * 12;

  const sideJobData    = GAME_DATA.SIDE_JOBS[sideJob] || GAME_DATA.SIDE_JOBS.none;
  const sideJobMonthly = sideJobData.wage * sideJobHours;
  const sideJobAnnual  = sideJobMonthly * 12;

  const savingsRate     = GAME_DATA.getSavingsRate(savingsBalance, round, savingsRateAdjustment);
  const savingsInterest = savingsBalance * savingsRate;

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

function calcMentalHealthDelta({
  totalMonthlyIncome,
  otHours,
  sideJob,
  sideJobHours,
  monthlyExpenses,
  round,
  eventEffect = 0,
}) {
  const quintile     = GAME_DATA.getIncomeQuintile(totalMonthlyIncome, round);
  const multiplier   = GAME_DATA.MH_MULTIPLIERS[quintile];
  const incomePenalty = GAME_DATA.BASE_HEALTH_LOSS * multiplier;

  const overtimePenalty = 5 * 0.048 * otHours;
  const mhJobMultiplier = GAME_DATA.SIDE_JOB_MH_MULTIPLIERS[sideJob || 'none'] || 0;
  const sideJobPenalty  = 5 * 0.048 * sideJobHours * mhJobMultiplier;
  const extraworkPenalty = overtimePenalty + sideJobPenalty;

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

  const totalDelta = -incomePenalty - extraworkPenalty + expenseEffect + eventEffect;

  return { incomePenalty, overtimePenalty, sideJobPenalty, extraworkPenalty, expenseEffect, eventEffect, totalDelta };
}

function calcPhysicalHealthDelta({
  totalMonthlyIncome,
  otHours,
  sideJob,
  sideJobHours,
  monthlyHealthcare,
  round,
  eventEffect = 0,
}) {
  const quintile      = GAME_DATA.getIncomeQuintile(totalMonthlyIncome, round);
  const multiplier    = GAME_DATA.PH_MULTIPLIERS[quintile];
  const incomePenalty = GAME_DATA.BASE_HEALTH_LOSS * multiplier;

  const overtimePenalty = 5 * 0.034 * otHours;
  const phJobMultiplier = GAME_DATA.SIDE_JOB_PH_MULTIPLIERS[sideJob || 'none'] || 0;
  const sideJobPenalty  = 5 * 0.034 * sideJobHours * phJobMultiplier;
  const extraworkPenalty = overtimePenalty + sideJobPenalty;

  const annualHealthcare = monthlyHealthcare * 12;
  const annualIncome     = totalMonthlyIncome * 12;
  const healthcareRecovery = GAME_DATA.getHealthcareRecovery(annualHealthcare, annualIncome);

  const totalDelta = -incomePenalty - extraworkPenalty + healthcareRecovery + eventEffect;

  return { incomePenalty, overtimePenalty, sideJobPenalty, extraworkPenalty, healthcareRecovery, eventEffect, totalDelta };
}

function applyRound(state, decisions, events = []) {
  const round   = state.currentRound;
  const meta    = GAME_DATA.ROUNDS[round - 1];

  const isUnconditionalEvent = (eventId) => {
    return true;
  };

  const eventCashTotal = events.reduce((s, e) => s + (e.cashImpact || 0), 0);
  const eventMHTotal   = events.reduce((s, e) => s + (e.mhImpact   || 0), 0);
  const eventPHTotal   = events.reduce((s, e) => s + (e.phImpact   || 0), 0);

  const startingCash = events.filter(e => isUnconditionalEvent(e.id)).reduce((s, e) => s + (e.cashImpact || 0), 0);
  const startingMH   = events.filter(e => isUnconditionalEvent(e.id)).reduce((s, e) => s + (e.mhImpact   || 0), 0);
  const startingPH   = events.filter(e => isUnconditionalEvent(e.id)).reduce((s, e) => s + (e.phImpact   || 0), 0);

  const incomeResult = calcIncome({
    monthlySalary:   meta.monthlySalary,
    otHours:         decisions.otHours,
    sideJob:         decisions.sideJob,
    sideJobHours:    decisions.sideJobHours,
    savingsBalance:  state.savingsBalance,
    round,
    savingsRateAdjustment: state.savingsRateAdjustment || 0,
  });

  const insuranceFee = state.hasInsurance ? GAME_DATA.getInsuranceFee(round) : 0;
  const expenseResult = calcExpenses(decisions.expenses, insuranceFee, state.inflationRate || 0);

  const netIncome = incomeResult.totalAnnual - expenseResult.totalAnnual + eventCashTotal;

  const mhDelta = calcMentalHealthDelta({
    totalMonthlyIncome: incomeResult.totalMonthly,
    otHours:            decisions.otHours,
    sideJob:            decisions.sideJob,
    sideJobHours:       decisions.sideJobHours,
    monthlyExpenses:    decisions.expenses,
    round,
    eventEffect:        eventMHTotal,
  });

  const phDelta = calcPhysicalHealthDelta({
    totalMonthlyIncome: incomeResult.totalMonthly,
    otHours:            decisions.otHours,
    sideJob:            decisions.sideJob,
    sideJobHours:       decisions.sideJobHours,
    monthlyHealthcare:  decisions.expenses.healthcare || 0,
    round,
    eventEffect:        eventPHTotal,
  });

  const mainJobAnnual = meta.monthlySalary * 12;
  const newCash     = state.stats.cash + netIncome - startingCash - mainJobAnnual + state.savingsBalance;
  const newPH       = Math.max(0, Math.min(100, state.stats.physicalHealth + phDelta.totalDelta - startingPH));
  const newMH       = Math.max(0, Math.min(100, state.stats.mentalHealth   + mhDelta.totalDelta - startingMH));

  let loseCondition = null;
  if (newCash <= 0)    loseCondition = 'cash';
  else if (newPH <= 0) loseCondition = 'physical';
  else if (newMH <= 0) loseCondition = 'mental';

  const newState = {
    ...state,
    currentRound: round + 1,
    savingsBalance: 0,
    stats: {
      cash:           newCash,
      investment:     state.stats.investment,
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
