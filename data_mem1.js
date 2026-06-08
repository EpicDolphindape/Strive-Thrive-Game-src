/* Health scoring events */
  
  const HEALTH_WARNING_EVENTS = {
    mental: [
      { min: 50, max: 60, text: "You’ve been feeling quite stressed lately, and you keep wishing you could leave work just a little earlier. Maybe it’s time to slow down and give yourself some space to heal.", penalty: 0 },
      { min: 40, max: 49, text: "You visit a mental health professional after weeks of stress and poor sleep. The doctor told that you’re showing signs of anxiety.", penalty: -2 },
      { min: 30, max: 39, text: "You feel exhausted before the day even starts. A check-up suggests early burnout from long-term work stress.", penalty: -5 },
      { min: 20, max: 29, text: "You often have trouble sleeping, lose your appetite, and feels frustrated all the time. The doctor said you're having severe signs of depression.", penalty: -7 },
      { min: 1, max: 19, text: "You're constantly anxious and stressed as hell. Your boss knows this and insists on asking you to quit your job to improve your health.", penalty: -10 }
    ],
    physical: [
      { min: 50, max: 60, text: "You’ve been getting occasional headaches lately, and you’ve been going to bed later than usual. Please remember to get some rest.", penalty: 0 },
      { min: 40, max: 49, text: "You've been having trouble sleeping and often feel exhausted by the end of the day. Your neck and shoulders have also started aching.", penalty: -2 },
      { min: 30, max: 39, text: "You faint at work because of acute stomach pain. The doctor says your lifestyle and diet are clearly not okay.", penalty: -5 },
      { min: 20, max: 29, text: "You end up in the hospital again. This time, the doctor says your body is exhausted and your immune system is struggling.", penalty: -7 },
      { min: 1, max: 19, text: "You are hospitalized because of a heart attack. The doctor is furious because you ignored every warning and kept neglecting your health.", penalty: -10 }
    ]
  };

  /** Get health threshold info for a value */

  const HEALTH_THRESHOLDS = [
    { min: 50, max: 60, type: 'warning',   penalty: 0,   canWork: true,  label: 'Feeling tired' },
    { min: 40, max: 49, type: 'event',     penalty: -2,  canWork: true,  label: 'Moderate issue' },
    { min: 30, max: 39, type: 'event',     penalty: -5,  canWork: true,  label: 'Significant issue' },
    { min: 20, max: 29, type: 'event',     penalty: -7,  canWork: true,  label: 'Serious issue' },
    { min:  1, max: 19, type: 'critical',  penalty: -10, canWork: false, label: 'Critical — cannot work' },
    { min:  0, max:  0, type: 'lose',      penalty: 0,   canWork: false, label: 'Game Over' },
  ];
  
  function getHealthThreshold(value) {
    for (const t of HEALTH_THRESHOLDS) {
      if (value >= t.min && value <= t.max) return t;
    }
    return null;
  }

  /* ──────────────────────────────────────────────────────────
     SCORING
     ────────────────────────────────────────────────────────── */

  /** Total score benchmark for "above average" comparison */
  const SCORE_BENCHMARK = 47.36;

  /**
   * Net Worth Score bands (0–100).
   * Compared against a benchmark net worth calculated from
   * optimal play. For simplicity we score on a linear scale.
   */
  const NW_SCORE_BANDS = [
    { max: 49,  label: 'Weak',     score: (pct) => pct * 50 / 49 },
    { max: 79,  label: 'Moderate', score: (pct) => 50 + (pct - 50) * 30 / 29 },
    { max: 100, label: 'Strong',   score: (pct) => 80 + (pct - 80) * 20 / 20 },
  ];

  /**
   * Game-end archetypes based on financial and well-being scores.
   */
  const ARCHETYPES = [
    {
      id: 'balanced_achiever',
      label: 'Balanced Achiever',
      condition: (fin, wb) => fin >= 80 && wb >= 80,
      badgeFile: 'assets/outcomes/win/Balanced_Achiever.svg',
    },
    {
      id: 'burnout_rich',
      label: 'Burnout Rich',
      condition: (fin, wb) => fin >= 80 && wb < 50,
      badgeFile: 'assets/outcomes/win/Burnout_Rich.svg',
    },
    {
      id: 'no_pain_no_gain',
      label: 'No Gain — No Pain',
      condition: (fin, wb) => fin < 50 && wb >= 80,
      badgeFile: 'assets/outcomes/win/No_pain_-_No_gain.svg',
    },
    {
      id: 'broke_and_choked',
      label: 'Broke & Choked',
      condition: (fin, wb) => fin < 50 && wb < 50,
      badgeFile: 'assets/outcomes/win/Broke_and_Choked.svg',
    },
    {
      id: 'steady_builder',
      label: 'Steady Builder',
      condition: () => true, // fallback
      badgeFile: 'assets/outcomes/win/Steady_Builder.svg',
    },
  ];

  /**
   * Lose conditions and corresponding badge files.
   */
  const LOSE_CONDITIONS = {
    cash:     {
      label: 'Bankruptcy',
      badgeFile: 'assets/outcomes/lose/Cash.svg',
    },
    physical: {
      label: 'Physical Health Collapse',
      badgeFile: 'assets/outcomes/lose/Physical_health.svg',
    },
    mental:   {
      label: 'Mental Health Collapse',
      badgeFile: 'assets/outcomes/lose/Mental_health.svg',
    },
  };

 /* ──────────────────────────────────────────────────────────
     LIFE EVENTS
     ────────────────────────────────────────────────────────── */

  const LIFE_EVENTS = [
    // Round 1
    {
      id: 'reward_parents',
      round: 1,
      text: "You receive a performance reward from your parents for graduating with an excellent degree.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { cash: 20000000, mentalHealth: 5 }
    },
    {
      id: 'summer_retreat',
      round: 1,
      text: "Your manager organized a one-week summer retreat for the whole department. The retreat resort also has the greatest massage service!",
      probability: 0.10,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5, physicalHealth: 2 }
    },
    {
      id: 'learn_chinese',
      round: 1,
      text: "You decided to self-study Chinese, which is your long-time favorite language, and you're absolutely loving it.",
      probability: 0.40,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5 }
    },
    {
      id: 'wedding_decline',
      round: 1,
      text: "A close friend invites you to be a bridesmaid/groomsman and attend a wedding. However, you are too busy with your work so you decline your friend's invitation.",
      probability: 0.10,
      condition: () => true,
      tag: 'negative',
      impact: { mentalHealth: -3 }
    },
    {
      id: 'food_poisoning',
      round: 1,
      text: "You ordered a lunch that was cheap and delicious from a post on Threads. Unfortunately, you got food poisoning and ended up spending your entire weekend in the hospital T_T.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -2000000 }
    },
    // Round 2
    {
      id: 'police_pull_over',
      round: 2,
      text: "In a moment of distraction while driving, you forgot to use your turn signal and got pulled over by the traffic police. That's how your food budget for the weekend gone away.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -1000000 }
    },
    {
      id: 'chinese_friend',
      round: 2,
      text: "You met a really interesting friend while learning Chinese. The two of you gradually became close, and you can see yourself improving day by day.",
      probability: 0.30,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 10 }
    },
    {
      id: 'laptop_broke',
      round: 2,
      text: "Oh no, the laptop that has been with you for 6 years just broke down. You have no choice but to buy a new one.",
      probability: 1.00,
      condition: (decision) => decision.otHours >= 30,
      tag: 'negative',
      impact: { cash: -20000000 }
    },
    {
      id: 'grandfather_hospital',
      round: 2,
      text: "You heard that your grandfather was hospitalized with atherosclerosis. You sent some money to help your parents with the medical bills and went to the hospital to visit him.",
      probability: 0.30,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -10000000, mentalHealth: -10 }
    },
    {
      id: 'side_job_tip',
      round: 2,
      text: "You performed well at your side job. Your customer was so satisfied so they tipped you!",
      probability: 0.20,
      condition: (decision) => decision.sideJob !== 'none',
      tag: 'positive',
      impact: { cash: 5000000 }
    },
    // Round 3
    {
      id: 'closed_contract_china',
      round: 3,
      text: "Thanks to the Chinese skills you have been building over the past two years, you successfully closed a contract with a company in China. You and your teammate are even sponsored for a trip to Shanghai.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 7 }
    },
    {
      id: 'insomnia',
      round: 3,
      text: "Your career is clearly on the rise, but so is your workload. The pressure starts affecting your sleep, and you develop mild insomnia.",
      probability: 1.00,
      condition: (decision) => (decision.sideJobHours + decision.otHours) >= 40,
      tag: 'negative',
      impact: { physicalHealth: -3 }
    },
    {
      id: 'grandfather_passed',
      round: 3,
      text: "After a year of medical treatment, your grandfather passes away. His departure leaves you deeply saddened.",
      probability: 0.50,
      condition: () => true,
      tag: 'negative',
      impact: { mentalHealth: -7 }
    },
    {
      id: 'bavi_trip',
      round: 3,
      text: "To cheer you up after your family's loss, your colleagues decide to fund you a weekend trip to the famous resort in Ba Vì.",
      probability: 1.00,
      condition: (decision) => decision.otHours > 0,
      tag: 'positive',
      impact: { mentalHealth: 3 }
    },
    {
      id: 'neck_massager',
      round: 3,
      text: "During a company health workshop, you joined the lucky draw with no hope. To your surprise, you won a high-quality neck and shoulder massager, perfectly saving your aching back.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { physicalHealth: 3 }
    },
    {
      id: 'netflix_trial',
      round: 3,
      text: "You accidentally signed up for a 7-day free trial of Netflix account and completely forgot about it. You only realized after 2 months but your bank account already deducted money.",
      probability: 0.10,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -460000 }
    },
    // Round 4
    {
      id: 'fomo_weddings',
      round: 4,
      text: "You are invited to two weddings of your high school friends. You are genuinely happy for them, but you also feel a little FOMO as people around you start to form their family.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -4000000 }
    },
    {
      id: 'projects_reward',
      round: 4,
      text: "You are assigned two more important company projects. Your boss immediately gave you a big reward for your contribution.",
      probability: 0.30,
      condition: () => true,
      tag: 'positive',
      impact: { cash: 10000000 }
    },
    {
      id: 'situationship_cheat',
      round: 4,
      text: "You got cheated on because the person in a situationship with you secretly texted 2 more people. You ended your relationship but still felt heartbroken.",
      probability: 0.10,
      condition: () => true,
      tag: 'negative',
      impact: { mentalHealth: -15 }
    },
    {
      id: 'famous_entrepreneur',
      round: 4,
      text: "During a casual coffee outing, you unexpectedly meet a famous entrepreneur you have admired for a long time. The two of you have a pleasant conversation, and you leave feeling incredibly motivated.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5 }
    },
    {
      id: 'lottery_win',
      round: 4,
      text: "YOU WON THE LOTTERY! The prize reaches 200,000,000 VND.",
      probability: 0.01,
      condition: () => true,
      tag: 'positive',
      impact: { cash: 200000000, mentalHealth: 20 }
    },
    {
      id: 'lost_report',
      round: 4,
      text: "Your report was lost because you forgot to save it. You had to stay up all night to redo it. Don't make this mistake again!",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { mentalHealth: -2, physicalHealth: -2 }
    },
    // Round 5
    {
      id: 'parents_trip',
      round: 5,
      text: "Your parents officially retire. To celebrate, the whole family takes a trip to Phu Quoc, and you find yourself deeply cherishing those moments together.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { cash: -10000000, mentalHealth: 5 }
    },
    {
      id: 'motorbike_fall',
      round: 5,
      text: "You fall off your motorbike on the way to work. The injury is not too serious, but you still need a full week of rest.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -5000000, physicalHealth: -5 }
    },
    {
      id: 'online_scam',
      round: 5,
      text: "You fall for an online scam. Luckily, the amount lost is not too large, but it is definitely a lesson to be more careful next time.",
      probability: 0.20,
      condition: () => true,
      tag: 'negative',
      impact: { cash: -2000000, mentalHealth: -5 }
    },
    {
      id: 'tiktok_viral',
      round: 5,
      text: "A random video you post on TikTok suddenly goes viral. You keep posting, and after a year, your account grows to over 50,000 followers.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5 }
    },
    {
      id: 'volunteer_local',
      round: 5,
      text: "You sign up for a local volunteer activity. It is tiring, but the experience feels meaningful and leaves you surprisingly happy.",
      probability: 0.20,
      condition: () => true,
      tag: 'positive',
      impact: { mentalHealth: 5 }
    }
  ];

  /* ──────────────────────────────────────────────────────────
     MARKET EVENTS
     ────────────────────────────────────────────────────────── */
  const MARKET_EVENTS = [
    {
      year: 1,
      title: "Markets hold steady as consumers chill",
      description: "The economy is kicking off the year on a pretty solid footing. Aside from a few minor shifts in digital trends and shopping habits keeping things interesting, the market is playing it cool with record-low volatility.",
      events: [
        { title: "Digital Banking Campaign", text: "A major digital banking campaign stokes popularity among young customers. More people are opening online accounts.", impact: "Bank Stock +4% · Tech Stock +3%" },
        { title: "Shopping Festival", text: "A large shopping festival increases both online and offline purchases.", impact: "Consumer Stock +2%" }
      ]
    },
    {
      year: 2,
      title: "Geopolitical tensions stoke market anxiety",
      description: "After a calm starting year, the market reverses. Rising tensions stoke fears over vital shipping lanes, pushing oil prices up and stoking living costs.",
      events: [
        { title: "Escalating Tensions", text: "Escalating tensions stoke fears over vital shipping lanes. Oil prices stoke upward.", impact: "Energy Stock +9%" },
        { title: "Essential Inflation", text: "Spikes in fuel costs filter down to everyday essentials. Inflation rises and confidence fades.", impact: "Inflation +1.5% · Savings return +0.5%" },
        { title: "Consumer Caution", text: "Consumers start reducing spending on non-essential goods. Retail activity slows down.", impact: "Consumer Stock -2%" }
      ]
    },
    {
      year: 3,
      title: "A breath of fresh air",
      description: "After a difficult year, the market finally gets some room to breathe. Inflation pressure eases, policy support becomes clearer, and households start to feel less squeezed.",
      events: [
        { title: "New Economic Policy", text: "A new economic policy package stabilizes prices and stabilizes businesses, boosting confidence.", impact: "Other Stocks +2% · Savings return -1.5%" },
        { title: "Stable Budgets", text: "Food, fuel, and transportation prices become more stable.", impact: "Inflation -2%" },
        { title: "Brighter Business Outlook", text: "Hiring plans improve, delayed projects restart, and bonus expectations become positive.", impact: "Bank Stock +4% · Tech Stock +4%" }
      ]
    },
    {
      year: 4,
      title: "Global storms: Trade tensions rise",
      description: "After a year of recovery, the economy is running into serious trouble. Growing tensions make investors nervous and supply chains unpredictable.",
      events: [
        { title: "Trade Barriers", text: "Political conflicts between major powers stoke fears about slower trade and weaker demand.", impact: "Consumer Stock -7% · Other Stocks -5%" },
        { title: "Logistics Delays", text: "New restrictions and logistics delays make imported goods and raw materials much more expensive.", impact: "Inflation +2%" },
        { title: "Market Volatility", text: "Risk aversion moves money out of stocks and into safe bank savings.", impact: "Savings return +1.5%" }
      ]
    },
    {
      year: 5,
      title: "The calm after the storm: Markets bounce back",
      description: "Negotiations show progress. Trade barriers ease, global markets turn positive, and businesses enjoy a much more stable environment.",
      events: [
        { title: "Global Negotiations", text: "Talks between major blocs reduce uncertainty and stoke stock market buying.", impact: "All Stocks +3% · Savings return -0.5%" },
        { title: "Normalized Supply Chains", text: "Supply chains return to normal, lowering operating costs and production expenses.", impact: "Consumer Stock +2%" }
      ]
    }
  ];

