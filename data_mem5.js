  const CHARACTER_SVGS = [
    'assets/characters/Character_Round_1.svg',
    'assets/characters/Character_Round_2.svg',
    'assets/characters/Character_Round_3.svg',
    'assets/characters/Character_Round_4.svg',
    'assets/characters/Character_Round_5.svg',
  ];

  function getCharacterSVG(round) {
    return CHARACTER_SVGS[Math.min(round - 1, 4)];
  }

  /* ──────────────────────────────────────────────────────────
     INITIAL STATE TEMPLATE
     ────────────────────────────────────────────────────────── */

  /** Factory: returns a fresh player state object */
  function createInitialState(playerName) {
    return {
      playerName,
      currentRound: 1,
      stats: {
        cash:           0,
        investment:     5_000_000,
        physicalHealth: 70,
        mentalHealth:   70,
      },
      // Per-round decisions + results (populated as game progresses)
      rounds: [],
      // Stock portfolio: { code: { quantity, avgCost } }
      portfolio: {
        'BNK-V': { quantity: 0, avgCost: 0 },
        'TEC-F': { quantity: 0, avgCost: 0 },
        'CSM-M': { quantity: 0, avgCost: 0 },
        'REA-V': { quantity: 0, avgCost: 0 },
        'ENE-G': { quantity: 0, avgCost: 0 },
      },
      savingsBalance: 5_000_000,
      hasInsurance:   false,
      // Current stock prices (updated each round)
      currentPrices: {
        'BNK-V': 60_000,
        'TEC-F': 70_000,
        'CSM-M': 80_000,
        'REA-V': 150_000,
        'ENE-G': 80_000,
      },
      loseCondition: null, // 'cash' | 'physical' | 'mental' | null
    };
  }

  /** Expense template for a single round */
  function createRoundDecision(round) {
    const meta = ROUNDS[round - 1];
    return {
      round,
      // Income choices
      otHours: 0,
      sideJob: 'none',
      sideJobHours: 0,
      // Expense choices (monthly, VND)
      expenses: { ...BASE_EXPENSES },
      // Investment choices handled via portfolio + savingsBalance
    };
  }

  /* ──────────────────────────────────────────────────────────

