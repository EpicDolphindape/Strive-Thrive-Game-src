// Extracted from js\game.js
// This file is a responsibility slice, not a standalone module.

// --- stock market table and transaction listeners (source lines 1051-1351) ---
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


// --- round result investment summary (source lines 1499-1815) ---
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
    let cumulativeCapital = 0;
    for (let r = 1; r <= roundNumber; r++) {
      const outcome_r = state.rounds[r - 1];
      if (outcome_r) {
        let tc = 0;
        const port_r = outcome_r.portfolio || {};
        for (const [code, pos] of Object.entries(port_r)) {
          tc += pos.quantity * pos.avgCost;
        }
        cumulativeCapital += tc;
      }
    }

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
            <td>
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <img src="assets/icons/${iconMap[code]}" alt="${code} icon" style="width: 20px; height: 20px;">
                <strong>${code}</strong>
              </div>
            </td>
            <td class="text-right">${pos.quantity}</td>
            <td class="text-right">${UI.formatVND(price)}</td>
            <td class="text-right">${pos.quantity > 0 ? UI.formatVND(mktVal) : '-'}</td>
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


// --- investment-sensitive result processing (source lines 1968-2126) ---
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

