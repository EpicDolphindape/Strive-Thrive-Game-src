
  function startRound(round) {
    if (!state) return;
    state.currentRound = round;
    
    // Initialize decisions for this round
    initRoundDecisions();
    
    // Roll start-of-round events
    rollRoundEvents(round);

    // Check starting health warnings and apply penalties/alerts
    checkStartingHealthWarnings();
    if (state.loseCondition) return; // If warning drops health to 0, checkStartingHealthWarnings handles game over
    
    // Render the Information tab
    renderInformationTab();
    
    // Show/hide historical Result tab based on round
    updateNavigationTabs();

    // Auto-save game state
    saveGame();
  }

  function initRoundDecisions() {
    if (!state) return;
    state.currentDecision = GAME_DATA.createRoundDecision(state.currentRound);
    
    // Carry over previous expenses if round > 1
    if (state.currentRound > 1) {
      const prevDecision = state.rounds[state.currentRound - 2]?.decisions;
      if (prevDecision && prevDecision.expenses) {
        state.currentDecision.expenses = { ...prevDecision.expenses };
      }
    }
  }


// --- persistence and round resolution core (source lines 1597-1665) ---
  function saveGame() {
    if (!state) return;
    try {
      localStorage.setItem('strive_thrive_save', JSON.stringify(state));
      console.log("Game state auto-saved.");
    } catch (e) {
      console.error("Failed to auto-save game state:", e);
    }
  }

  function clearSave() {
    try {
      localStorage.removeItem('strive_thrive_save');
      console.log("Game save cleared.");
    } catch (e) {
      console.error("Failed to clear game save:", e);
    }
  }

  function processRoundResults() {
    console.log("Processing round results...");
    
    // 1. Evaluate and roll conditional events based on final decisions
    const condEvents = evaluateConditionalEvents(state.currentRound, state.currentDecision, true);
    if (condEvents.length > 0) {
      state.activeEvents = [...(state.activeEvents || []), ...condEvents];
    }

    const mappedEvents = (state.activeEvents || []).map(e => ({
      id: e.id,
      text: e.text,
      tag: e.tag,
      cashImpact: e.impact.cash || 0,
      mhImpact: e.impact.mentalHealth || 0,
      phImpact: e.impact.physicalHealth || 0
    }));

    const result = HEALTH.applyRound(state, state.currentDecision, mappedEvents);
    state = result.newState;
    
    // Outcome round index is state.currentRound - 1
    const completedRound = state.currentRound - 1;

    // Update stock prices for the next round
    if (!state.loseCondition && state.currentRound <= 5) {
      state.currentPrices = HEALTH.updateStockPrices(state.currentPrices, completedRound);
      state.stats.investment = HEALTH.calcPortfolioValue(state.portfolio, state.currentPrices) + state.savingsBalance;
    }

    // 2. Save structural copy of portfolio, prices, and savings for history rendering
    const completedRoundIdx = completedRound - 1;
    if (state.rounds[completedRoundIdx]) {
      state.rounds[completedRoundIdx].portfolio = JSON.parse(JSON.stringify(state.portfolio));
      state.rounds[completedRoundIdx].prices = { ...state.currentPrices };
      state.rounds[completedRoundIdx].savingsBalance = state.savingsBalance;
      state.rounds[completedRoundIdx].hasInsurance = state.hasInsurance;
    }
    
    // Render and show results
    renderRoundResult(completedRound, false);
    UI.showScreen('screen-round-result', 'fade');

    // Auto-save game state
    saveGame();
  }

  // ----------------------------------------------------
  // INITIALIZATION
  // ----------------------------------------------------

