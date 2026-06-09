
// --- information screen rendering ---
  function renderInformationTab() {
    if (!state) return;
    const round = state.currentRound;
    const meta = GAME_DATA.ROUNDS[round - 1];

    // 1. Update round display in navigation
    const roundDisplay = document.getElementById('nav-round-display');
    if (roundDisplay) {
      roundDisplay.textContent = `Round ${round}`;
    }

    // 2. Character meta values
    const charName = document.getElementById('char-name-val');
    if (charName) charName.textContent = state.playerName;

    const charAge = document.getElementById('char-age-val');
    if (charAge) charAge.textContent = meta.age;

    const charJob = document.getElementById('char-job-val');
    if (charJob) charJob.textContent = meta.job;

    const charSalary = document.getElementById('char-salary-val');
    if (charSalary) {
      charSalary.textContent = UI.formatVND(meta.monthlySalary * 12) + " / year";
    }

    // 3. Avatar update
    const avatarEl = document.querySelector('.avatar-circle');
    if (avatarEl) {
      avatarEl.innerHTML = `<img src="assets/characters/Character_Round_${round}.svg" alt="Round ${round} Character">`;
    }

    // 4. Update stats (using UI.updateAllStats for animations/flashes)
    UI.updateAllStats({
      physical: state.stats.physicalHealth,
      mental: state.stats.mentalHealth,
      cash: state.stats.cash,
      investment: state.stats.investment
    }, {
      physFill: document.getElementById('char-phys-fill'),
      physLabel: document.getElementById('char-phys-val'),
      mentFill: document.getElementById('char-ment-fill'),
      mentLabel: document.getElementById('char-ment-val'),
      cashLabel: document.getElementById('char-cash-val'),
      investLabel: document.getElementById('char-invest-val')
    });

    // Also update bottom stat bar frozen numbers
    const barCash = document.getElementById('bar-cash-val');
    if (barCash) barCash.textContent = UI.formatVND(state.stats.cash);

    const barInvest = document.getElementById('bar-invest-val');
    if (barInvest) barInvest.textContent = UI.formatVND(state.stats.investment);

    const barPhys = document.getElementById('bar-phys-val');
    if (barPhys) barPhys.textContent = Math.round(state.stats.physicalHealth) + '%';

    const barMent = document.getElementById('bar-ment-val');
    if (barMent) barMent.textContent = Math.round(state.stats.mentalHealth) + '%';

    // 5. Render active personal events list
    renderPersonalEvents();

    // 6. Render market events
    renderMarketEvents(round);
  }


// --- decisions screen render entry point ---
  function renderDecisionsTab() {
    if (!state) return;
    const round = state.currentRound;

    // Update Spendable Cash
    const spendableCashVal = document.getElementById('decisions-spendable-cash-val');
    if (spendableCashVal) {
      spendableCashVal.textContent = UI.formatVND(state.stats.cash);
    }

    // 1. Build Income choices
    buildIncomeChoices(round);

    // 2. Build Expense choices
    buildExpenseChoices(round);

    // 3. Update Savings label and value
    const savingsRateLabel = document.getElementById('savings-rate-label');
    if (savingsRateLabel) {
      const balance = state.savingsBalance || 0;
      const rate = GAME_DATA.getSavingsRate(balance, round);
      const tier = GAME_DATA.getSavingsTierLabel(balance);
      savingsRateLabel.textContent = `Interest rate: ${(rate * 100).toFixed(2)}% / year (Tier: ${tier})`;
    }

    const savingsInput = document.getElementById('invest-savings-input');
    if (savingsInput) {
      savingsInput.placeholder = `Bal: ${state.savingsBalance.toLocaleString('vi-VN')} VND`;
    }

    // 4. Update Insurance Checkbox and Label
    const insuranceCheck = document.getElementById('invest-insurance-check');
    if (insuranceCheck) {
      insuranceCheck.checked = state.hasInsurance;
    }
    const insuranceFeeLabel = document.querySelector('.insurance-row__fee');
    if (insuranceFeeLabel) {
      insuranceFeeLabel.textContent = `Fee: ${UI.formatVND(GAME_DATA.getInsuranceFee(round))} / year`;
    }

    // 5. Build Stock table
    buildStockMarketTable();

    // 6. Attach Event Listeners
    attachIncomeListeners();
    attachExpenseListeners();
    attachStockListeners();

    // 7. Run initial live preview
    updateLivePreview();
  }


// --- round result visual header setup ---
  function renderRoundResult(roundNumber, isHistorical = false) {
    if (!state) return;
    
    // Outcome data
    const outcome = state.rounds[roundNumber - 1];
    if (!outcome) return;

    const income = outcome.income;
    const expense = outcome.expense;
    const netIncome = outcome.netIncome;
    const mhDelta = outcome.mhDelta;
    const phDelta = outcome.phDelta;
    const endStats = outcome.endStats;

    // Use saved portfolio and stock prices if available (historical), fallback to live
    const portfolio = outcome.portfolio || state.portfolio;
    const prices = outcome.prices || state.currentPrices;
    const savingsBalance = outcome.savingsBalance !== undefined ? outcome.savingsBalance : state.savingsBalance;

    // 1. Title & Subtitle
    const titleEl = document.getElementById('result-round-title');
    if (titleEl) titleEl.innerHTML = `ROUND ${roundNumber} RESULT<span style="font-style: italic;">!</span>`;
    
    const subtitleEl = document.getElementById('result-round-subtitle');
    if (subtitleEl) {
      const age = GAME_DATA.ROUNDS[roundNumber - 1].age;
      subtitleEl.textContent = `Year ${roundNumber} (Age ${age}) Summary`;
    }

    const avatarEl = document.getElementById('result-avatar-el');
    if (avatarEl) {
      avatarEl.innerHTML = `<img src="assets/characters/Character_Round_${roundNumber}.svg" alt="Round ${roundNumber} Character">`;
    }

  }
