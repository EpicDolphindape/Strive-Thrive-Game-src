
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


// --- buy and sell transaction handlers (source lines 1008-1092) ---
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


// --- portfolio result rendering (source lines 1235-1306) ---
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


// --- post-round stock update and portfolio snapshot logic (source lines 1634-1653) ---
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

// --- savings and insurance transaction handlers (source lines 1844-1903) ---
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

