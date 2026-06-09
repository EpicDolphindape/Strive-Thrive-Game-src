// --- income and expense decision builders 
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


// --- income and expense interaction handlers 
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


// --- round result header and outcome selection 
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


// --- savings, finance, well-being, and result state rendering 
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


// --- finance state validation before round confirmation 
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

