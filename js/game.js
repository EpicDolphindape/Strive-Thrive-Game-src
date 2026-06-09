/**
 * game.js
 * The main controller for Strive & Thrive.
 * Orchestrates the flow between screens, holds the global game state,
 * and ties together UI.js, HEALTH.js, and GAME_DATA.js.
 */

const GAME = (function() {
  
  // ----------------------------------------------------
  // GLOBAL STATE
  // ----------------------------------------------------
  let state = null; // Will hold the object created by GAME_DATA.createInitialState()
  let currentTourStep = 0;
  let inTutorialMode = false;

  const tutorialSteps = [
    {
      selector: '[data-tab="information"]',
      tab: 'information',
      title: "Information tab",
      text: "This is where you can view general information for current round, including character's information, stats, life events and market updates.",
      placement: 'bottom'
    },
    {
      selector: '.left-panel',
      tab: 'information',
      title: "Character's information panel & stats",
      text: "Character's information panel: The game will update character's background information for each round in this block, where you can retrieve input about age, main job's title, and yearly salary in order to make decisions.\n\nCharacter's stats: Four main stats will be displayed, revealing player's current state. This consists of cash balance, investment value, and two well-being-related stats of physical health and mental health. These will be later updated with every decision you make later on.",
      placement: 'right'
    },
    {
      selector: '.right-panel',
      tab: 'information',
      title: "Personal & Market information",
      text: "Personal information panel: Here you can view surprise life scenarios which can be either good or bad. Each event will immediately affect your character's stats, so be prepared for the unexpected!\n\nMarket information panel: Here you can view the overall market condition of the current round. Pay attention to these information since they will affect your later financial decisions related to investment.",
      placement: 'left'
    },
    {
      selector: '[data-tab="decisions"]',
      tab: 'decisions',
      title: "Decisions tab",
      text: "This is where you can make decision related to your character, which will eventually used to calculate the round result.",
      placement: 'bottom'
    },
    {
      selector: '.decision-panel',
      tab: 'decisions',
      title: "Make Decisions",
      text: "Inside this tab, you will need to make decisions including taking on additional jobs, adjusting living expenses, and allocating wealth to different investment options (savings, stock, and health insurance). After submitting your decisions, you will proceed to the result screen, displaying the outcomes of all of your previous choices. Good luck and have fun while playing!",
      placement: 'top'
    },
    {
      selector: '#btn-restart-game-nav',
      tab: 'decisions',
      title: "Restart button",
      text: "There will be a small restart button at the right upward corner of the screen in both information and decisions tab. This will allow you to start over the game.",
      placement: 'bottom'
    }
  ];

  // ----------------------------------------------------
  // HELPERS
  // ----------------------------------------------------
  function getRelativeRect(targetEl, parentEl) {
    const targetRect = targetEl.getBoundingClientRect();
    const parentRect = parentEl.getBoundingClientRect();
    
    return {
      top: targetRect.top - parentRect.top,
      left: targetRect.left - parentRect.left,
      width: targetRect.width,
      height: targetRect.height,
      bottom: targetRect.bottom - parentRect.top,
      right: targetRect.right - parentRect.left
    };
  }

  // ----------------------------------------------------
  // TUTORIAL TOUR MANAGEMENT
  // ----------------------------------------------------
  function startTutorialTour() {
    inTutorialMode = true;
    currentTourStep = 0;

    // Transition to main game screen first so elements render
    UI.showScreen('screen-main-game', 'slide-right');

    const gameLayout = document.querySelector('.game-layout');
    if (gameLayout) {
      gameLayout.style.filter = '';
      gameLayout.style.opacity = '';
    }

    // Reset overlay elements visibility
    const tourOverlay = document.getElementById('tutorial-tour-overlay');
    if (tourOverlay) {
      tourOverlay.style.display = 'block';
    }

    const highlightBox = document.getElementById('tutorial-highlight-box');
    if (highlightBox) highlightBox.style.display = '';

    const callout = document.getElementById('tutorial-callout');
    if (callout) callout.style.display = '';

    const slideHint = document.getElementById('tutorial-slide-hint');
    if (slideHint) {
      slideHint.style.display = '';
      slideHint.style.opacity = '1';
    }

    const startBtn = document.getElementById('tutorial-start-btn');
    if (startBtn) startBtn.style.display = 'none';

    // Show first step
    showTourStep(0);
  }

  function showTourStep(index) {
    currentTourStep = index;
    const step = tutorialSteps[index];
    if (!step) return;

    // 1. Trigger Tab Switch if needed
    const activeTab = UI.getActiveTab('#game-nav');
    if (step.tab !== activeTab) {
      UI.switchTab('#game-nav', step.tab);
      const infoTab = document.getElementById('tab-information');
      const decisionsTab = document.getElementById('tab-decisions');
      if (step.tab === 'information') {
        if (infoTab) infoTab.style.display = '';
        if (decisionsTab) decisionsTab.style.display = 'none';
      } else {
        if (infoTab) infoTab.style.display = 'none';
        if (decisionsTab) decisionsTab.style.display = '';
      }
    }

    // 2. Wait for layout rendering and reflow
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const parentEl = document.getElementById('screen-main-game');
        const targetEl = document.querySelector(step.selector);
        
        if (!parentEl || !targetEl) {
          console.error(`Tour step error: target or parent elements not found.`);
          return;
        }

        const parentRect = parentEl.getBoundingClientRect();
        const targetRect = getRelativeRect(targetEl, parentEl);

        // 3. Highlight box positioning
        const padding = 8;
        const highlightBox = document.getElementById('tutorial-highlight-box');
        if (highlightBox) {
          highlightBox.style.top = `${targetRect.top - padding}px`;
          highlightBox.style.left = `${targetRect.left - padding}px`;
          highlightBox.style.width = `${targetRect.width + padding * 2}px`;
          highlightBox.style.height = `${targetRect.height + padding * 2}px`;
        }

        // 4. Update text & retrieve callout dimensions
        const callout = document.getElementById('tutorial-callout');
        const titleEl = document.getElementById('tour-title');
        const textEl = document.getElementById('tour-text');
        
        if (titleEl) titleEl.textContent = step.title;
        if (textEl) textEl.textContent = step.text;

        if (callout) {
          // Reset arrow classes
          callout.className = 'tutorial-callout';

          // Temporarily move to calculate dimensions
          callout.style.left = '-9999px';
          callout.style.top = '-9999px';
          
          const calloutWidth = callout.offsetWidth;
          const calloutHeight = callout.offsetHeight;

          // Compute placement
          let calloutTop = 0;
          let calloutLeft = 0;
          let arrowClass = '';

          if (step.placement === 'right') {
            calloutTop = targetRect.top + (targetRect.height - calloutHeight) / 2;
            calloutLeft = targetRect.left + targetRect.width + 20;
            arrowClass = 'tutorial-callout--arrow-left';
          } else if (step.placement === 'left') {
            calloutTop = targetRect.top + (targetRect.height - calloutHeight) / 2;
            calloutLeft = targetRect.left - calloutWidth - 20;
            arrowClass = 'tutorial-callout--arrow-right';
          } else if (step.placement === 'bottom') {
            calloutTop = targetRect.top + targetRect.height + 20;
            calloutLeft = targetRect.left + (targetRect.width - calloutWidth) / 2;
            arrowClass = 'tutorial-callout--arrow-top';
          } else if (step.placement === 'top') {
            calloutTop = targetRect.top - calloutHeight - 20;
            calloutLeft = targetRect.left + (targetRect.width - calloutWidth) / 2;
            arrowClass = 'tutorial-callout--arrow-bottom';
          }

          // Bound within viewport/parent area
          const maxLeft = parentRect.width - calloutWidth - 16;
          const minLeft = 16;
          const maxTop = parentRect.height - calloutHeight - 16;
          const minTop = 16;

          calloutLeft = Math.max(minLeft, Math.min(maxLeft, calloutLeft));
          calloutTop = Math.max(minTop, Math.min(maxTop, calloutTop));

          // Set positions and arrows
          callout.classList.add(arrowClass);
          callout.style.top = `${calloutTop}px`;
          callout.style.left = `${calloutLeft}px`;
        }

        // 5. Update hint message
        const hintText = document.getElementById('tutorial-hint-text');
        if (hintText) {
          if (index === tutorialSteps.length - 1) {
            hintText.textContent = 'Click anywhere to reveal Game Start button';
          } else {
            hintText.textContent = 'Click anywhere to continue';
          }
        }
      });
    });
  }

  function revealStartButton() {
    // 1. Blur the game screen layout
    const gameLayout = document.querySelector('.game-layout');
    if (gameLayout) {
      gameLayout.style.transition = 'filter 0.6s ease, opacity 0.6s ease';
      gameLayout.style.filter = 'blur(8px) grayscale(0.2)';
    }

    // 2. Hide tour helper visuals
    const highlightBox = document.getElementById('tutorial-highlight-box');
    if (highlightBox) highlightBox.style.display = 'none';

    const callout = document.getElementById('tutorial-callout');
    if (callout) callout.style.display = 'none';

    const slideHint = document.getElementById('tutorial-slide-hint');
    if (slideHint) {
      slideHint.style.transition = 'opacity 0.3s ease';
      slideHint.style.opacity = '0';
      setTimeout(() => {
        slideHint.style.display = 'none';
      }, 300);
    }

    // 3. Premium fade-reveal of start button
    const startBtn = document.getElementById('tutorial-start-btn');
    if (startBtn) {
      startBtn.style.display = 'block';
      startBtn.style.opacity = '0';
      startBtn.style.transform = 'translate(-50%, -50%) scale(0.9)';
      startBtn.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      
      void startBtn.offsetWidth; // Reflow
      
      startBtn.style.opacity = '1';
      startBtn.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  }

  // ----------------------------------------------------
  // GAME ROUND MANAGEMENT & VIEW RENDERING
  // ----------------------------------------------------
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

  function buildIncomeChoices(round) {
    const meta = GAME_DATA.ROUNDS[round - 1];
    const grid = document.querySelector('.income-grid');
    if (!grid) return;

    // Check if work ban is active (Physical or Mental Health < 20)
    const hasWorkBan = state.stats.physicalHealth < 20 || state.stats.mentalHealth < 20;

    // Handle warning banner
    const panel = document.querySelector('.decision-panel');
    let banner = document.getElementById('health-work-ban-banner');
    if (hasWorkBan) {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'health-work-ban-banner';
        banner.className = 'event-card event-card--negative';
        banner.style.margin = '0 0 var(--space-4) 0';
        banner.innerHTML = `
          <div class="event-card__title">⚠️ Work Restriction Warning</div>
          <div class="event-card__description">Your physical or mental health is below 20%. You are not allowed to work Overtime or Side Jobs this year! Please focus on rest and recovery.</div>
        `;
        panel.prepend(banner);
      }
      // Reset decisions
      state.currentDecision.sideJob = 'none';
      state.currentDecision.sideJobHours = 0;
      state.currentDecision.otHours = 0;
    } else {
      if (banner) {
        banner.remove();
      }
    }

    const dec = state.currentDecision;

    // Main Job Row
    let html = `
      <!-- Main Job -->
      <div class="income-row income-row--full">
        <input type="checkbox" class="income-row__checkbox" id="job-main-check" checked disabled>
        <label class="income-row__label" for="job-main-check">${meta.job} (Main Job)</label>
        <span class="income-row__rate">${UI.formatVND(meta.monthlySalary)} / month</span>
        <div class="hours-selector">
          <button type="button" class="hours-btn" id="job-main-dec-btn" disabled>-</button>
          <span class="hours-display" id="job-main-hours-display">40 hours</span>
          <button type="button" class="hours-btn" id="job-main-inc-btn" disabled>+</button>
        </div>
      </div>
    `;

    // Render 4 side jobs
    const sideJobsKeys = ['tutor', 'freelancer', 'shipper', 'waiter'];
    sideJobsKeys.forEach(key => {
      const sj = GAME_DATA.SIDE_JOBS[key];
      const isActive = (dec.sideJob === sj.id);
      const hours = isActive ? dec.sideJobHours : 0;
      
      const isChecked = isActive && hours > 0;
      const decDisabled = hasWorkBan || !isChecked || hours <= 0;
      const incDisabled = hasWorkBan || hours >= 40;
      const checkDisabled = hasWorkBan;

      html += `
        <div class="income-row">
          <input type="checkbox" class="income-row__checkbox side-job-checkbox" id="job-${sj.id}-check" data-sidejob="${sj.id}" ${isChecked ? 'checked' : ''} ${checkDisabled ? 'disabled' : ''}>
          <label class="income-row__label" for="job-${sj.id}-check">${sj.label}</label>
          <span class="income-row__rate">${UI.formatVND(sj.wage)} / hour</span>
          <div class="hours-selector">
            <button type="button" class="hours-btn side-job-dec-btn" id="job-${sj.id}-dec-btn" data-sidejob="${sj.id}" ${decDisabled ? 'disabled' : ''}>-</button>
            <span class="hours-display" id="job-${sj.id}-hours-display">${hours} hours</span>
            <button type="button" class="hours-btn side-job-inc-btn" id="job-${sj.id}-inc-btn" data-sidejob="${sj.id}" ${incDisabled ? 'disabled' : ''}>+</button>
          </div>
        </div>
      `;
    });

    // Render Overtime row
    const otHours = dec.otHours || 0;
    const otChecked = otHours > 0;
    const otDecDisabled = hasWorkBan || !otChecked || otHours <= 0;
    const otIncDisabled = hasWorkBan || otHours >= 40;
    const otCheckDisabled = hasWorkBan;

    html += `
      <div class="income-row">
        <input type="checkbox" class="income-row__checkbox" id="job-ot-check" ${otChecked ? 'checked' : ''} ${otCheckDisabled ? 'disabled' : ''}>
        <label class="income-row__label" for="job-ot-check">Overtime (OT)</label>
        <span class="income-row__rate">${UI.formatVND(Math.round(GAME_DATA.getOTWage(meta.monthlySalary)))} / hour</span>
        <div class="hours-selector">
          <button type="button" class="hours-btn" id="job-ot-dec-btn" ${otDecDisabled ? 'disabled' : ''}>-</button>
          <span class="hours-display" id="job-ot-hours-display">${otHours} hours</span>
          <button type="button" class="hours-btn" id="job-ot-inc-btn" ${otIncDisabled ? 'disabled' : ''}>+</button>
        </div>
      </div>
    `;

    grid.innerHTML = html;

  }

  function buildExpenseChoices(round) {
    const tbody = document.getElementById('expense-tbody');
    if (!tbody) return;

    const EXPENSE_METADATA = {
      housing: { name: 'Housing', desc: 'Rent, mortgage, utilities' },
      utility: { name: 'Utility', desc: 'Electricity, water, internet, phone bills' },
      food: { name: 'Food', desc: 'Groceries and eating out' },
      transport: { name: 'Transport', desc: 'Travel and commuting expenses' },
      healthcare: { name: 'Healthcare', desc: 'Medicine, exercises, dental care' },
      entertainment: { name: 'Entertainment', desc: 'Social life, hobbies, relaxation' }
    };

    let html = '';
    const categories = ['housing', 'utility', 'food', 'transport', 'healthcare', 'entertainment'];

    categories.forEach(cat => {
      const meta = EXPENSE_METADATA[cat];
      
      // Get base cost: previous round's actual chosen expense, or default BASE_EXPENSES
      let baseCost = GAME_DATA.BASE_EXPENSES[cat];
      if (round > 1) {
        const prevDec = state.rounds[round - 2]?.decisions;
        if (prevDec && prevDec.expenses && prevDec.expenses[cat] !== undefined) {
          baseCost = prevDec.expenses[cat];
        }
      }

      const currentVal = state.currentDecision.expenses[cat];
      const displayVal = currentVal !== undefined ? currentVal.toLocaleString('vi-VN') : '';

      html += `
        <tr data-category="${cat}">
          <td class="cell-category"><span class="category-badge">${meta.name}</span></td>
          <td class="cell-desc">${meta.desc}</td>
          <td class="cell-base" style="text-align: right; white-space: nowrap;">${UI.formatVND(baseCost)}</td>
          <td class="cell-input">
            <input type="text" class="amount-input expense-input" id="exp-${cat}-input" data-category="${cat}" value="${displayVal}" placeholder="Amount...">
          </td>
          <td class="cell-action">
            <button class="btn btn--success btn--sm expense-enter-btn" data-category="${cat}">Enter</button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function buildStockMarketTable() {
    const table = document.querySelector('#stock-market-table tbody');
    if (!table) return;

    let html = '';
    const codes = ['BNK-V', 'TEC-F', 'CSM-M', 'REA-V', 'ENE-G'];

    codes.forEach(code => {
      const price = state.currentPrices[code];
      const pos = state.portfolio[code] || { quantity: 0, avgCost: 0 };
      const ownedText = pos.quantity > 0 
        ? `${pos.quantity} shares (Avg: ${UI.formatVND(Math.round(pos.avgCost))})` 
        : '0 shares';
      
      const safeId = code.toLowerCase().replace('-', '');

      html += `
        <tr data-code="${code}">
          <td class="stock-row__code">${code}</td>
          <td class="stock-row__price">${UI.formatVND(price)}/share</td>
          <td class="stock-row__owned" id="stock-${safeId}-owned">${ownedText}</td>
          <td style="text-align: center;">
            <input type="number" class="amount-input stock-qty-input" id="stock-${safeId}-qty" data-code="${code}" min="1" value="1" style="width: 80px; text-align: center;">
          </td>
          <td style="text-align: right;">
            <div class="stock-row__actions" style="justify-content: flex-end;">
              <button class="btn btn--success btn--sm stock-buy-btn" data-code="${code}">Buy</button>
              <button class="btn btn--danger btn--sm stock-sell-btn" data-code="${code}">Sell</button>
            </div>
          </td>
        </tr>
      `;
    });

    table.innerHTML = html;
  }

  function attachIncomeListeners() {
    const dec = state.currentDecision;

    // Side Job checkboxes
    const sideJobChecks = document.querySelectorAll('.side-job-checkbox');
    sideJobChecks.forEach(check => {
      check.addEventListener('change', () => {
        const sideJobId = check.dataset.sidejob;
        if (check.checked) {
          dec.sideJob = sideJobId;
          dec.sideJobHours = 10;
        } else {
          if (dec.sideJob === sideJobId) {
            dec.sideJob = 'none';
            dec.sideJobHours = 0;
          }
        }
        renderDecisionsTab();
      });
    });

    // Side Job decrement buttons
    const sideJobDecBtns = document.querySelectorAll('.side-job-dec-btn');
    sideJobDecBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sideJobId = btn.dataset.sidejob;
        if (dec.sideJob === sideJobId) {
          dec.sideJobHours = Math.max(0, dec.sideJobHours - 10);
          if (dec.sideJobHours === 0) {
            dec.sideJob = 'none';
          }
          renderDecisionsTab();
        }
      });
    });

    // Side Job increment buttons
    const sideJobIncBtns = document.querySelectorAll('.side-job-inc-btn');
    sideJobIncBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sideJobId = btn.dataset.sidejob;
        if (dec.sideJob !== sideJobId) {
          dec.sideJob = sideJobId;
          dec.sideJobHours = 10;
        } else {
          dec.sideJobHours = Math.min(40, dec.sideJobHours + 10);
        }
        renderDecisionsTab();
      });
    });

    // OT checkbox
    const otCheck = document.getElementById('job-ot-check');
    if (otCheck) {
      otCheck.addEventListener('change', () => {
        if (otCheck.checked) {
          if (dec.otHours === 0) {
            dec.otHours = 10;
          }
        } else {
          dec.otHours = 0;
        }
        renderDecisionsTab();
      });
    }

    // OT decrement button
    const otDecBtn = document.getElementById('job-ot-dec-btn');
    if (otDecBtn) {
      otDecBtn.addEventListener('click', () => {
        dec.otHours = Math.max(0, dec.otHours - 10);
        renderDecisionsTab();
      });
    }

    // OT increment button
    const otIncBtn = document.getElementById('job-ot-inc-btn');
    if (otIncBtn) {
      otIncBtn.addEventListener('click', () => {
        dec.otHours = Math.min(40, dec.otHours + 10);
        renderDecisionsTab();
      });
    }
  }

  function attachExpenseListeners() {
    const inputs = document.querySelectorAll('.expense-input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        let valStr = input.value.replace(/[^\d]/g, '');
        let val = parseInt(valStr) || 0;
        input.value = val > 0 ? val.toLocaleString('vi-VN') : '';
        
        const cat = input.dataset.category;
        state.currentDecision.expenses[cat] = val;
        updateLivePreview();
      });

      input.addEventListener('blur', () => {
        const cat = input.dataset.category;
        let valStr = input.value.replace(/[^\d]/g, '');
        let val = parseInt(valStr) || 0;
        state.currentDecision.expenses[cat] = val;
        updateLivePreview();
      });
    });

    const buttons = document.querySelectorAll('.expense-enter-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        const input = document.getElementById(`exp-${cat}-input`);
        if (input) {
          let valStr = input.value.replace(/[^\d]/g, '');
          let val = parseInt(valStr) || 0;
          state.currentDecision.expenses[cat] = val;
          const EXPENSE_NAMES = {
            housing: 'Housing', utility: 'Utility', food: 'Food',
            transport: 'Transport', healthcare: 'Healthcare', entertainment: 'Entertainment'
          };
          UI.toast.success(`Set budget for ${EXPENSE_NAMES[cat]} to ${UI.formatVND(val)}`);
          updateLivePreview();
        }
      });
    });
  }

  function attachStockListeners() {
    const buyBtns = document.querySelectorAll('.stock-buy-btn');
    buyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const safeId = code.toLowerCase().replace('-', '');
        const qtyInput = document.getElementById(`stock-${safeId}-qty`);
        if (!qtyInput) return;

        const qty = parseInt(qtyInput.value) || 0;
        if (qty <= 0) {
          UI.toast.warning("Please enter a valid quantity of shares to buy.");
          return;
        }

        const price = state.currentPrices[code];
        const cost = qty * price;
        const fee = cost * GAME_DATA.STOCK_TRADING_FEE;
        const totalCost = cost + fee;

        if (state.stats.cash < totalCost) {
          UI.toast.warning(`Not enough cash. Total needed: ${UI.formatVND(totalCost)} (including 0.15% fee).`);
          return;
        }

        state.stats.cash -= totalCost;
        const pos = state.portfolio[code] || { quantity: 0, avgCost: 0 };
        const newQty = pos.quantity + qty;
        const newAvgCost = ((pos.avgCost * pos.quantity) + cost) / newQty;

        state.portfolio[code] = {
          quantity: newQty,
          avgCost: newAvgCost
        };

        state.stats.investment = HEALTH.calcPortfolioValue(state.portfolio, state.currentPrices) + state.savingsBalance;

        UI.toast.success(`Successfully bought ${qty} shares of ${code} for ${UI.formatVND(cost)} (Fee: ${UI.formatVND(fee)}).`);
        renderDecisionsTab();
      });
    });

    const sellBtns = document.querySelectorAll('.stock-sell-btn');
    sellBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const safeId = code.toLowerCase().replace('-', '');
        const qtyInput = document.getElementById(`stock-${safeId}-qty`);
        if (!qtyInput) return;

        const qty = parseInt(qtyInput.value) || 0;
        if (qty <= 0) {
          UI.toast.warning("Please enter a valid quantity of shares to sell.");
          return;
        }

        const pos = state.portfolio[code] || { quantity: 0, avgCost: 0 };
        if (pos.quantity < qty) {
          UI.toast.warning(`You only own ${pos.quantity} shares of ${code}. Cannot sell ${qty} shares.`);
          return;
        }

        const price = state.currentPrices[code];
        const proceeds = qty * price;
        const fee = proceeds * GAME_DATA.STOCK_TRADING_FEE;
        const tax = proceeds * GAME_DATA.STOCK_SELL_TAX;
        const netGained = proceeds - fee - tax;

        state.stats.cash += netGained;
        const newQty = pos.quantity - qty;
        const newAvgCost = newQty === 0 ? 0 : pos.avgCost;

        state.portfolio[code] = {
          quantity: newQty,
          avgCost: newAvgCost
        };

        state.stats.investment = HEALTH.calcPortfolioValue(state.portfolio, state.currentPrices) + state.savingsBalance;

        UI.toast.success(`Successfully sold ${qty} shares of ${code} for ${UI.formatVND(proceeds)} (Fee: ${UI.formatVND(fee)}, Tax: ${UI.formatVND(tax)}).`);
        renderDecisionsTab();
      });
    });
  }

  function updateLivePreview() {
    if (!state) return;

    // Build base active events (unconditional + starting warnings)
    const mappedEvents = (state.activeEvents || []).map(e => ({
      id: e.id,
      text: e.text,
      tag: e.tag,
      cashImpact: e.impact.cash || 0,
      mhImpact: e.impact.mentalHealth || 0,
      phImpact: e.impact.physicalHealth || 0
    }));

    // Check for active deterministic conditional events in live preview
    const condEvents = evaluateConditionalEvents(state.currentRound, state.currentDecision, false);
    const condWarningTexts = [];
    condEvents.forEach(e => {
      mappedEvents.push({
        id: e.id,
        text: e.text,
        tag: e.tag,
        cashImpact: e.impact.cash || 0,
        mhImpact: e.impact.mentalHealth || 0,
        phImpact: e.impact.physicalHealth || 0
      });
      const impactStr = formatEventImpact(e.impact);
      const eventTitle = getEventTitle(e.id);
      condWarningTexts.push(`⚠️ Triggered: ${eventTitle} (${impactStr})`);
    });

    const result = HEALTH.applyRound(state, state.currentDecision, mappedEvents);
    const newState = result.newState;

    const barCash = document.getElementById('bar-cash-val');
    if (barCash) {
      const prev = state.stats.cash;
      const proj = newState.stats.cash;
      barCash.textContent = UI.formatVND(proj);
      updatePreviewLabelClass(barCash, proj, prev);
    }

    const barInvest = document.getElementById('bar-invest-val');
    if (barInvest) {
      const prev = state.stats.investment;
      const proj = newState.stats.investment;
      barInvest.textContent = UI.formatVND(proj);
      updatePreviewLabelClass(barInvest, proj, prev);
    }

    const barPhys = document.getElementById('bar-phys-val');
    if (barPhys) {
      const prev = state.stats.physicalHealth;
      const proj = newState.stats.physicalHealth;
      barPhys.textContent = `${Math.round(proj)}%`;
      updatePreviewLabelClass(barPhys, proj, prev);
    }

    const barMent = document.getElementById('bar-ment-val');
    if (barMent) {
      const prev = state.stats.mentalHealth;
      const proj = newState.stats.mentalHealth;
      barMent.textContent = `${Math.round(proj)}%`;
      updatePreviewLabelClass(barMent, proj, prev);
    }

    const summaryTitle = document.getElementById('income-summary-title');
    const summaryBox = document.getElementById('income-summary-box');
    if (summaryTitle) {
      const hours = state.currentDecision.otHours + state.currentDecision.sideJobHours;
      const phPenalty = GAME_DATA.PH_WORK_COEFF * hours;
      const mentPenalty = GAME_DATA.MH_WORK_COEFF * hours;
      
      let summaryText = '';
      if (hours > 0) {
        summaryText = `Extra Work: ${hours} hours/month · Projected work penalty: -${phPenalty.toFixed(1)} Physical, -${mentPenalty.toFixed(1)} Mental health`;
      } else {
        summaryText = "Summary: No extra work selected. No health penalties applied.";
      }

      if (condWarningTexts.length > 0) {
        summaryText += `<br><span style="color: var(--color-loss); font-weight: bold; display: block; margin-top: 4px;">${condWarningTexts.join('<br>')}</span>`;
      }
      
      summaryTitle.innerHTML = summaryText;
      if (summaryBox) summaryBox.classList.add('visible');
    }
  }

  function updatePreviewLabelClass(el, proj, prev) {
    el.classList.remove('preview-positive', 'preview-negative');
    if (proj > prev) {
      el.classList.add('preview-positive');
    } else if (proj < prev) {
      el.classList.add('preview-negative');
    }
  }

  function updateNavigationTabs() {
    const resultTab = document.getElementById('nav-result-tab');
    if (resultTab) {
      if (state && state.currentRound >= 2) {
        resultTab.style.display = 'inline-flex';
      } else {
        resultTab.style.display = 'none';
      }
    }
  }

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

    // 2. Investment Portfolio Calculations
    let totalCapital = 0;
    let totalMarketValue = 0;
    let roundReturn = 0;

    const codes = ['BNK-V', 'TEC-F', 'CSM-M', 'REA-V', 'ENE-G'];
    codes.forEach(code => {
      const pos = portfolio[code] || { quantity: 0, avgCost: 0 };
      totalCapital += pos.quantity * pos.avgCost;
      totalMarketValue += pos.quantity * prices[code];

      // Round return calculation
      const changes = GAME_DATA.STOCK_PRICE_CHANGES[roundNumber - 1];
      const changePct = changes[code] || 0;
      const priceBeforeChange = prices[code] / (1 + changePct);
      const priceDelta = prices[code] - priceBeforeChange;
      roundReturn += pos.quantity * priceDelta;
    });

    const cumulativeReturn = totalMarketValue - totalCapital;

    // Set portfolio header stats
    const capEl = document.getElementById('result-portfolio-capital');
    if (capEl) capEl.textContent = UI.formatVND(totalCapital);

    const mktEl = document.getElementById('result-portfolio-market');
    if (mktEl) mktEl.textContent = UI.formatVND(totalMarketValue);

    const rndRetEl = document.getElementById('result-portfolio-round-return');
    if (rndRetEl) {
      rndRetEl.textContent = (roundReturn >= 0 ? '+' : '') + UI.formatVND(roundReturn);
      rndRetEl.className = roundReturn > 0 ? 'num-gain' : (roundReturn < 0 ? 'num-loss' : 'num-neutral');
    }

    const cumRetEl = document.getElementById('result-portfolio-cumulative-return');
    if (cumRetEl) {
      cumRetEl.textContent = (cumulativeReturn >= 0 ? '+' : '') + UI.formatVND(cumulativeReturn);
      cumRetEl.className = cumulativeReturn > 0 ? 'num-gain' : (cumulativeReturn < 0 ? 'num-loss' : 'num-neutral');
    }

    // 3. Stock Portfolio Table
    const tbody = document.getElementById('result-stock-tbody');
    if (tbody) {
      let html = '';
      codes.forEach(code => {
        const pos = portfolio[code] || { quantity: 0, avgCost: 0 };
        const price = prices[code];
        const mktVal = pos.quantity * price;
        const gain = pos.quantity * (price - pos.avgCost);
        const gainPct = pos.avgCost > 0 ? (gain / (pos.quantity * pos.avgCost)) * 100 : 0;

        const gainText = pos.quantity > 0
          ? `${gain >= 0 ? '+' : ''}${UI.formatVND(gain)} (${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%)`
          : '-';
        const gainClass = pos.quantity > 0
          ? (gain > 0 ? 'num-gain' : (gain < 0 ? 'num-loss' : 'num-neutral'))
          : 'num-neutral';

        html += `
          <tr>
            <td><strong>${code}</strong></td>
            <td class="text-right">${pos.quantity}</td>
            <td class="text-right">${pos.quantity > 0 ? UI.formatVND(Math.round(pos.avgCost)) : '-'}</td>
            <td class="text-right">${UI.formatVND(price)}</td>
            <td class="text-right">${pos.quantity > 0 ? UI.formatVND(mktVal) : '-'}</td>
            <td class="text-right ${gainClass}">${gainText}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }

    // 4. Savings Account Table
    const savBalEl = document.getElementById('result-savings-balance');
    if (savBalEl) savBalEl.textContent = UI.formatVND(savingsBalance);

    const savRateEl = document.getElementById('result-savings-rate');
    if (savRateEl) {
      const rate = GAME_DATA.getSavingsRate(savingsBalance, roundNumber);
      const tier = GAME_DATA.getSavingsTierLabel(savingsBalance);
      savRateEl.textContent = `${(rate * 100).toFixed(2)}% / year (${tier})`;
    }

    const savIntEl = document.getElementById('result-savings-interest');
    if (savIntEl) {
      savIntEl.textContent = `+${UI.formatVND(income.savingsInterest)}`;
    }

    // 5. Financial Statements Table
    const eventCash = outcome.events.reduce((sum, e) => sum + (e.cashImpact || 0), 0);
    const totalIncome = income.totalAnnual + eventCash;

    // Income
    document.getElementById('result-income-main').textContent = UI.formatVND(income.mainJobAnnual);
    document.getElementById('result-income-side').textContent = UI.formatVND(income.sideJobAnnual);
    document.getElementById('result-income-ot').textContent = UI.formatVND(income.otAnnual);
    document.getElementById('result-income-interest').textContent = UI.formatVND(income.savingsInterest);
    
    const evCashEl = document.getElementById('result-income-events');
    evCashEl.textContent = (eventCash >= 0 ? '+' : '') + UI.formatVND(eventCash);
    evCashEl.className = eventCash > 0 ? 'num-gain' : (eventCash < 0 ? 'num-loss' : 'num-neutral');

    document.getElementById('result-income-total').textContent = UI.formatVND(totalIncome);

    // Expenses
    document.getElementById('result-expense-housing').textContent = UI.formatVND(expense.annual.housing);
    document.getElementById('result-expense-utility').textContent = UI.formatVND(expense.annual.utility);
    document.getElementById('result-expense-food').textContent = UI.formatVND(expense.annual.food);
    document.getElementById('result-expense-transport').textContent = UI.formatVND(expense.annual.transport);
    document.getElementById('result-expense-healthcare').textContent = UI.formatVND(expense.annual.healthcare);
    document.getElementById('result-expense-entertainment').textContent = UI.formatVND(expense.annual.entertainment);
    document.getElementById('result-expense-insurance').textContent = UI.formatVND(expense.annual.insurance);
    document.getElementById('result-expense-total').textContent = UI.formatVND(expense.totalAnnual);

    // Net and Balance
    const netIncEl = document.getElementById('result-net-income');
    netIncEl.textContent = (netIncome >= 0 ? '+' : '') + UI.formatVND(netIncome);
    netIncEl.className = netIncome > 0 ? 'num-gain' : (netIncome < 0 ? 'num-loss' : 'num-neutral');

    document.getElementById('result-cash-balance').textContent = UI.formatVND(endStats.cash);
    document.getElementById('result-net-worth').textContent = UI.formatVND(endStats.cash + endStats.investment);

    // 6. Well-being Summary
    // Physical
    const physValEl = document.getElementById('result-phys-val');
    if (physValEl) physValEl.textContent = `${Math.round(endStats.physicalHealth)}%`;
    
    const physChgEl = document.getElementById('result-phys-change');
    if (physChgEl) {
      const delta = phDelta.totalDelta;
      physChgEl.textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
      physChgEl.className = delta > 0 ? 'text-gain text-small' : (delta < 0 ? 'text-loss text-small' : 'text-muted text-small');
    }
    
    const physFillEl = document.getElementById('result-phys-fill');
    if (physFillEl) physFillEl.style.width = `${endStats.physicalHealth}%`;

    // Mental
    const mentValEl = document.getElementById('result-ment-val');
    if (mentValEl) mentValEl.textContent = `${Math.round(endStats.mentalHealth)}%`;
    
    const mentChgEl = document.getElementById('result-ment-change');
    if (mentChgEl) {
      const delta = mhDelta.totalDelta;
      mentChgEl.textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
      mentChgEl.className = delta > 0 ? 'text-gain text-small' : (delta < 0 ? 'text-loss text-small' : 'text-muted text-small');
    }
    
    const mentFillEl = document.getElementById('result-ment-fill');
    if (mentFillEl) mentFillEl.style.width = `${endStats.mentalHealth}%`;

    // 6.5 Render detailed list of events that occurred
    const eventsCard = document.getElementById('result-events-card');
    const eventsList = document.getElementById('result-events-list');
    if (eventsCard && eventsList) {
      eventsCard.style.display = 'block';
      const roundEvents = outcome.events || [];
      if (roundEvents.length === 0) {
        eventsList.innerHTML = `
          <div class="event-card event-card--neutral" style="margin: 0; padding: var(--space-2);">
            <div class="event-card__title" style="font-size: var(--font-size-sm);">Peaceful Year</div>
            <div class="event-card__description" style="font-size: var(--font-size-xs); line-height: 1.4;">No major personal events occurred this year.</div>
          </div>
        `;
      } else {
        eventsList.innerHTML = '';
        roundEvents.forEach(e => {
          const card = document.createElement('div');
          card.className = `event-card event-card--${e.tag || 'neutral'}`;
          card.style.margin = '0';
          card.style.padding = 'var(--space-2)';
          
          const title = document.createElement('div');
          title.className = 'event-card__title';
          title.style.fontSize = 'var(--font-size-sm)';
          title.textContent = getEventTitle(e.id);
          
          const desc = document.createElement('div');
          desc.className = 'event-card__description';
          desc.style.fontSize = 'var(--font-size-xs)';
          desc.style.lineHeight = '1.4';
          desc.textContent = e.text;
          
          const impactEl = document.createElement('div');
          impactEl.className = 'event-card__impact';
          impactEl.style.fontSize = 'var(--font-size-xs)';
          impactEl.style.fontWeight = 'bold';
          
          const parts = [];
          if (e.cashImpact !== 0) {
            const sign = e.cashImpact > 0 ? "+" : "";
            parts.push(`${sign}${UI.formatVND(e.cashImpact)}`);
          }
          if (e.phImpact !== 0) {
            const sign = e.phImpact > 0 ? "+" : "";
            parts.push(`${sign}${e.phImpact}% Physical Health`);
          }
          if (e.mhImpact !== 0) {
            const sign = e.mhImpact > 0 ? "+" : "";
            parts.push(`${sign}${e.mhImpact}% Mental Health`);
          }
          impactEl.textContent = `Impact: ${parts.length > 0 ? parts.join(" · ") : "None"}`;
          
          card.appendChild(title);
          card.appendChild(desc);
          card.appendChild(impactEl);
          eventsList.appendChild(card);
        });
      }
    }

    // 7. Configure next button label and state
    const nextBtn = document.getElementById('btn-result-next');
    if (nextBtn) {
      nextBtn.dataset.isHistorical = isHistorical ? 'true' : 'false';
      if (isHistorical) {
        nextBtn.textContent = 'Back to Game';
      } else {
        if (state.loseCondition) {
          nextBtn.textContent = 'View Game Over';
        } else if (state.currentRound > 5) {
          nextBtn.textContent = 'Finish Simulation';
        } else {
          nextBtn.textContent = `Next Round (Round ${state.currentRound})`;
        }
      }
    }
  }

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
  function init() {
    console.log("Strive & Thrive Engine Initialized.");

    // Check for saved simulation in LocalStorage
    const saved = localStorage.getItem('strive_thrive_save');
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        if (savedState && savedState.playerName) {
          UI.showConfirm({
            title: "Resume Simulation?",
            body: `We found a saved simulation for character "${savedState.playerName}" at Year ${savedState.currentRound}. Would you like to resume?`,
            confirmText: "Resume",
            cancelText: "Start Fresh",
            onConfirm: () => {
              state = savedState;
              
              // Restore character name values
              const charNameVal = document.getElementById('char-name-val');
              if (charNameVal) charNameVal.textContent = state.playerName;
              
              // Hide tour overlay
              inTutorialMode = false;
              const tourOverlay = document.getElementById('tutorial-tour-overlay');
              if (tourOverlay) tourOverlay.style.display = 'none';

              const gameLayout = document.querySelector('.game-layout');
              if (gameLayout) {
                gameLayout.style.filter = '';
                gameLayout.style.opacity = '';
              }

              // Route to the appropriate screen
              if (state.loseCondition) {
                renderLoseScreen();
                UI.showScreen('screen-game-lose', 'fade');
              } else if (state.currentRound > 5) {
                renderWinScreen();
                UI.showScreen('screen-game-win', 'fade');
              } else {
                renderInformationTab();
                updateNavigationTabs();
                UI.switchTab('#game-nav', 'information');
                const infoTab = document.getElementById('tab-information');
                const decisionsTab = document.getElementById('tab-decisions');
                if (infoTab) infoTab.style.display = '';
                if (decisionsTab) decisionsTab.style.display = 'none';
                UI.showScreen('screen-main-game', 'fade');
              }
              UI.toast.success(`Simulation resumed for ${state.playerName}.`);
            },
            onCancel: () => {
              clearSave();
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse saved game state:", e);
        clearSave();
      }
    }
    
    // Setup Nav Tabs Callback
    UI.initNavBar('#game-nav', (tabId) => {
      const infoTab = document.getElementById('tab-information');
      const decisionsTab = document.getElementById('tab-decisions');
      if (tabId === 'information') {
        if (infoTab) infoTab.style.display = '';
        if (decisionsTab) decisionsTab.style.display = 'none';
        renderInformationTab();
      } else if (tabId === 'decisions') {
        if (infoTab) infoTab.style.display = 'none';
        if (decisionsTab) decisionsTab.style.display = '';
        renderDecisionsTab();
      } else if (tabId === 'result') {
        // Go to historical results screen
        renderRoundResult(state.currentRound - 1, true);
        UI.showScreen('screen-round-result', 'fade');
        // Instantly toggle nav bar tab selection back to information
        UI.switchTab('#game-nav', 'information');
        if (infoTab) infoTab.style.display = '';
        if (decisionsTab) decisionsTab.style.display = 'none';
      }
    });

    // Starting Screen -> Static Tutorial Screen
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        UI.showScreen('screen-tutorial', 'slide-right');
      });
    }

    // Static Tutorial Screen -> Live Tour Overlay over Main Game UI
    const tutorialNextBtn = document.getElementById('btn-tutorial-next');
    if (tutorialNextBtn) {
      tutorialNextBtn.addEventListener('click', () => {
        startTutorialTour();
      });
    }

    // Tour overlay click handler (except for startBtn itself)
    const tourOverlay = document.getElementById('tutorial-tour-overlay');
    if (tourOverlay) {
      tourOverlay.addEventListener('click', (e) => {
        // Double-click/text-selection protection
        if (e.detail > 1) return;
        if (window.getSelection().toString() !== '') return;

        // Skip if startBtn is active (clicks on it are handled by its own listener)
        const startBtn = document.getElementById('tutorial-start-btn');
        if (startBtn && startBtn.style.display !== 'none' && startBtn.style.display !== '') {
          return;
        }

        if (currentTourStep === tutorialSteps.length - 1) {
          revealStartButton();
          return;
        }

        showTourStep(currentTourStep + 1);
      });
    }

    // Game Start button inside overlay -> Name Input Screen
    const tourStartBtn = document.getElementById('tutorial-start-btn');
    if (tourStartBtn) {
      tourStartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        UI.showScreen('screen-name-input', 'slide-right');
      });
    }

    // Name input confirmation -> Initialize and start game
    const nameConfirmBtn = document.getElementById('btn-name-confirm');
    const nameInput = document.getElementById('player-name-input');
    if (nameConfirmBtn && nameInput) {
      nameConfirmBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
          UI.toast.warning("Please enter a character name.");
          return;
        }

        // Initialize state
        state = GAME_DATA.createInitialState(name);

        // Update UI name
        const charNameVal = document.getElementById('char-name-val');
        if (charNameVal) charNameVal.textContent = state.playerName;

        // Reset blur and hide tutorial tour elements
        inTutorialMode = false;
        const tourOverlay = document.getElementById('tutorial-tour-overlay');
        if (tourOverlay) tourOverlay.style.display = 'none';

        const gameLayout = document.querySelector('.game-layout');
        if (gameLayout) {
          gameLayout.style.filter = '';
          gameLayout.style.opacity = '';
        }

        // Switch back to Information tab (real gameplay begins)
        UI.switchTab('#game-nav', 'information');
        const infoTab = document.getElementById('tab-information');
        const decisionsTab = document.getElementById('tab-decisions');
        if (infoTab) infoTab.style.display = '';
        if (decisionsTab) decisionsTab.style.display = 'none';

        // Start Round 1
        startRound(1);

        UI.showScreen('screen-main-game', 'slide-right');
        UI.toast.success(`Welcome, ${name}! Let's start Strive & Thrive.`);
      });
    }

    // Savings deposit / withdrawal listener registration
    const savingsInput = document.getElementById('invest-savings-input');
    const savingsBtn = document.getElementById('invest-savings-btn');
    const savingsWithdrawBtn = document.getElementById('invest-savings-withdraw-btn');
    if (savingsInput && savingsBtn && savingsWithdrawBtn) {
      savingsInput.addEventListener('blur', () => {
        const rawVal = savingsInput.value.replace(/[^\d]/g, '');
        const val = parseInt(rawVal) || 0;
        savingsInput.value = val !== 0 ? val.toLocaleString('vi-VN') : '';
      });

      savingsBtn.addEventListener('click', () => {
        const rawVal = savingsInput.value.replace(/[^\d]/g, '');
        const amount = parseInt(rawVal) || 0;
        if (amount <= 0) {
          UI.toast.warning("Please enter a valid deposit amount.");
          return;
        }

        if (state.stats.cash < amount) {
          UI.toast.warning("Not enough cash to deposit this amount.");
          return;
        }
        state.stats.cash -= amount;
        state.savingsBalance += amount;
        UI.toast.success(`Deposited ${UI.formatVND(amount)} to savings account.`);

        state.stats.investment = HEALTH.calcPortfolioValue(state.portfolio, state.currentPrices) + state.savingsBalance;
        savingsInput.value = '';
        renderDecisionsTab();
      });

      savingsWithdrawBtn.addEventListener('click', () => {
        const rawVal = savingsInput.value.replace(/[^\d]/g, '');
        const amount = parseInt(rawVal) || 0;
        if (amount <= 0) {
          UI.toast.warning("Please enter a valid withdrawal amount.");
          return;
        }

        if (state.savingsBalance < amount) {
          UI.toast.warning("Not enough savings balance to withdraw this amount.");
          return;
        }
        state.savingsBalance -= amount;
        state.stats.cash += amount;
        UI.toast.success(`Withdrew ${UI.formatVND(amount)} from savings account.`);

        state.stats.investment = HEALTH.calcPortfolioValue(state.portfolio, state.currentPrices) + state.savingsBalance;
        savingsInput.value = '';
        renderDecisionsTab();
      });
    }

    // Health Insurance purchase listener registration
    const insuranceCheck = document.getElementById('invest-insurance-check');
    if (insuranceCheck) {
      insuranceCheck.addEventListener('change', () => {
        state.hasInsurance = insuranceCheck.checked;
        updateLivePreview();
      });
    }

    // Final confirm button listener registration
    const confirmBtn = document.getElementById('btn-confirm-decisions');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const categories = ['housing', 'utility', 'food', 'transport', 'healthcare', 'entertainment'];
        for (const cat of categories) {
          const val = state.currentDecision.expenses[cat];
          if (val === undefined || isNaN(val) || val < 0) {
            UI.toast.warning(`Please enter a valid amount for ${cat}.`);
            const input = document.getElementById(`exp-${cat}-input`);
            if (input) {
              input.focus();
              input.classList.add('flash-negative');
              setTimeout(() => input.classList.remove('flash-negative'), 800);
            }
            return;
          }
        }

        const dec = state.currentDecision;
        const sideJobName = dec.sideJob !== 'none' ? GAME_DATA.SIDE_JOBS[dec.sideJob].label : 'None';
        const sideJobHours = dec.sideJob !== 'none' ? `${dec.sideJobHours}h/month` : '0h';
        const otHours = dec.otHours > 0 ? `${dec.otHours}h/month` : '0h';
        
        let totalExpense = 0;
        categories.forEach(cat => totalExpense += dec.expenses[cat]);
        const insuranceCost = state.hasInsurance ? GAME_DATA.getInsuranceFee(state.currentRound) : 0;

        const details = `
          • Main Job: ${GAME_DATA.ROUNDS[state.currentRound - 1].job} (Full-time)
          • Side Job: ${sideJobName} (${sideJobHours})
          • Overtime: ${otHours}
          • Total Budgeted Expenses: ${UI.formatVND(totalExpense)}
          • Health Insurance Cost: ${state.hasInsurance ? UI.formatVND(insuranceCost) : 'None'}
          • Savings Account Balance: ${UI.formatVND(state.savingsBalance)}
        `;

        UI.showConfirm({
          title: "Confirm Your Choices?",
          body: `Please review your decisions for Year ${state.currentRound}:${details}\nReady to progress to the next year?`,
          confirmText: "Confirm",
          cancelText: "Cancel",
            onConfirm: () => {
            UI.toast.success("Decisions confirmed! Processing round results...");
            processRoundResults();
          }
        });
      });
    }

    // Results screen Next Round button click listener
    const resultNextBtn = document.getElementById('btn-result-next');
    if (resultNextBtn) {
      resultNextBtn.addEventListener('click', () => {
        const isHistorical = resultNextBtn.dataset.isHistorical === 'true';
        if (isHistorical) {
          // Go back to main game screen
          UI.showScreen('screen-main-game', 'fade');
        } else {
          // Check lose condition
          if (state.loseCondition) {
            UI.toast.danger(`Game Over: ${GAME_DATA.LOSE_CONDITIONS[state.loseCondition].label}!`);
            renderLoseScreen();
            UI.showScreen('screen-game-lose', 'fade');
          } else if (state.currentRound > 5) {
            UI.toast.success("Simulation complete! Loading win screen...");
            renderWinScreen();
            UI.showScreen('screen-game-win', 'fade');
          } else {
            // Proceed to next round
            startRound(state.currentRound);
            UI.switchTab('#game-nav', 'information');
            const infoTab = document.getElementById('tab-information');
            const decisionsTab = document.getElementById('tab-decisions');
            if (infoTab) infoTab.style.display = '';
            if (decisionsTab) decisionsTab.style.display = 'none';
            UI.showScreen('screen-main-game', 'fade');
            UI.toast.success(`Welcome to Round ${state.currentRound}!`);
          }
        }
      });
    }

    // Restart button in win screen
    const winRestartBtn = document.getElementById('btn-win-restart');
    if (winRestartBtn) {
      winRestartBtn.addEventListener('click', () => {
        clearSave();
        location.reload();
      });
    }

    // Restart button in lose screen
    const loseRestartBtn = document.getElementById('btn-lose-restart');
    if (loseRestartBtn) {
      loseRestartBtn.addEventListener('click', () => {
        clearSave();
        location.reload();
      });
    }

    // Restart game from navigation
    const restartNavBtn = document.getElementById('btn-restart-game-nav');
    if (restartNavBtn) {
      restartNavBtn.addEventListener('click', () => {
        UI.showConfirm({
          title: "Restart Simulation?",
          body: "Are you sure you want to restart the simulation? All current progress will be lost.",
          confirmText: "Restart",
          cancelText: "Cancel",
          onConfirm: () => {
            clearSave();
            location.reload();
          }
        });
      });
    }
  }

  // ----------------------------------------------------
  // PUBLIC API
  // ----------------------------------------------------
  return {
    init,
    getState: () => state,
    setState: (newState) => { state = newState; }
  };

})();

// Boot up the game when the DOM is ready
document.addEventListener('DOMContentLoaded', GAME.init);
