/** Event Rolling and Health Warning Logic*/

  function rollRoundEvents(round) {
    if (!state) return;
    const events = GAME_DATA.LIFE_EVENTS.filter(e => e.round === round);
    const rolled = [];
    
    events.forEach(e => {
      // Unconditional events have zero formal parameters (length === 0)
      const isUnconditional = !e.condition || e.condition.length === 0;
      if (isUnconditional) {
        if (Math.random() <= e.probability) {
          rolled.push(e);
        }
      }
    });
    
    state.activeEvents = rolled;

    // Apply starting events immediately to stats
    rolled.forEach(e => {
      if (e.impact) {
        if (e.impact.cash !== undefined) {
          state.stats.cash += e.impact.cash;
        }
        if (e.impact.physicalHealth !== undefined) {
          state.stats.physicalHealth = Math.max(0, Math.min(100, state.stats.physicalHealth + e.impact.physicalHealth));
        }
        if (e.impact.mentalHealth !== undefined) {
          state.stats.mentalHealth = Math.max(0, Math.min(100, state.stats.mentalHealth + e.impact.mentalHealth));
        }
      }
    });
  }

  /**
   * Evaluates conditional events for the current round.
   * If isRollTime is true, rolls for probabilistic conditional events (like side_job_tip).
   * Otherwise (live preview), only returns deterministic ones (probability = 1.0).
   */
  function evaluateConditionalEvents(round, decisions, isRollTime = false) {
    const events = GAME_DATA.LIFE_EVENTS.filter(e => e.round === round && e.condition && e.condition.length > 0);
    const triggered = [];
    events.forEach(e => {
      if (e.condition(decisions)) {
        if (isRollTime) {
          if (Math.random() <= e.probability) {
            triggered.push(e);
          }
        } else {
          if (e.probability === 1.0) {
            triggered.push(e);
          }
        }
      }
    });
    return triggered;
  }

  /**
   * Evaluates the starting health scores.
   * Subtracts penalties for ranges below 50% and logs them as event cards.
   * Displays alert toasts for the 50-60% range.
   */
  function checkStartingHealthWarnings() {
    if (!state) return;
    
    const ph = state.stats.physicalHealth;
    const mh = state.stats.mentalHealth;

    // 1. Check Physical Health Warning
    const phWarning = GAME_DATA.HEALTH_WARNING_EVENTS.physical.find(w => ph >= w.min && ph <= w.max);
    if (phWarning) {
      if (phWarning.penalty < 0) {
        state.stats.physicalHealth = Math.max(0, state.stats.physicalHealth + phWarning.penalty);
        state.activeEvents.push({
          id: 'health_warning_physical',
          text: phWarning.text,
          probability: 1.0,
          tag: 'negative',
          impact: { physicalHealth: phWarning.penalty }
        });
      } else {
        setTimeout(() => {
          UI.toast.warning(`Physical Health Warning: ${phWarning.text}`, { duration: 8000 });
        }, 600);
      }
    }

    // 2. Check Mental Health Warning
    const mhWarning = GAME_DATA.HEALTH_WARNING_EVENTS.mental.find(w => mh >= w.min && mh <= w.max);
    if (mhWarning) {
      if (mhWarning.penalty < 0) {
        state.stats.mentalHealth = Math.max(0, state.stats.mentalHealth + mhWarning.penalty);
        state.activeEvents.push({
          id: 'health_warning_mental',
          text: mhWarning.text,
          probability: 1.0,
          tag: 'negative',
          impact: { mentalHealth: mhWarning.penalty }
        });
      } else {
        setTimeout(() => {
          UI.toast.warning(`Mental Health Warning: ${mhWarning.text}`, { duration: 8000 });
        }, 1200);
      }
    }

    // Trigger immediate loss if health collapses from start-of-round penalties
    if (state.stats.physicalHealth <= 0) {
      state.loseCondition = 'physical';
    } else if (state.stats.mentalHealth <= 0) {
      state.loseCondition = 'mental';
    }

    if (state.loseCondition) {
      clearSave();
      renderLoseScreen();
      UI.showScreen('screen-game-lose', 'fade');
      UI.toast.danger(`Game Over: ${GAME_DATA.LOSE_CONDITIONS[state.loseCondition].label}!`);
    }
  }

