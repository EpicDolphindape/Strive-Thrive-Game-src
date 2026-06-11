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
      text: "<p><strong>Character's information panel:</strong> The game will update character's background information for each round in this block, where you can retrieve input about age, main job's title, and yearly salary in order to make decisions.</p><p><strong>Character's stats:</strong> Four main stats will be displayed, revealing player's current state. This consists of cash balance, investment value, and two well-being-related stats of physical health and mental health. These will be later updated with every decision you make later on.</p>",
      placement: 'right'
    },
    {
      selector: '.right-panel',
      tab: 'information',
      title: "Personal & Market information",
      text: "<p><strong>Personal information panel:</strong> Here you can view surprise life scenarios which can be either good or bad. Each event will immediately affect your character's stats, so be prepared for the unexpected!</p><p><strong>Market information panel:</strong> Here you can view the overall market condition of the current round. Pay attention to these information since they will affect your later financial decisions related to investment.</p>",
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
        if (textEl) textEl.innerHTML = step.text;

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
    state.screen = 'main-game';
    
    state.savingsOpening = state.savingsBalance;
    state.stockPurchases = 0;
    state.stockSells = 0;
    
    // Initialize decisions for this round
    initRoundDecisions();
    
    // Add main job annual salary for the round to player's cash
    const meta = GAME_DATA.ROUNDS[round - 1];
    state.stats.cash += meta.monthlySalary * 12;
    
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
  }

  function rollRoundEvents(round) {
    if (!state) return;
    const rolled = [];

    // Check if critical health work restrictions are active
    const isCritical = state.stats.physicalHealth < 20 || state.stats.mentalHealth < 20;

    if (isCritical) {
      // "Ở level này thì các event liên quan đến job, expense và cả random event đều ko hiện nữa"
      state.activeEvents = rolled;
      return;
    }

    // 1. Job-Reward Events
    let jobRewardEvent = null;
    if (round > 1) {
      const prevDec = state.rounds[round - 2]?.decisions;
      const prevOT = prevDec ? (prevDec.otHours || 0) : 0;
      if (prevOT > 0) {
        let triggerProb = 0;
        if (prevOT === 10) triggerProb = 0.20;
        else if (prevOT === 20) triggerProb = 0.50;
        else if (prevOT === 30) triggerProb = 0.80;
        else if (prevOT === 40) triggerProb = 1.0;

        if (Math.random() <= triggerProb) {
          let tier = 'minor';
          const r = Math.random();
          if (prevOT === 10) {
            tier = r <= 0.70 ? 'minor' : 'moderate';
          } else if (prevOT === 20) {
            tier = r <= 0.50 ? 'minor' : 'moderate';
          } else if (prevOT === 30) {
            tier = r <= 0.50 ? 'moderate' : 'major';
          } else if (prevOT === 40) {
            tier = r <= 0.70 ? 'major' : 'exceptional';
          }

          const roundRewardEvents = GAME_DATA.JOB_REWARD_EVENTS[round];
          if (roundRewardEvents && roundRewardEvents[tier]) {
            jobRewardEvent = roundRewardEvents[tier];
            rolled.push(jobRewardEvent);
          }
        }
      }
    }

    // 2. Random Events

    // Lưu ID random event đã xuất hiện trong toàn bộ lượt chơi.
    // Thuộc state nên tự động được lưu qua localStorage.
    if (!Array.isArray(state.usedRandomEventIds)) {
      state.usedRandomEventIds = [];
    }

    const usedRandomEventIds = new Set(state.usedRandomEventIds);

    // Mỗi round chỉ có 2 hoặc 3 RANDOM events.
    // Job reward không chiếm slot random event.
    const requestedRandomCount = Math.random() < 0.5 ? 2 : 3;

    // Nếu gần hết event thì chỉ roll số event còn lại.
    const remainingRandomCount = GAME_DATA.RANDOM_EVENTS.filter(
      e => !usedRandomEventIds.has(e.id)
    ).length;

    const numRandomToRoll = Math.min(
      requestedRandomCount,
      remainingRandomCount
    );

    let rolledRandomCount = 0;
    let attempts = 0;

    while (rolledRandomCount < numRandomToRoll && attempts < 100) {
      attempts++;

      // 45% positive, 55% negative
      const tag = Math.random() <= 0.45
        ? 'positive'
        : 'negative';

      // Chọn rarity
      const rarityRoll = Math.random();
      let rarity = 'common';

      if (rarityRoll <= 0.50) rarity = 'common';
      else if (rarityRoll <= 0.75) rarity = 'uncommon';
      else if (rarityRoll <= 0.90) rarity = 'rare';
      else if (rarityRoll <= 0.98) rarity = 'very_rare';
      else rarity = 'ultra_rare';

      // Loại toàn bộ event đã xuất hiện ở các round trước
      const matches = GAME_DATA.RANDOM_EVENTS.filter(e =>
        e.tag === tag &&
        e.rarity === rarity &&
        !usedRandomEventIds.has(e.id)
      );

      if (matches.length === 0) continue;

      // Weighted random
      const totalWeight = matches.reduce(
        (sum, e) => sum + e.weight,
        0
      );

      let randomWeight = Math.random() * totalWeight;
      let selectedEvent = matches[0];

      for (const event of matches) {
        randomWeight -= event.weight;

        if (randomWeight <= 0) {
          selectedEvent = event;
          break;
        }
      }

      rolled.push(selectedEvent);
      rolledRandomCount++;

      // Đánh dấu ngay để không trùng trong round hiện tại
      // và trong những round tiếp theo.
      usedRandomEventIds.add(selectedEvent.id);
      state.usedRandomEventIds.push(selectedEvent.id);
    }

    // 3. Expense Penalty Events
    if (round > 1) {
      const prevDec = state.rounds[round - 2]?.decisions;
      if (prevDec && prevDec.expenses) {
        const categories = ['housing', 'food', 'utility', 'transport', 'healthcare'];
        categories.forEach(cat => {
          const prevVal = prevDec.expenses[cat];
          const minVal = GAME_DATA.MIN_EXPENSES[cat];
          if (prevVal !== undefined && prevVal === minVal) {
            const penalties = GAME_DATA.EXPENSE_PENALTY_EVENTS[cat];
            if (penalties && penalties.length > 0) {
              const r = Math.random();
              let selectedPenalty = penalties[0];
              let cumulative = 0;
              for (const p of penalties) {
                cumulative += p.prob;
                if (r <= cumulative) {
                  selectedPenalty = p;
                  break;
                }
              }
              rolled.push(selectedPenalty);
            }
          }
        });
      }
    }

    state.activeEvents = rolled;

    // Apply starting event impacts immediately to player stats
    rolled.forEach(e => {
      if (e.impact) {
        const isCovered = e.isMedical && state.hasInsurance;
        if (e.impact.cash !== undefined && e.impact.cash !== 0 && !isCovered) {
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

  function checkStartingHealthWarnings() {
    if (!state) return;
    const round = state.currentRound;

    // Check death conditions first (if health dropped to 0 from start-of-round events)
    if (state.stats.physicalHealth <= 0) {
      state.loseCondition = 'physical';
      clearSave();
      renderLoseScreen();
      UI.showScreen('screen-game-lose', 'fade');
      UI.toast.danger(`Game Over: ${GAME_DATA.LOSE_CONDITIONS[state.loseCondition].label}!`);
      return;
    }
    if (state.stats.mentalHealth <= 0) {
      state.loseCondition = 'mental';
      clearSave();
      renderLoseScreen();
      UI.showScreen('screen-game-lose', 'fade');
      UI.toast.danger(`Game Over: ${GAME_DATA.LOSE_CONDITIONS[state.loseCondition].label}!`);
      return;
    }

    let startPH_current = 70;
    let startMH_current = 70;
    let startPH_prev = 70;
    let startMH_prev = 70;
    let wasPhysWarnedLastRound = false;
    let wasMentWarnedLastRound = false;
    let wasPhysCardShownLastRound = false;
    let wasMentCardShownLastRound = false;

    if (round > 1) {
      const prevRoundHistory = state.rounds[round - 2];
      if (prevRoundHistory && prevRoundHistory.endStats) {
        startPH_current = prevRoundHistory.endStats.physicalHealth;
        startMH_current = prevRoundHistory.endStats.mentalHealth;
      }
      if (prevRoundHistory && prevRoundHistory.events) {
        wasPhysWarnedLastRound = prevRoundHistory.events.some(e => e.id === 'health_warning_physical' || e.id === 'health_critical_physical' || e.id === 'health_warning_physical_suppressed');
        wasMentWarnedLastRound = prevRoundHistory.events.some(e => e.id === 'health_warning_mental' || e.id === 'health_critical_mental' || e.id === 'health_warning_mental_suppressed');
        
        wasPhysCardShownLastRound = prevRoundHistory.events.some(e => e.id === 'health_warning_physical' || e.id === 'health_critical_physical');
        wasMentCardShownLastRound = prevRoundHistory.events.some(e => e.id === 'health_warning_mental' || e.id === 'health_critical_mental');
      }
    }

    if (round > 2) {
      const roundR2 = state.rounds[round - 3];
      if (roundR2 && roundR2.endStats) {
        startPH_prev = roundR2.endStats.physicalHealth;
        startMH_prev = roundR2.endStats.mentalHealth;
      }
    }

    const currentPH = state.stats.physicalHealth;
    const currentMH = state.stats.mentalHealth;

    // --- 1. PHYSICAL HEALTH WARNING ---
    if (currentPH < 50) {
      const isPhysBypassed = wasPhysWarnedLastRound && (startPH_current - startPH_prev >= 5);

      if (!isPhysBypassed) {
        const w = GAME_DATA.HEALTH_WARNING_EVENTS.physical.find(x => currentPH >= x.min && currentPH <= x.max);
        if (w) {
          if (w.penalty < 0) {
            state.stats.physicalHealth = Math.max(0, state.stats.physicalHealth + w.penalty);
          }
          const cashPen = (w.cashPenalty && !state.hasInsurance) ? w.cashPenalty : 0;
          if (cashPen > 0) {
            state.stats.cash = Math.max(0, state.stats.cash - cashPen);
          }

          const showPhysCard = !wasPhysCardShownLastRound;

          const warningEvent = {
            id: showPhysCard ? (currentPH < 20 ? 'health_critical_physical' : 'health_warning_physical') : 'health_warning_physical_suppressed',
            text: w.text,
            probability: 1.0,
            tag: 'negative',
            impact: {
              physicalHealth: w.penalty,
              cash: -cashPen
            }
          };

          if (showPhysCard) {
            state.activeEvents.push(warningEvent);
          } else {
            warningEvent.hiddenFromUI = true;
            state.activeEvents.push(warningEvent);
          }
        }
      }
    }

    // --- 2. MENTAL HEALTH WARNING ---
    if (currentMH < 50) {
      const isMentBypassed = wasMentWarnedLastRound && (startMH_current - startMH_prev >= 5);

      if (!isMentBypassed) {
        const w = GAME_DATA.HEALTH_WARNING_EVENTS.mental.find(x => currentMH >= x.min && currentMH <= x.max);
        if (w) {
          if (w.penalty < 0) {
            state.stats.mentalHealth = Math.max(0, state.stats.mentalHealth + w.penalty);
          }
          const cashPen = (w.cashPenalty && !state.hasInsurance) ? w.cashPenalty : 0;
          if (cashPen > 0) {
            state.stats.cash = Math.max(0, state.stats.cash - cashPen);
          }

          const showMentCard = !wasMentCardShownLastRound;

          const warningEvent = {
            id: showMentCard ? (currentMH < 20 ? 'health_critical_mental' : 'health_warning_mental') : 'health_warning_mental_suppressed',
            text: w.text,
            probability: 1.0,
            tag: 'negative',
            impact: {
              mentalHealth: w.penalty,
              cash: -cashPen
            }
          };

          if (showMentCard) {
            state.activeEvents.push(warningEvent);
          } else {
            warningEvent.hiddenFromUI = true;
            state.activeEvents.push(warningEvent);
          }
        }
      }
    }

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

    const visibleEvents = (state.activeEvents || []).filter(e => !e.hiddenFromUI);

    if (visibleEvents.length === 0) {
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
    visibleEvents.forEach(e => {
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
      // Random Events
      rand_lottery: "Lottery Winner!",
      rand_retreat: "Summer Retreat",
      rand_massager: "Lucky Draw",
      rand_weddings_fomo: "Social Life",
      rand_volunteer: "Community Service",
      rand_entrepreneur: "Inspirational Meeting",
      rand_dog: "New Friend",
      rand_thailand: "Company Trip",
      rand_lucky_money: "Found Money",
      rand_dyson: "Dyson Gift",
      rand_decline_wedding: "Wedding Invitation",
      rand_police: "Traffic Ticket",
      rand_grandfather_hospital: "Family Emergency",
      rand_grandfather_death: "Family Loss",
      rand_netflix: "Subscription Charge",
      rand_cheated: "Relationship Issue",
      rand_report_lost: "Work Mishap",
      rand_scam: "Financial Scam",
      rand_storm: "Accident",
      rand_mother_accident: "Family Emergency",
      rand_flat_tire: "Accident",
      rand_ac_broken: "Home Maintenance",
      rand_driving_fail: "Driving Test",
      rand_luggage_lost: "Travel Incident",

      // Job Reward Events
      job_y1_minor: "Job Recognition (Minor)",
      job_y1_moderate: "Job Reward (Moderate)",
      job_y1_major: "Job Promotion (Major)",
      job_y2_minor: "Job Recognition (Minor)",
      job_y2_moderate: "Job Reward (Moderate)",
      job_y2_major: "Job Promotion (Major)",
      job_y2_exceptional: "Job Honor (Exceptional)",
      job_y3_minor: "Job Recognition (Minor)",
      job_y3_moderate: "Job Reward (Moderate)",
      job_y3_major: "Job Promotion (Major)",
      job_y3_exceptional: "Job Honor (Exceptional)",
      job_y4_minor: "Job Recognition (Minor)",
      job_y4_moderate: "Job Reward (Moderate)",
      job_y4_major: "Job Promotion (Major)",
      job_y4_exceptional: "Job Honor (Exceptional)",
      job_y5_minor: "Job Recognition (Minor)",
      job_y5_moderate: "Job Reward (Moderate)",
      job_y5_major: "Job Promotion (Major)",
      job_y5_exceptional: "Job Honor (Exceptional)",

      // Expense Penalties
      exp_housing_1: "Housing Expense Penalty",
      exp_housing_2: "Housing Expense Penalty",
      exp_housing_3: "Housing Expense Penalty",
      exp_food_1: "Food Expense Penalty",
      exp_food_2: "Food Expense Penalty",
      exp_food_3: "Food Expense Penalty",
      exp_utility_1: "Utility Expense Penalty",
      exp_utility_2: "Utility Expense Penalty",
      exp_utility_3: "Utility Expense Penalty",
      exp_transport_1: "Transport Expense Penalty",
      exp_transport_2: "Transport Expense Penalty",
      exp_transport_3: "Transport Expense Penalty",
      exp_healthcare_1: "Healthcare Expense Penalty",
      exp_healthcare_2: "Healthcare Expense Penalty",
      exp_healthcare_3: "Healthcare Expense Penalty",

      // Warnings
      health_warning_physical: "Physical Health Warning",
      health_warning_mental: "Mental Health Warning",
      health_critical_physical: "Physical Health Collapse",
      health_critical_mental: "Mental Health Collapse",
      health_warning_physical_suppressed: "Physical Health Penalty",
      health_warning_mental_suppressed: "Mental Health Penalty"
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

    const branchKey = state.marketBranch || '1.1';
    const data = GAME_DATA.MARKET_EVENT_TREE[branchKey];
    if (!data) {
      container.innerHTML = `<div class="market-text"><p>No market information available.</p></div>`;
      return;
    }

    const age = GAME_DATA.ROUNDS[round - 1].age;
    
    let html = `
      <div class="market-text">
        <p class="market-year-title">Year ${round} (Age ${age}): ${data.title}</p>
        <p class="market-year-description" style="margin-bottom: var(--space-3); color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.6; font-style: normal;">
          ${data.sectorInfo || data.scenarioOverview}
        </p>
    `;

    const balance = state.savingsBalance || 0;
    const rate = GAME_DATA.getSavingsRate(balance, round, state.savingsRateAdjustment || 0);
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

    // 1. Build Income choices
    buildIncomeChoices(round);

    // 2. Build Expense choices
    buildExpenseChoices(round);

    // 3. Update Savings label and value
    const savingsRateLabel = document.getElementById('savings-rate-label');
    if (savingsRateLabel) {
      const balance = state.savingsBalance || 0;
      const rate = GAME_DATA.getSavingsRate(balance, round, state.savingsRateAdjustment || 0);
      const tier = GAME_DATA.getSavingsTierLabel(balance);
      savingsRateLabel.textContent = `Interest rate: ${(rate * 100).toFixed(2)}% / year (Tier: ${tier})`;
    }

    const savingsBalDisplay = document.getElementById('savings-balance-display');
    if (savingsBalDisplay) {
      savingsBalDisplay.textContent = `Savings Balance: ${state.savingsBalance.toLocaleString('vi-VN')} VND`;
    }

    const savingsInput = document.getElementById('invest-savings-input');
    if (savingsInput) {
      savingsInput.placeholder = "Amount...";
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

    // 1. Render Overtime row (now first and full-width, with note to its right)
    const otHours = dec.otHours || 0;
    const otChecked = otHours > 0;
    const otDecDisabled = hasWorkBan || !otChecked || otHours <= 0;
    const otIncDisabled = hasWorkBan || otHours >= 40;
    const otCheckDisabled = hasWorkBan;

    let html = `
      <div class="income-row income-row--full" style="display: flex; justify-content: space-between; gap: var(--space-4); align-items: center;">
        <div style="display: flex; align-items: center; gap: var(--space-3); flex: 1;">
          <input type="checkbox" class="income-row__checkbox" id="job-ot-check" ${otChecked ? 'checked' : ''} ${otCheckDisabled ? 'disabled' : ''}>
          <label class="income-row__label" for="job-ot-check">Overtime (OT)</label>
          <span class="income-row__rate">${UI.formatVND(Math.round(GAME_DATA.getOTWage(meta.monthlySalary)))} / hour</span>
          <div class="hours-selector">
            <button type="button" class="hours-btn" id="job-ot-dec-btn" ${otDecDisabled ? 'disabled' : ''}>-</button>
            <span class="hours-display" id="job-ot-hours-display">${otHours} hours</span>
            <button type="button" class="hours-btn" id="job-ot-inc-btn" ${otIncDisabled ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <div class="income-note" style="flex: 1.2; font-size: 0.8rem; color: var(--color-text-secondary); border-left: 2px solid var(--color-border); padding-left: var(--space-3); line-height: 1.3;">
          <strong>Note:</strong> Overtime increases your income but also increases mental and physical health deterioration. The more overtime hours you work, the larger the health penalty you may experience
        </div>
      </div>
    `;

    // 2. Render "Side Job" section header
    html += `
      <div class="income-section-header" style="grid-column: 1 / -1; margin-top: var(--space-3); font-weight: var(--fw-bold); color: var(--color-navy); font-size: 1.1rem; border-bottom: 1.5px solid var(--color-navy); padding-bottom: 4px; margin-bottom: 4px;">
        Side job
      </div>
    `;

    // 3. Render 4 side jobs (2x2 grid)
    const sideJobsKeys = ['tutor', 'blogger', 'adviser', 'bookkeeper'];
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

    // 4. Render bottom note for side jobs
    html += `
      <div class="income-row--full" style="font-size: 0.8rem; color: var(--color-text-secondary); line-height: 1.4; border: none; background: none; padding: var(--space-2) 0 0 0; grid-column: 1 / -1;">
        <strong>Note:</strong> Taking a side job provides additional income but increases workload. Different side jobs are associated with different occupation-specific health penalties, meaning higher income opportunities may also carry higher health risks
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
    const metaRound = GAME_DATA.ROUNDS[round - 1];

    categories.forEach(cat => {
      const meta = EXPENSE_METADATA[cat];
      
      // Get base cost from new round-by-round base costs
      const baseCost = GAME_DATA.getBaseExpense(cat, round);

      // Base Cost stays constant as a reference baseline
      const currentVal = state.currentDecision.expenses[cat];
      const displayedBaseCost = baseCost;
      const displayVal = currentVal !== undefined ? currentVal.toLocaleString('vi-VN') : '';
      const minCost = GAME_DATA.MIN_EXPENSES[cat] || 0;

      html += `
        <tr data-category="${cat}">
          <td class="cell-category"><span class="category-badge">${meta.name}</span></td>
          <td class="cell-desc">${meta.desc}</td>
          <td class="cell-min" style="text-align: right; white-space: nowrap;">${UI.formatVND(minCost)}</td>
          <td class="cell-base" style="text-align: right; white-space: nowrap;">${UI.formatVND(displayedBaseCost)}</td>
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

    const iconMap = {
      'BNK-V': 'Bank.svg',
      'TEC-F': 'Tech.svg',
      'CSM-M': 'Consumer.svg',
      'REA-V': 'Real estate.svg',
      'ENE-G': 'Energy.svg'
    };

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
          <td class="stock-row__code">
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <img src="assets/icons/${iconMap[code]}" alt="${code} icon" style="width: 20px; height: 20px;">
              <span>${code}</span>
            </div>
          </td>
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
      // 1. Format text formatting live as the user types (no state update, no preview jump)
      input.addEventListener('input', () => {
        let valStr = input.value.replace(/[^\d]/g, '');
        let val = parseInt(valStr) || 0;
        input.value = val > 0 ? val.toLocaleString('vi-VN') : '';
      });

      // 2. Click away (blur) reverts the input text to the last committed budget in the state
      input.addEventListener('blur', () => {
        setTimeout(() => {
          const cat = input.dataset.category;
          const committedVal = state.currentDecision.expenses[cat] || GAME_DATA.MIN_EXPENSES[cat] || 0;
          input.value = committedVal > 0 ? committedVal.toLocaleString('vi-VN') : '';
        }, 150);
      });

      // 3. Pressing Enter key on the keyboard triggers the row's Enter button click
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const cat = input.dataset.category;
          const btn = document.querySelector(`.expense-enter-btn[data-category="${cat}"]`);
          if (btn) btn.click();
        }
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

          const minCost = GAME_DATA.MIN_EXPENSES[cat] || 0;
          const EXPENSE_NAMES = {
            housing: 'Housing', utility: 'Utility', food: 'Food',
            transport: 'Transport', healthcare: 'Healthcare', entertainment: 'Entertainment'
          };

          if (val < minCost) {
            UI.toast.warning(`Budget for ${EXPENSE_NAMES[cat]} cannot be lower than the Minimum Cost (${UI.formatVND(minCost)}).`);
            input.focus();
            input.classList.add('flash-negative');
            setTimeout(() => input.classList.remove('flash-negative'), 800);
            return;
          }

          state.currentDecision.expenses[cat] = val;

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

        const val = Number(qtyInput.value);
        if (!Number.isInteger(val) || val <= 0) {
          UI.toast.warning("Error: you must enter a positive integer number.");
          return;
        }
        const qty = val;

        const price = state.currentPrices[code];
        const cost = qty * price;
        const fee = cost * GAME_DATA.STOCK_TRADING_FEE;
        const totalCost = cost + fee;

        if (state.stats.cash < totalCost) {
          UI.toast.warning(`Not enough cash. Total needed: ${UI.formatVND(totalCost)} (including 0.15% fee).`);
          return;
        }

        state.stats.cash -= totalCost;
        state.stockPurchases = (state.stockPurchases || 0) + totalCost;
        const pos = state.portfolio[code] || { quantity: 0, avgCost: 0 };
        const newQty = pos.quantity + qty;
        const newAvgCost = ((pos.avgCost * pos.quantity) + totalCost) / newQty;

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

        const val = Number(qtyInput.value);
        if (!Number.isInteger(val) || val <= 0) {
          UI.toast.warning("Error: you must enter a positive integer number.");
          return;
        }
        const qty = val;

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
        state.stockSells = (state.stockSells || 0) + netGained;
        state.realizedPnL = (state.realizedPnL || 0) + (netGained - qty * pos.avgCost);
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

    // No mid-round conditional events in the 4-type system
    const condWarningTexts = [];

    const result = HEALTH.applyRound(state, state.currentDecision, mappedEvents);
    const newState = result.newState;

    const barCash = document.getElementById('bar-cash-val');
    if (barCash) {
      const prev = state.stats.cash;
      const closingBalance = state.savingsBalance + result.income.savingsInterest;
      const proj = newState.stats.cash - closingBalance;
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
      const otHours = state.currentDecision.otHours || 0;
      const sideJobHours = state.currentDecision.sideJobHours || 0;
      const sideJob = state.currentDecision.sideJob || 'none';
      const mhJobMult = GAME_DATA.SIDE_JOB_MH_MULTIPLIERS[sideJob] || 0.0;
      const phJobMult = GAME_DATA.SIDE_JOB_PH_MULTIPLIERS[sideJob] || 0.0;

      const phPenalty = (5 * 0.034 * otHours) + (5 * 0.034 * sideJobHours * phJobMult);
      const mentPenalty = (5 * 0.048 * otHours) + (5 * 0.048 * sideJobHours * mhJobMult);
      const totalHours = otHours + sideJobHours;
      
      let summaryText = '';
      if (totalHours > 0) {
        summaryText = `Extra Work: ${totalHours} hours/month · Projected work penalty: -${phPenalty.toFixed(1)} Physical, -${mentPenalty.toFixed(1)} Mental health`;
      } else {
        summaryText = "Summary: No extra work selected. No health penalties applied.";
      }

      if (condWarningTexts.length > 0) {
        summaryText += `<br><span style="color: var(--color-loss); font-weight: bold; display: block; margin-top: 4px;">${condWarningTexts.join('<br>')}</span>`;
      }
      
      summaryTitle.innerHTML = summaryText;
      if (summaryBox) summaryBox.classList.add('visible');
    }

    // Update Expense Recap Card
    const expSummaryTitle = document.getElementById('expense-summary-title');
    const expSummaryBreakdown = document.getElementById('expense-summary-breakdown');
    const expSummaryBox = document.getElementById('expense-summary-box');
    if (expSummaryTitle && expSummaryBreakdown && expSummaryBox) {
      const monthlyIncome = result.income.totalMonthly;
      const healthcareRecovery = result.phDelta.healthcareRecovery || 0;
      const totalMHExpenseEffect = result.mhDelta.expenseEffect || 0;

      const phSign = healthcareRecovery >= 0 ? '+' : '';
      const mhSign = totalMHExpenseEffect >= 0 ? '+' : '';

      expSummaryTitle.textContent = `Summary: ${phSign}${healthcareRecovery.toFixed(1)} Physical health, ${mhSign}${totalMHExpenseEffect.toFixed(1)} Mental health`;

      let breakdownHtml = '';
      const categories = ['housing', 'utility', 'food', 'transport', 'healthcare', 'entertainment'];
      const EXPENSE_NAMES = {
        housing: 'Housing', utility: 'Utility', food: 'Food',
        transport: 'Transport', healthcare: 'Healthcare', entertainment: 'Entertainment'
      };

      categories.forEach(cat => {
        const actualVal = state.currentDecision.expenses[cat] || 0;
        const actualRatio = monthlyIncome > 0 ? actualVal / monthlyIncome : 0;
        const baseRatio = GAME_DATA.BASE_RATIOS[cat];
        const coeff = GAME_DATA.MH_EXPENSE_COEFF[cat];
        
        // MH impact: 10.57 * coeff * (baseRatio - actualRatio)
        const mhImpact = 10.57 * coeff * (baseRatio - actualRatio);
        // PH impact: healthcare recovery for healthcare, 0 otherwise
        const phImpact = (cat === 'healthcare') ? healthcareRecovery : 0;

        const catPhSign = phImpact >= 0 ? '+' : '';
        const catMhSign = mhImpact >= 0 ? '+' : '';

        breakdownHtml += `
          <div class="summary-box__line" style="font-size: var(--fs-micro); margin-bottom: 2px;">
            · ${EXPENSE_NAMES[cat]}: ${catPhSign}${phImpact.toFixed(1)} Physical health, ${catMhSign}${mhImpact.toFixed(1)} Mental health
          </div>
        `;
      });

      expSummaryBreakdown.innerHTML = breakdownHtml;
      expSummaryBox.classList.add('visible');
    }
    saveGame();
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
      subtitleEl.textContent = "This is your result breakdown. Congratulations for surviving!";
    }

    const avatarEl = document.getElementById('result-avatar-el');
    if (avatarEl) {
      avatarEl.innerHTML = `<img src="assets/characters/Character_Round_${roundNumber}.svg" alt="Round ${roundNumber} Character">`;
    }

    // 2. Investment Portfolio Calculations
    let totalCapital = 0;
    let totalMarketValue = 0;

    const codes = ['BNK-V', 'TEC-F', 'CSM-M', 'REA-V', 'ENE-G'];
    codes.forEach(code => {
      const pos = portfolio[code] || { quantity: 0, avgCost: 0 };
      totalCapital += pos.quantity * pos.avgCost;
      totalMarketValue += pos.quantity * prices[code];
    });

    const roundReturn = totalMarketValue - totalCapital;

    // Calculate Cumulative capital invested
    const cumulativeCapital = totalCapital;

    const realizedPnL = outcome.realizedPnL || 0;
    const cumulativeReturnPct = cumulativeCapital > 0
      ? ((realizedPnL + (totalMarketValue - totalCapital)) / cumulativeCapital) * 100
      : 0;

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
      cumRetEl.textContent = (cumulativeReturnPct >= 0 ? '+' : '') + cumulativeReturnPct.toFixed(2) + '%';
      cumRetEl.className = cumulativeReturnPct > 0 ? 'num-gain' : (cumulativeReturnPct < 0 ? 'num-loss' : 'num-neutral');
    }

    // Update stock table cost header dynamically
    const costHeaderEl = document.getElementById('result-stock-cost-header');
    if (costHeaderEl) {
      costHeaderEl.textContent = roundNumber === 1 ? 'Cost/Share' : 'Avg Cost';
    }

    // 3. Stock Portfolio Table
    const tbody = document.getElementById('result-stock-tbody');
    if (tbody) {
      let html = '';
      const iconMap = {
        'BNK-V': 'Bank.svg',
        'TEC-F': 'Tech.svg',
        'CSM-M': 'Consumer.svg',
        'REA-V': 'Real estate.svg',
        'ENE-G': 'Energy.svg'
      };

      codes.forEach(code => {
        const pos = portfolio[code] || { quantity: 0, avgCost: 0 };
        const price = prices[code];
        const gain = pos.quantity * (price - pos.avgCost);
        const gainPct = pos.avgCost > 0 ? (gain / (pos.quantity * pos.avgCost)) * 100 : 0;

        const gainText = pos.quantity > 0
          ? `${gain >= 0 ? '+' : ''}${UI.formatVND(gain)} (${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%)`
          : '-';
        const gainClass = pos.quantity > 0
          ? (gain > 0 ? 'num-gain' : (gain < 0 ? 'num-loss' : 'num-neutral'))
          : 'num-neutral';

        // Calculate Cost/Share (Buy Cost for round 1, Avg Cost for round 2+)
        let costDisplay = '';
        if (pos.quantity > 0) {
          costDisplay = UI.formatVND(pos.avgCost);
        } else if (roundNumber === 1) {
          costDisplay = UI.formatVND(price * (1 + GAME_DATA.STOCK_TRADING_FEE));
        } else {
          costDisplay = '-';
        }

        html += `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <img src="assets/icons/${iconMap[code]}" alt="${code} icon" style="width: 20px; height: 20px;">
                <strong>${code}</strong>
              </div>
            </td>
            <td class="text-right">${pos.quantity}</td>
            <td class="text-right">${costDisplay}</td>
            <td class="text-right">${UI.formatVND(price)}</td>
            <td class="text-right ${gainClass}">${gainText}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }

    // 4. Savings Account Table
    const savingsOpening = outcome.savingsOpening || 0;
    const additionalDeposit = savingsBalance - savingsOpening;
    const principal = savingsBalance;
    const interest = income.savingsInterest;
    const closingBalance = savingsBalance + interest;

    const savOpeningEl = document.getElementById('result-savings-opening');
    if (savOpeningEl) savOpeningEl.textContent = UI.formatVND(savingsOpening);

    const savDepositEl = document.getElementById('result-savings-deposit');
    if (savDepositEl) savDepositEl.textContent = UI.formatVND(additionalDeposit);

    const savPrincipalEl = document.getElementById('result-savings-principal');
    if (savPrincipalEl) savPrincipalEl.textContent = UI.formatVND(principal);

    const savRateEl = document.getElementById('result-savings-rate');
    if (savRateEl) {
      const adjustment = outcome.savingsRateAdjustment !== undefined ? outcome.savingsRateAdjustment : 0;
      const rate = GAME_DATA.getSavingsRate(savingsBalance, roundNumber, adjustment);
      const tier = GAME_DATA.getSavingsTierLabel(savingsBalance);
      savRateEl.textContent = `${(rate * 100).toFixed(2)}% / year (${tier})`;
    }

    const savIntEl = document.getElementById('result-savings-interest');
    if (savIntEl) {
      savIntEl.textContent = `+${UI.formatVND(interest)}`;
    }

    const savClosingEl = document.getElementById('result-savings-closing');
    if (savClosingEl) {
      savClosingEl.textContent = UI.formatVND(closingBalance);
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

    // Populate new Investment Activity & Balances rows
    const portValEl = document.getElementById('result-portfolio-value');
    if (portValEl) portValEl.textContent = UI.formatVND(totalMarketValue);

    const stockPurEl = document.getElementById('result-stock-purchase');
    if (stockPurEl) stockPurEl.textContent = UI.formatVND(outcome.stockPurchases || 0);

    const stockSellEl = document.getElementById('result-stock-sell');
    if (stockSellEl) stockSellEl.textContent = UI.formatVND(outcome.stockSells || 0);

    const savDepValEl = document.getElementById('result-savings-deposit-val');
    if (savDepValEl) savDepValEl.textContent = UI.formatVND(additionalDeposit);

    const savClosingValEl = document.getElementById('result-savings-closing-val');
    if (savClosingValEl) savClosingValEl.textContent = UI.formatVND(closingBalance);

    const cashBalValEl = document.getElementById('result-cash-balance-val');
    if (cashBalValEl) cashBalValEl.textContent = UI.formatVND(endStats.cash - closingBalance);

    const netWorthValEl = document.getElementById('result-net-worth-val');
    if (netWorthValEl) netWorthValEl.textContent = UI.formatVND(endStats.cash + totalMarketValue);

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
      const roundEvents = (outcome.events || []).filter(e => !e.hiddenFromUI);
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
    
    // In the new 4-type event system, all starting events (including warnings, job-rewards, and expense-penalties)
    // are already rolled at startRound and stored in state.activeEvents. No mid-round conditional rolls are needed.

    const mappedEvents = (state.activeEvents || []).map(e => ({
      id: e.id,
      text: e.text,
      tag: e.tag,
      cashImpact: e.impact.cash || 0,
      mhImpact: e.impact.mentalHealth || 0,
      phImpact: e.impact.physicalHealth || 0
    }));

    const completedRound = state.currentRound;
    const completedBranch = state.marketBranch || '1.1';

    // Capture the active savings balance before it gets auto-withdrawn/reset in applyRound
    const activeSavingsBalance = state.savingsBalance;

    const result = HEALTH.applyRound(state, state.currentDecision, mappedEvents);
    state = result.newState;
    
    // Outcome round index is state.currentRound - 1
    const completedRoundIdx = completedRound - 1;

    let roundStockChanges = null;

    // Update stock prices for the next round
    if (!state.loseCondition && state.currentRound <= 5) {
      const { newPrices, stockPriceChanges } = HEALTH.updateStockPrices(state.currentPrices, completedRound, completedBranch);
      state.currentPrices = newPrices;
      roundStockChanges = stockPriceChanges;
      
      // Advance market branch for the new round
      const currentBranchData = GAME_DATA.MARKET_EVENT_TREE[completedBranch];
      if (currentBranchData && currentBranchData.children && currentBranchData.children.length > 0) {
        const children = currentBranchData.children;
        const nextBranchKey = children[Math.floor(Math.random() * children.length)];
        state.marketBranch = nextBranchKey;
        const nextBranchData = GAME_DATA.MARKET_EVENT_TREE[nextBranchKey];
        if (nextBranchData) {
          state.savingsRateAdjustment = (state.savingsRateAdjustment || 0) + (nextBranchData.savingsRateAdjustment || 0);
          state.inflationRate = (state.inflationRate || 0) + (nextBranchData.inflationRate || 0);
        }
      }

      state.stats.investment = HEALTH.calcPortfolioValue(state.portfolio, state.currentPrices) + state.savingsBalance;
    }

    // 2. Save structural copy of portfolio, prices, and savings for history rendering
    if (state.rounds[completedRoundIdx]) {
      state.rounds[completedRoundIdx].portfolio = JSON.parse(JSON.stringify(state.portfolio));
      state.rounds[completedRoundIdx].prices = { ...state.currentPrices };
      state.rounds[completedRoundIdx].savingsBalance = activeSavingsBalance;
      state.rounds[completedRoundIdx].hasInsurance = state.hasInsurance;
      state.rounds[completedRoundIdx].stockPurchases = state.stockPurchases || 0;
      state.rounds[completedRoundIdx].stockSells = state.stockSells || 0;
      state.rounds[completedRoundIdx].savingsOpening = state.savingsOpening || 0;
      state.rounds[completedRoundIdx].realizedPnL = state.realizedPnL || 0;
      if (roundStockChanges) {
        state.rounds[completedRoundIdx].stockPriceChanges = roundStockChanges;
      }
    }
    
    // Set screen status for F5 safety
    state.screen = 'round-result';

    // Render and show results
    renderRoundResult(completedRound, false);
    UI.showScreen('screen-round-result', 'fade');

    // Auto-save game state
    saveGame();
  }

  function showMarketHistoryModal() {
    if (!state) return;

    const expandedView = document.getElementById('market-expanded-view');
    const expandedBody = document.getElementById('market-expanded-body');
    if (!expandedView || !expandedBody) return;

    // Construct the timeline items
    let cardsHtml = '';
    const totalRounds = state.currentRound;

    for (let r = 1; r <= totalRounds; r++) {
      let branchKey = '1.1';
      let currentSavingsRateAdjustment = 0;
      let currentSavingsBalance = 0;
      
      if (r < state.currentRound) {
        const roundData = state.rounds[r - 1];
        branchKey = roundData?.marketBranch || '1.1';
        currentSavingsRateAdjustment = roundData?.savingsRateAdjustment || 0;
        currentSavingsBalance = roundData?.savingsBalance || 0;
      } else {
        branchKey = state.marketBranch || '1.1';
        currentSavingsRateAdjustment = state.savingsRateAdjustment || 0;
        currentSavingsBalance = state.savingsBalance || 0;
      }

      const data = GAME_DATA.MARKET_EVENT_TREE[branchKey];
      if (!data) continue;

      const age = GAME_DATA.ROUNDS[r - 1]?.age || (22 + r - 1);

      // Stock changes formatting - only for past/completed rounds
      let stockChangesStr = '';
      if (r < state.currentRound) {
        const roundData = state.rounds[r - 1];
        const changes = roundData?.stockPriceChanges;
        if (changes) {
          const parts = [];
          for (const [stock, change] of Object.entries(changes)) {
            const sign = change > 0 ? '+' : '';
            const percent = (change * 100).toFixed(1) + '%';
            const color = change > 0 ? 'var(--color-gain)' : (change < 0 ? 'var(--color-loss)' : 'var(--color-neutral)');
            parts.push(`<span style="color: ${color}; font-weight: var(--fw-bold);">${stock}: ${sign}${percent}</span>`);
          }
          stockChangesStr = parts.join(' &nbsp;·&nbsp; ');
        }
      }

      const rate = GAME_DATA.getSavingsRate(currentSavingsBalance, r, currentSavingsRateAdjustment);
      const tier = GAME_DATA.getSavingsTierLabel(currentSavingsBalance);

      cardsHtml += `
        <div class="market-history-card" style="background-color: var(--color-bg-panel); border: 1px solid var(--color-border); border-left: 4px solid var(--color-navy); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px dashed var(--color-border); padding-bottom: var(--space-2); margin-bottom: var(--space-3);">
            <h3 style="margin: 0; color: var(--color-navy); font-family: var(--font-display); font-size: var(--fs-h2);">Year ${r} (Age ${age}): ${data.title}</h3>
            ${r === state.currentRound ? '<span style="background-color: var(--color-navy); color: var(--color-text-white); font-size: var(--fs-micro); font-weight: var(--fw-bold); padding: 2px 6px; border-radius: var(--radius-xs); text-transform: uppercase;">Active</span>' : ''}
          </div>
          <p style="color: var(--color-text-primary); font-size: var(--fs-body); line-height: 1.5; margin-bottom: var(--space-3); font-style: normal;">
            ${data.sectorInfo || data.scenarioOverview}
          </p>
          <div style="background-color: var(--color-bg-white); border: 1px solid var(--color-border); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--fs-small); display: flex; flex-direction: column; gap: 4px; line-height: 1.4;">
            ${stockChangesStr ? `
            <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
              <strong>Stock Trends:</strong>
              <div>${stockChangesStr}</div>
            </div>` : ''}
            <div style="border-top: 1px solid var(--color-bg-panel); padding-top: 4px; margin-top: 2px;">
              <strong>Savings Account:</strong> Rate is <strong>${(rate * 100).toFixed(2)}% / year</strong> (Tier: ${tier}).
            </div>
          </div>
        </div>
      `;
    }

    expandedBody.innerHTML = cardsHtml;
    expandedView.classList.add('active');
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
              } else if (state.screen === 'round-result') {
                const completedRound = state.currentRound - 1;
                renderRoundResult(completedRound, false);
                UI.showScreen('screen-round-result', 'fade');
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

    // Zoom Market History Modal
    const zoomMarketBtn = document.getElementById('btn-zoom-market');
    if (zoomMarketBtn) {
      zoomMarketBtn.addEventListener('click', () => {
        showMarketHistoryModal();
      });
    }

    // Close Market History Expanded Screen
    const closeExpandedBtn = document.getElementById('btn-close-market-expanded');
    if (closeExpandedBtn) {
      closeExpandedBtn.addEventListener('click', () => {
        const expandedView = document.getElementById('market-expanded-view');
        if (expandedView) expandedView.classList.remove('active');
      });
    }

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

    // Savings deposit listener registration
    const savingsInput = document.getElementById('invest-savings-input');
    const savingsBtn = document.getElementById('invest-savings-btn');
    if (savingsInput && savingsBtn) {
      savingsInput.addEventListener('blur', () => {
        const rawVal = savingsInput.value.trim();
        if (rawVal === '') return;

        // Reject negative input or non-numeric characters (except separators)
        if (rawVal.includes('-')) {
          UI.toast.warning("Error: deposit amount must be a positive integer greater than 1,000,000 VND.");
          savingsInput.value = '';
          return;
        }

        const val = parseInt(rawVal.replace(/[^\d]/g, '')) || 0;
        if (val < 1000000) {
          UI.toast.warning("Error: deposit amount must be greater than 1,000,000 VND.");
          savingsInput.value = '';
          return;
        }
        savingsInput.value = val !== 0 ? val.toLocaleString('vi-VN') : '';
      });

      savingsBtn.addEventListener('click', () => {
        const rawText = savingsInput.value.trim();
        if (rawText === '') {
          UI.toast.warning("Please enter a valid deposit amount.");
          return;
        }

        // Reject negative input
        if (rawText.includes('-')) {
          UI.toast.warning("Error: deposit amount must be a positive integer greater than 1,000,000 VND.");
          savingsInput.value = '';
          return;
        }

        const amount = parseInt(rawText.replace(/[^\d]/g, '')) || 0;
        if (amount < 1000000) {
          UI.toast.warning("Error: deposit amount must be greater than 1,000,000 VND.");
          savingsInput.value = '';
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
        const EXPENSE_NAMES = {
          housing: 'Housing', utility: 'Utility', food: 'Food',
          transport: 'Transport', healthcare: 'Healthcare', entertainment: 'Entertainment'
        };
        for (const cat of categories) {
          const val = state.currentDecision.expenses[cat];
          const minCost = GAME_DATA.MIN_EXPENSES[cat] || 0;
          if (val === undefined || isNaN(val) || val < minCost) {
            UI.toast.warning(`Please enter a valid amount for ${EXPENSE_NAMES[cat]} (minimum: ${UI.formatVND(minCost)}).`);
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
    setState: (newState) => { state = newState; },
    rollRoundEvents,
    checkStartingHealthWarnings
  };

})();

// Boot up the game when the DOM is ready
document.addEventListener('DOMContentLoaded', GAME.init);
