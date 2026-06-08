# Strive & Thrive: A Life Balance Simulation

> **A life-simulation strategy game about money, wellbeing, and the trade-offs that shape real life.**

<p align="center">
  <em>Make choices. Feel the consequences. Build a life that balances wealth and wellbeing.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Deployment-Streamlit%20%2F%20GitHub-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white" />
  <img src="https://img.shields.io/badge/Focus-UI%2FUX%20%26%20Game%20Design-8A2BE2?style=for-the-badge" />
</p>

---

## Table of Contents

* [About the Game](#about-the-game)
* [Why This Game Exists](#why-this-game-exists)
* [Target Players](#target-players)
* [Core Gameplay](#core-gameplay)
* [Game Mechanics](#game-mechanics)

  * [1. Investment System](#1-investment-system)
  * [2. Side Jobs & Overtime System](#2-side-jobs--overtime-system)
  * [3. Spending System](#3-spending-system)
* [Scoring & Ending System](#scoring--ending-system)
* [Player Profile](#player-profile)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [How to Run](#how-to-run)
* [Game Design Principles](#game-design-principles)
* [Future Improvements](#future-improvements)
* [License](#license)

---

## About the Game

**Strive & Thrive** is a simulation game where the player manages a character’s financial life while balancing **wealth accumulation** and **work-life wellbeing**.

Across multiple rounds, players make decisions about:

* **Income**: overtime, side jobs, and additional work opportunities
* **Spending**: consumption, lifestyle choices, and trade-offs
* **Investing**: stock, savings, and gold allocation
* **Wellbeing**: protecting health, happiness, and life balance

The goal is **not** to maximize money at all costs. Instead, the game challenges players to build a sustainable path that reflects both **financial growth** and **quality of life**.

---

## Why This Game Exists

Many Gen Z students understand financial concepts like inflation, compound interest, opportunity cost, and investing — but still hesitate to make real-world financial commitments.

This game creates a **safe simulation space** to test different personal finance styles before making real-life decisions.

It helps players:

* explore different financial philosophies
* understand trade-offs between money and wellbeing
* stress-test long-term decisions without real-world risk
* turn abstract finance knowledge into practical intuition

---

## Target Players

This game is designed for **Gen Z learners (22–26 years old)** who are:

* financially literate or finance-curious
* early in their careers
* earning low to average income
* interested in personal finance, planning, and simulation games
* unsure of their own long-term financial style

### Player mindset

They want to:

* manage their own life more effectively
* test financial strategies safely
* compare outcomes of different life choices
* understand what they are sacrificing when they choose one path over another

---

## Core Gameplay

The player starts as an **entry-level financial analyst** and must manage life over several rounds.

Each round presents a set of decisions that affect:

* **Net worth**
* **Mental health**
* **Physical health**
* **Happiness / wellbeing**

Players must decide whether to play:

* **safe**
* **balanced**
* **aggressive**
* **wellbeing-first**

Every choice creates a trade-off.

---

## Game Mechanics

### 1. Investment System

Players can choose whether to invest in a fictional portfolio of assets.

#### Available assets

| Sector      | Fictional Code |        Round 1 Price (VND) | Basis                    |
| ----------- | -------------: | -------------------------: | ------------------------ |
| Bank        |          BNK-V |                     60,000 | Anchored to VCB          |
| Tech        |          TEC-F |                     70,000 | Anchored to FPT          |
| Consumer    |          CSM-M |                     80,000 | Anchored to MSN          |
| Real Estate |          REA-V |                    150,000 | Anchored to VHM          |
| Energy      |          ENE-G |                     80,000 | Anchored to GAS          |
| Gold        |           GOLD | dynamic / safe-haven asset | Hedge against volatility |

#### Price movement logic

Investment outcomes follow this general formula:

```text
New Price = Previous Round Price × (1 + Market Movement + Sector Movement + Noise)
```

#### Price components

* **Market movement**: scenario-based macro market condition in each round
* **Sector movement**: sector-specific performance by round
* **Noise**: random variation based on asset risk
* **Gold**: lower noise, used as a safe-haven hedge; may perform better in stressful rounds

#### Design goal

The investment system should feel realistic enough to create tension, but still be simple enough for players to understand the relationship between risk and return.

---

### 2. Side Jobs & Overtime System

Players can earn more income by choosing part-time jobs or overtime work.

#### Example options

* Grab driver
* Barista
* Teacher
* Overtime at main job

These options increase income, but they come at a cost:

* less rest
* lower health
* lower happiness
* reduced personal time

#### Opportunity cost design

This system is built to show that additional income is never free.
Every extra working hour can improve finances while slowly eroding wellbeing.

#### Health and happiness penalty model

The penalty is based on four inputs:

* **Physical strain**: how physically demanding the job is
* **Mental strain**: how stressful or mentally taxing the job is
* **Time burden**: how much personal time it consumes
* **Control**: autonomy, stability, and security of the work

Each input is scored from **1 to 5**.

##### Health formula

```text
Health = 0.35 × Physical + 0.30 × Mental + 0.25 × Time + 0.10 × Control
```

##### Happiness formula

```text
Happiness = 0.15 × Physical + 0.40 × Mental + 0.20 × Time + 0.25 × Control
```

#### Design logic

* **Health** is more sensitive to physical exhaustion and time burden
* **Happiness** is more sensitive to stress, autonomy, and psychological pressure
* The result can be scaled up or down to match game balance

---

### 3. Spending System

Players can also increase or reduce spending across different lifestyle categories.

This system introduces another major trade-off:

* spend now for satisfaction
* save now for future freedom
* invest now for future growth

Examples of spending choices may include:

* lifestyle upgrades
* travel or experiences
* tools for learning or self-development
* essential vs non-essential expenses

The purpose is to make players reflect on how everyday spending affects long-term financial progress.

---

## Scoring & Ending System

The final result is based on two main dimensions:

* **Financial outcome** = final net worth
* **Wellbeing outcome** = mental health + physical health

---

### Financial Score Bands

| Score  | Band     | Interpretation             |
| ------ | -------- | -------------------------- |
| 0–39   | Weak     | Poor financial outcome     |
| 40–69  | Moderate | Stable but limited growth  |
| 70–100 | Strong   | Strong wealth accumulation |

---

### Wellbeing Score Bands

| Score  | Band     | Interpretation             |
| ------ | -------- | -------------------------- |
| 0–39   | Critical | Severe decline / high risk |
| 40–59  | Weak     | Below acceptable level     |
| 60–79  | Stable   | Acceptable / manageable    |
| 80–100 | Strong   | Very good condition        |

#### Wellbeing formula

```text
Wellbeing Score = (Mental Health + Physical Health) / 2
```

---

### Final Label Logic

The game simplifies 9 possible combinations into **5 main endings**.

#### Main titles

* **Balanced Achiever**
* **Burnout Rich**
* **Soft-Life Protector**
* **Struggle Mode**
* **Steady Builder**

#### Directional tags

| Condition                                    | Tag            |
| -------------------------------------------- | -------------- |
| Financial > Wellbeing by more than 10 points | Finance-led    |
| Wellbeing > Financial by more than 10 points | Well-being-led |
| Difference ≤ 10 points                       | Aligned        |

#### Balance tags

| Condition                     | Tag                 |
| ----------------------------- | ------------------- |
| Mental − Physical < 15      | Aligned             |
| 15 ≤ Mental − Physical < 25 | Slightly imbalanced |
| Mental − Physical ≥ 25      | Imbalanced          |

---

### Example Endings

* **Balanced Achiever** — strong financial outcome and strong wellbeing
* **Burnout Rich** — wealth is high, but wellbeing is heavily damaged
* **Soft-Life Protector** — wellbeing is strong, but financial growth is limited
* **Struggle Mode** — both financial outcome and wellbeing are weak
* **Steady Builder** — moderate outcomes with a balanced path overall

---

## Player Profile

The player starts with a predefined profile:

| Attribute       | Value                                 |
| --------------- | ------------------------------------- |
| Name            | User input                            |
| Job             | Entry-level Financial Analyst         |
| Salary          | 15,000,000 VND / month (~180M / year) |
| Initial Savings | 10,000,000 VND                        |

This profile gives players a realistic starting point for personal finance simulation.

---

## Tech Stack

### Core

* **Language:** JavaScript
* **Deployment:** Streamlit / GitHub
* **Focus:** UI/UX and user experience

### Design / Visual Layer

* Cards
* Indicators
* Icons
* Custom visual assets
* Game-style result screens
* Interactive feedback components

### Suggested implementation tools

If needed for the final build, the project can be extended with:

* React-style component logic
* charting libraries for score visualization
* reusable UI components for game cards and dashboards
* animation assets for round transitions and outcome screens

---

## Project Structure

```text
strive-thrive/
├── app/
│   ├── components/
│   ├── screens/
│   ├── data/
│   └── utils/
├── assets/
│   ├── icons/
│   ├── cards/
│   └── illustrations/
├── logic/
│   ├── scoring.js
│   ├── investmentEngine.js
│   ├── jobEngine.js
│   └── outcomeEngine.js
├── public/
├── README.md
└── package.json
```

---

## How to Run

> Replace these steps with your real setup once the project is connected to your codebase.

```bash
# Clone the repository
git clone <your-repo-url>

# Move into the project folder
cd strive-thrive

# Install dependencies
npm install

# Start the app
npm run dev
```

---

## Game Design Principles

This game is designed around five core principles:

### 1. Trade-off driven

Every choice should create a visible sacrifice.

### 2. Outcome readable

Players should clearly understand why their score changed.

### 3. Real-life inspired

The mechanics should feel familiar to everyday financial decisions.

### 4. Safe experimentation

Players can test strategies without real-world consequences.

### 5. Emotion + logic balance

The game should appeal to both financial reasoning and personal reflection.

---

## Future Improvements

Possible future features:

* more job types
* more life events
* debt / loan system
* family support mechanics
* emergency fund mechanics
* personalized financial style summary
* save/load game progress
* richer visual storytelling at the ending screen
* multiple difficulty modes

---

## License

This project is intended for educational and portfolio purposes.

You may replace this section with your preferred license, such as:

* MIT License
* Apache 2.0
* Private / All Rights Reserved

---

<p align="center">
  <strong>Strive & Thrive</strong> — build wealth, protect wellbeing, and discover your own financial style.
</p>
