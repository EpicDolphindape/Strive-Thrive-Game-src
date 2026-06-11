// Extracted updated code from game (1).js
// Contains the expense, side job, and mental/physical health-related changes

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

  // 4. Render bottom side job note
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
    
    // Get base cost: previous round's actual chosen expense, or default BASE_EXPENSES * monthlySalary
    let baseCost = Math.round(GAME_DATA.BASE_EXPENSES[cat] * metaRound.monthlySalary);
    if (round > 1) {
      const prevDec = state.rounds[round - 2]?.decisions;
      if (prevDec && prevDec.expenses && prevDec.expenses[cat] !== undefined) {
        baseCost = prevDec.expenses[cat];
      }
    }

    // If player already entered a budget for this round, show it in the Base Cost column as confirmed
    const currentVal = state.currentDecision.expenses[cat];
    const displayedBaseCost = (currentVal !== undefined && currentVal !== 0) ? currentVal : baseCost;
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
      const minCost = GAME_DATA.MIN_EXPENSES[cat] || 0;
      state.currentDecision.expenses[cat] = Math.max(val, minCost);
      updateLivePreview();
    });

    input.addEventListener('blur', () => {
      const cat = input.dataset.category;
      let valStr = input.value.replace(/[^\d]/g, '');
      let val = parseInt(valStr) || 0;
      
      const minCost = GAME_DATA.MIN_EXPENSES[cat] || 0;
      if (val < minCost) {
        const EXPENSE_NAMES = {
          housing: 'Housing', utility: 'Utility', food: 'Food',
          transport: 'Transport', healthcare: 'Healthcare', entertainment: 'Entertainment'
        };
        UI.toast.warning(`Budget for ${EXPENSE_NAMES[cat]} cannot be lower than the Minimum Cost (${UI.formatVND(minCost)}).`);
        val = minCost;
        input.value = val > 0 ? val.toLocaleString('vi-VN') : '';
      }
      
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

        // Update the Base Cost column cell in this row immediately
        const row = btn.closest('tr');
        if (row) {
          const baseCostCell = row.querySelector('.cell-base');
          if (baseCostCell) {
            baseCostCell.textContent = UI.formatVND(val);
          }
        }

        UI.toast.success(`Set budget for ${EXPENSE_NAMES[cat]} to ${UI.formatVND(val)}`);
        updateLivePreview();
      }
    });
  });
}
