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

// --- personal and market event ---
  function renderPersonalEvents() {
    const listEl = document.getElementById('personal-events-list');
    if (!listEl) return;

    if (!state.activeEvents || state.activeEvents.length === 0) {
      listEl.innerHTML = `
        <div class="event-card event-card--neutral">
          <div class="event-card__title">Peaceful Year</div>
          <div class="event-card__description">No major personal events occurred this year. Stay focused on your goals!</div>
          <div class="event-card__impact">Impact: None</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    state.activeEvents.forEach(e => {
      const card = document.createElement('div');
      card.className = `event-card event-card--${e.tag || 'neutral'}`;
      
      const title = document.createElement('div');
      title.className = 'event-card__title';
      title.textContent = getEventTitle(e.id);
      
      const desc = document.createElement('div');
      desc.className = 'event-card__description';
      desc.textContent = e.text;
      
      const impactEl = document.createElement('div');
      impactEl.className = 'event-card__impact';
      impactEl.textContent = `Impact: ${formatEventImpact(e.impact)}`;
      
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(impactEl);
      listEl.appendChild(card);
    });
  }

  function getEventTitle(id) {
    const titles = {
      reward_parents: "Reward from Parents",
      summer_retreat: "Summer Retreat",
      learn_chinese: "Language Learning",
      wedding_decline: "Wedding Invitation",
      food_poisoning: "Food Poisoning",
      police_pull_over: "Traffic Ticket",
      chinese_friend: "New Friend",
      laptop_broke: "Equipment Failure",
      grandfather_hospital: "Family Emergency",
      side_job_tip: "Customer Tip",
      closed_contract_china: "Business Success",
      insomnia: "Health Issue",
      grandfather_passed: "Family Loss",
      bavi_trip: "Weekend Getaway",
      neck_massager: "Lucky Draw",
      netflix_trial: "Subscription Charge",
      fomo_weddings: "Social Life",
      projects_reward: "Project Bonus",
      situationship_cheat: "Relationship Issue",
      famous_entrepreneur: "Inspirational Meeting",
      lottery_win: "Lottery Winner!",
      lost_report: "Work Mishap",
      parents_trip: "Family Celebration",
      motorbike_fall: "Accident",
      online_scam: "Financial Scam",
      tiktok_viral: "Social Media Fame",
      volunteer_local: "Community Service",
      health_warning_physical: "Physical Health Warning",
      health_warning_mental: "Mental Health Warning"
    };
    return titles[id] || id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function formatEventImpact(impact) {
    if (!impact) return "None";
    const parts = [];
    if (impact.cash !== undefined && impact.cash !== 0) {
      const sign = impact.cash > 0 ? "+" : "";
      parts.push(`${sign}${UI.formatVND(impact.cash)}`);
    }
    if (impact.physicalHealth !== undefined && impact.physicalHealth !== 0) {
      const sign = impact.physicalHealth > 0 ? "+" : "";
      parts.push(`${sign}${impact.physicalHealth} Physical Health`);
    }
    if (impact.mentalHealth !== undefined && impact.mentalHealth !== 0) {
      const sign = impact.mentalHealth > 0 ? "+" : "";
      parts.push(`${sign}${impact.mentalHealth} Mental Health`);
    }
    return parts.length > 0 ? parts.join(" · ") : "None";
  }

  function renderMarketEvents(round) {
    const container = document.getElementById('market-events-list');
    if (!container) return;

    const data = GAME_DATA.MARKET_EVENTS[round - 1];
    if (!data) {
      container.innerHTML = `<div class="market-text"><p>No market information available.</p></div>`;
      return;
    }

    const age = GAME_DATA.ROUNDS[round - 1].age;
    
    let html = `
      <div class="market-text">
        <p class="market-year-title">Year ${round} (Age ${age}): ${data.title}</p>
        <p class="market-year-description" style="margin-bottom: var(--space-3); color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.5;">
          ${data.description}
        </p>
    `;

    data.events.forEach(subEvent => {
      html += `
        <div class="market-event-item" style="margin-bottom: var(--space-3);">
          <strong>${subEvent.title}:</strong> ${subEvent.text}
          <div class="market-event-impact" style="margin-top: 4px; font-size: var(--font-size-xs); color: var(--color-primary); font-weight: 500;">
            ${subEvent.impact}
          </div>
        </div>
      `;
    });

    const balance = state.savingsBalance || 0;
    const rate = GAME_DATA.getSavingsRate(balance, round);
    const tier = GAME_DATA.getSavingsTierLabel(balance);
    
    html += `
        <div class="market-event-item" style="border-top: 1px solid var(--color-border); padding-top: var(--space-2); margin-top: var(--space-3);">
          <strong>Bank Savings Rates:</strong> Current savings rate is <strong>${(rate * 100).toFixed(2)}% / year</strong> (Tier: ${tier}).
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">
            Base rate for Normal tier is 6.5%.
          </div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  }

  // ----------------------------------------------------
  // DECISIONS TAB RENDERING & TRANSACTION LOGIC
  // ----------------------------------------------------

// --- end result feedback screens ---
  function renderLoseScreen() {
    if (!state || !state.loseCondition) return;
    
    const cond = state.loseCondition;
    const meta = GAME_DATA.LOSE_CONDITIONS[cond];
    
    const badgeImg = document.getElementById('lose-badge-img');
    if (badgeImg) badgeImg.src = meta.badgeFile;
    
    const descEl = document.getElementById('lose-desc');
    if (descEl) {
      if (cond === 'cash') {
        descEl.innerHTML = `Your <strong>Cash</strong> has dropped below 0 (now your wallet is just a decorative object)`;
      } else if (cond === 'physical') {
        descEl.innerHTML = `Your <strong>Physical Health score</strong> has dropped below 0 <em>(now you are waiting for your turn to reincarnate)</em>`;
      } else if (cond === 'mental') {
        descEl.innerHTML = `Your <strong>Mental Health score</strong> has dropped below 0 <em>(now you are depressed and preferred to be a stone)</em>`;
      }
    }
  }

  function renderWinScreen() {
    if (!state) return;
    
    const finalScore = HEALTH.calcFinalScore(state.stats);
    
    const badgeImg = document.getElementById('win-badge-img');
    if (badgeImg) badgeImg.src = finalScore.badgeFile;
    
    const pillArchetype = document.getElementById('win-pill-archetype');
    if (pillArchetype) pillArchetype.textContent = finalScore.archetype?.label || 'Steady Builder';
    
    const pillStyle = document.getElementById('win-pill-style');
    if (pillStyle) pillStyle.textContent = finalScore.label2;
    
    const pillBalance = document.getElementById('win-pill-balance');
    if (pillBalance) pillBalance.textContent = finalScore.label3;
    
    const networthVal = document.getElementById('win-networth-val');
    if (networthVal) networthVal.textContent = UI.formatVND(finalScore.netWorth);
    
    const cashVal = document.getElementById('win-cash-val');
    if (cashVal) cashVal.textContent = UI.formatVND(state.stats.cash);
    
    const investVal = document.getElementById('win-invest-val');
    if (investVal) investVal.textContent = UI.formatVND(state.stats.investment);
    
    const finScore = document.getElementById('win-fin-score');
    if (finScore) finScore.textContent = finalScore.netWorthScore + '/100';
    
    const physVal = document.getElementById('win-phys-val');
    if (physVal) physVal.textContent = Math.round(state.stats.physicalHealth) + '%';
    const physFill = document.getElementById('win-phys-fill');
    if (physFill) physFill.style.width = state.stats.physicalHealth + '%';
    
    const mentVal = document.getElementById('win-ment-val');
    if (mentVal) mentVal.textContent = Math.round(state.stats.mentalHealth) + '%';
    const mentFill = document.getElementById('win-ment-fill');
    if (mentFill) mentFill.style.width = state.stats.mentalHealth + '%';
    
    const wbScore = document.getElementById('win-wb-score');
    if (wbScore) wbScore.textContent = finalScore.wellbeingScore + '/100';
    
    const totalScore = document.getElementById('win-total-score');
    if (totalScore) totalScore.textContent = finalScore.totalScore;
    
    // Inject archetype comments
    const descArchetype = document.getElementById('win-desc-archetype');
    if (descArchetype) {
      const archId = finalScore.archetype?.id || 'steady_builder';
      let archText = '';
      if (archId === 'balanced_achiever') {
        archText = `<strong>Balanced Achiever:</strong> From this day forward, you shall be known as the Master of Work-Life Balance - a mythical warrior capable of earning money, sleeping 8 hours, and replying "I'm doing fine" without lying.`;
      } else if (archId === 'burnout_rich') {
        archText = `<strong>Burnout Rich:</strong> Quick quiz, do you know what is bigger than the Eiffel Tower? Surprise, it's your wallet! Wait, do you know what is even bigger than your wallet? More surprise, it's your emotional damage!`;
      } else if (archId === 'no_pain_no_gain') {
        archText = `<strong>No Gain — No Pain:</strong> Stress avoided. Risk avoided. You are so loyal with your comfort mode that even the game is asking, "Are we still playing or just on a vacation?"`;
      } else if (archId === 'broke_and_choked') {
        archText = `<strong>Broke & Choked:</strong> Your wallet is empty, your stress bar is full, and life keeps throwing random events like it has a personal problem with you. At this point, making it to next month deserves its own achievement badge.`;
      } else {
        archText = `<strong>Steady Builder:</strong> No huge wins, no tragic collapse, just slow progress and responsible choices. Basically you have become that calm NPC who somehow owns a house and gives boring but correct advice.`;
      }
      descArchetype.innerHTML = archText;
    }

    // Inject style comments
    const descStyle = document.getElementById('win-desc-style');
    if (descStyle) {
      const styleId = finalScore.label2;
      let styleText = '';
      if (styleId === 'Finance-led') {
        styleText = `<strong>Finance-led:</strong> Congratulations! Your bank account is glowing. Good, because now, you can use that money to pay your hospital bill due to overwork.`;
      } else if (styleId === 'Well-being-led') {
        styleText = `<strong>Well-being-led:</strong> You have inner peace, stable emotions, and decent posture. Sadly, none of those can pay rent.`;
      } else {
        styleText = `<strong>Aligned:</strong> Somehow, you have reached a very rare, balanced ending. The character paid bills, stayed alive, and did not spiral emotionally. Either you are a genius, or the game forgot to punish you.`;
      }
      descStyle.innerHTML = styleText;
    }

    // Inject balance comments
    const descBalance = document.getElementById('win-desc-balance');
    if (descBalance) {
      const healthGap = Math.abs(state.stats.physicalHealth - state.stats.mentalHealth);
      let balText = '';
      if (healthGap < 15) {
        balText = `<strong>Health Aligned:</strong> Mind and body are finally synchronized. Both are doing well. Not thriving, not collapsing, just two coworkers surviving the same shift.`;
      } else if (healthGap < 25) {
        balText = `<strong>Slightly Health Imbalanced:</strong> The body is complaining a bit louder than the mind, or the mind is carrying harder than the body. Either way, the warning signs are politely knocking on the door.`;
      } else {
        if (state.stats.physicalHealth > state.stats.mentalHealth) {
          balText = `<strong>Health Imbalanced (Physical-heavy):</strong> Physically, your body is built to survive the zombie apocalypse, but emotionally, you are one bad day away from joining the zombies voluntarily.`;
        } else {
          balText = `<strong>Health Imbalanced (Mental-heavy):</strong> The mindset is giving main-character energy, while the body is giving NPC with back pain and three hours of sleep.`;
        }
      }
      descBalance.innerHTML = balText;
    }

    const comparison = document.getElementById('win-score-comparison');
    if (comparison) {
      const isAbove = finalScore.aboveBenchmark;
      const benchmarkText = GAME_DATA.SCORE_BENCHMARK;
      if (isAbove) {
        comparison.style.borderLeftColor = 'var(--color-green)';
        comparison.innerHTML = `🌟 <strong>Excellent Play!</strong> Your score of <strong>${finalScore.totalScore}</strong> is above the benchmark score of <strong>${benchmarkText}</strong>. You managed to successfully balance financial growth with physical and mental health!`;
      } else {
        comparison.style.borderLeftColor = 'var(--color-amber)';
        comparison.innerHTML = `💪 <strong>Good Effort!</strong> Your score of <strong>${finalScore.totalScore}</strong> is below the benchmark score of <strong>${benchmarkText}</strong>. Try playing again to find an even better balance between work, life, and investment!`;
      }
    }
  }


