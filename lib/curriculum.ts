import { LESSON_DESCRIPTIONS } from "./lesson-descriptions";

export const LEVEL_NAMES: Record<number, string> = {
  1: "Money Awareness",
  2: "Financial Stability",
  3: "Wealth Building",
  4: "Advanced Thinking",
  5: "Hero Phase",
};

/** Section name by "level.section" (e.g. "2.1" => "Banking Basics"). */
export const SECTION_NAMES_BY_LEVEL: Record<string, string> = {
  "1.1": "Money Psychology",
  "1.2": "Earning & Income",
  "1.3": "Tracking Money",
  "2.1": "Banking Basics",
  "2.2": "Debt & Credit",
  "2.3": "Inflation & Time",
  "2.4": "Emergency Planning",
  "3.1": "Investing Basics",
  "3.2": "Global Markets & Strategies",
  "3.3": "Assets & Wealth Systems",
  "4.1": "Risk & Probability",
  "4.2": "Financial Traps",
  "4.3": "Taxes & Society",
  "5.1": "Hero Phase",
};

export function getSectionName(level: number, section: number): string {
  return SECTION_NAMES_BY_LEVEL[`${level}.${section}`] ?? `Section ${section}`;
}

export function parseTopicId(topicId: string): { level: number; section: number; lesson: number } | null {
  const parts = topicId.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { level: parts[0], section: parts[1], lesson: parts[2] };
}

/** Section-relative lesson counts per (level, section) for getNextTopicId. 200 lessons total. */
const LESSON_COUNTS: { level: number; section: number; count: number }[] = [
  { level: 1, section: 1, count: 12 },
  { level: 1, section: 2, count: 12 },
  { level: 1, section: 3, count: 12 },
  { level: 2, section: 1, count: 16 },
  { level: 2, section: 2, count: 25 },
  { level: 2, section: 3, count: 10 },
  { level: 2, section: 4, count: 5 },
  { level: 3, section: 1, count: 20 },
  { level: 3, section: 2, count: 10 },
  { level: 3, section: 3, count: 23 },
  { level: 4, section: 1, count: 13 },
  { level: 4, section: 2, count: 17 },
  { level: 4, section: 3, count: 10 },
  { level: 5, section: 1, count: 15 },
];

/** Topic IDs that belong on the learn path (lessons + checkpoints + boss). Used to hide stale DB rows (e.g. "Lesson 13"). */
export const VALID_LEARN_TOPIC_IDS: Set<string> = (() => {
  const set = new Set<string>();
  for (const r of LESSON_COUNTS) {
    for (let i = 1; i <= r.count; i++) set.add(`${r.level}.${r.section}.${i}`);
  }
  ["1.1.checkpoint", "1.2.checkpoint", "2.1.checkpoint", "3.1.checkpoint", "4.1.checkpoint", "1.boss", "2.boss", "3.boss"].forEach((id) => set.add(id));
  return set;
})();

export function getNextTopicId(topicId: string): string | null {
  const p = parseTopicId(topicId);
  if (!p) return null;
  const { level, section, lesson } = p;
  const rangeIndex = LESSON_COUNTS.findIndex((r) => r.level === level && r.section === section);
  if (rangeIndex < 0) return null;
  const range = LESSON_COUNTS[rangeIndex];
  if (lesson < range.count) return `${level}.${section}.${lesson + 1}`;
  const nextRange = LESSON_COUNTS[rangeIndex + 1];
  if (!nextRange) return null;
  return `${nextRange.level}.${nextRange.section}.1`;
}

/** Human-readable titles for lessons (topic_id -> title). All 200 lessons. */
export const LESSON_TITLES: Record<string, string> = {
  // 1.1 Money Psychology (12)
  "1.1.1": "What Is Money?",
  "1.1.2": "Needs vs. Wants",
  "1.1.3": "Impulse Spending",
  "1.1.4": "Dopamine, Rewards, and Spending",
  "1.1.5": "Delayed Gratification",
  "1.1.6": "Money Scripts & Beliefs",
  "1.1.7": "Emotions and Spending",
  "1.1.8": "Anchoring and Pricing Psychology",
  "1.1.9": "Scarcity vs. Abundance Mindset",
  "1.1.10": "Values and Money",
  "1.1.11": "Financial Goals That Stick",
  "1.1.12": "Habits That Build Wealth",
  // 1.2 Earning & Income (12)
  "1.2.1": "What Is Income?",
  "1.2.2": "Salary, Wages, and Paychecks",
  "1.2.3": "Net vs. Gross Income",
  "1.2.4": "How to Read a Payslip",
  "1.2.5": "Side Hustles and Gig Work",
  "1.2.6": "Freelancing Basics",
  "1.2.7": "Active vs. Passive Income",
  "1.2.8": "Raises and Negotiation",
  "1.2.9": "Employee Benefits and Perks",
  "1.2.10": "How Income Gets Taxed",
  "1.2.11": "Irregular and Variable Income",
  "1.2.12": "Building Multiple Income Streams",
  // 1.3 Tracking Money (12)
  "1.3.1": "Why Track Your Money?",
  "1.3.2": "Income and Expenses",
  "1.3.3": "What Is a Budget?",
  "1.3.4": "Fixed vs. Variable Expenses",
  "1.3.5": "Cash Flow Explained",
  "1.3.6": "The 50/30/20 Rule",
  "1.3.7": "Zero-Based Budgeting",
  "1.3.8": "Budgeting Methods Compared",
  "1.3.9": "Budgeting Apps and Tools",
  "1.3.10": "Categorizing Your Spending",
  "1.3.11": "Finding Spending Leaks",
  "1.3.12": "Reviewing and Adjusting Your Budget",
  // 2.1 Banking Basics (16)
  "2.1.1": "What Is a Bank?",
  "2.1.2": "Checking Accounts",
  "2.1.3": "Savings Accounts",
  "2.1.4": "Interest and APY",
  "2.1.5": "Debit Cards",
  "2.1.6": "ATMs and Withdrawal Fees",
  "2.1.7": "Digital Payments and Wallets",
  "2.1.8": "Direct Deposit and Payroll",
  "2.1.9": "Transfers and Payments",
  "2.1.10": "Overdrafts and Bank Fees",
  "2.1.11": "Online and Mobile Banking",
  "2.1.12": "Account Security and Fraud Prevention",
  "2.1.13": "Credit Unions vs. Banks",
  "2.1.14": "Deposit Protection Schemes",
  "2.1.15": "Opening Your First Account",
  "2.1.16": "Reading a Bank Statement",
  // 2.2 Debt & Credit (25)
  "2.2.1": "What Is Debt?",
  "2.2.2": "Good Debt vs. Bad Debt",
  "2.2.3": "What Is Credit?",
  "2.2.4": "Credit Scores Explained",
  "2.2.5": "How Credit Scores Are Used",
  "2.2.6": "Credit Reports",
  "2.2.7": "Credit Cards: How They Work",
  "2.2.8": "APR and Interest on Cards",
  "2.2.9": "The Minimum Payments Trap",
  "2.2.10": "Interest Traps: How Debt Grows",
  "2.2.11": "Paying Off Credit Cards",
  "2.2.12": "Consumer Loans and Installment Plans",
  "2.2.13": "Total Cost of a Loan",
  "2.2.14": "Student Loans",
  "2.2.15": "Car Loans",
  "2.2.16": "Mortgages Basics",
  "2.2.17": "Avoiding Predatory Lending",
  "2.2.18": "Debt Snowball vs. Avalanche",
  "2.2.19": "When to Use Credit Wisely",
  "2.2.20": "Building Credit from Scratch",
  "2.2.21": "Cosigning and Guarantees",
  "2.2.22": "How Debt Spirals Happen",
  "2.2.23": "Collections and Defaults",
  "2.2.24": "Bankruptcy Basics",
  "2.2.25": "Staying Out of Debt Long-Term",
  // 2.3 Inflation & Time (10)
  "2.3.1": "What Is Inflation?",
  "2.3.2": "How Prices Change Over Time",
  "2.3.3": "Purchasing Power",
  "2.3.4": "The Time Value of Money",
  "2.3.5": "Compound Growth",
  "2.3.6": "Why Starting Early Matters",
  "2.3.7": "Real vs. Nominal Returns",
  "2.3.8": "Inflation and Wages",
  "2.3.9": "Planning for Rising Costs",
  "2.3.10": "Long-Term Financial Thinking",
  // 2.4 Emergency Planning (5)
  "2.4.1": "What Is an Emergency Fund?",
  "2.4.2": "How Much Should You Save?",
  "2.4.3": "Where to Keep Your Emergency Fund",
  "2.4.4": "Building It on a Tight Budget",
  "2.4.5": "When and How to Use It",
  // 3.1 Investing Basics (20)
  "3.1.1": "What Is Investing?",
  "3.1.2": "Investing vs. Saving",
  "3.1.3": "Risk and Return",
  "3.1.4": "Stocks Basics",
  "3.1.5": "Bonds Basics",
  "3.1.6": "Mutual Funds and ETFs",
  "3.1.7": "Index Funds",
  "3.1.8": "Diversification",
  "3.1.9": "Asset Allocation",
  "3.1.10": "Tax-Advantaged Retirement Accounts",
  "3.1.11": "State Pensions and Retirement Systems",
  "3.1.12": "How Brokerages Work",
  "3.1.13": "Investment Fees and Costs",
  "3.1.14": "Dollar-Cost Averaging",
  "3.1.15": "Rebalancing Your Portfolio",
  "3.1.16": "Time Horizon and Investing",
  "3.1.17": "Market Volatility",
  "3.1.18": "Bull and Bear Markets",
  "3.1.19": "Dividends and Capital Gains",
  "3.1.20": "Making Your First Investment",
  // 3.2 Global Markets & Strategies (10)
  "3.2.1": "How Global Stock Markets Work",
  "3.2.2": "Investing in US Markets from Abroad",
  "3.2.3": "Currency Risk and Exchange Rates",
  "3.2.4": "Domestic vs. International Investing",
  "3.2.5": "Emerging Markets",
  "3.2.6": "Sector Investing",
  "3.2.7": "ESG and Ethical Investing",
  "3.2.8": "Passive vs. Active Strategies",
  "3.2.9": "When to Sell an Investment",
  "3.2.10": "Reinvesting Returns",
  // 3.3 Assets & Wealth Systems (23)
  "3.3.1": "What Are Assets?",
  "3.3.2": "Net Worth",
  "3.3.3": "Building Equity",
  "3.3.4": "Real Estate Basics",
  "3.3.5": "Renting vs. Owning",
  "3.3.6": "Liquid vs. Illiquid Assets",
  "3.3.7": "Appreciating vs. Depreciating Assets",
  "3.3.8": "Income-Producing Assets",
  "3.3.9": "Passive Income: Reality vs. Myth",
  "3.3.10": "Business Ownership Basics",
  "3.3.11": "Entrepreneurship as a Path",
  "3.3.12": "Profit vs. Cash Flow",
  "3.3.13": "Understanding Margins",
  "3.3.14": "Scaling Income Over Time",
  "3.3.15": "Opportunity Cost",
  "3.3.16": "Portfolio Thinking",
  "3.3.17": "Financial Independence",
  "3.3.18": "The FIRE Concept",
  "3.3.19": "Insurance as Wealth Protection",
  "3.3.20": "Estate Planning Basics",
  "3.3.21": "Generational Wealth",
  "3.3.22": "Wealth and Lifestyle Design",
  "3.3.23": "Building a 5-Year Wealth Plan",
  // 4.1 Risk & Probability (13)
  "4.1.1": "What Is Risk?",
  "4.1.2": "Probability Basics",
  "4.1.3": "Expected Value",
  "4.1.4": "Risk Tolerance",
  "4.1.5": "Insurance Basics",
  "4.1.6": "Health and Disability Insurance",
  "4.1.7": "Understanding Odds",
  "4.1.8": "Gambling Math in Practice",
  "4.1.9": "Gambling vs. Investing",
  "4.1.10": "Speculation vs. Investing",
  "4.1.11": "Emotional Investing",
  "4.1.12": "Black Swan Events",
  "4.1.13": "Managing Downside Risk",
  // 4.2 Financial Traps (17)
  "4.2.1": "Payday Loans",
  "4.2.2": "High-Interest Traps",
  "4.2.3": "Buy Now, Pay Later",
  "4.2.4": "Subscription Creep",
  "4.2.5": "Lifestyle Inflation",
  "4.2.6": "FOMO Spending",
  "4.2.7": "Market Bubbles and Crashes",
  "4.2.8": "Leverage and Margin: The Risks",
  "4.2.9": "Pyramid and Ponzi Schemes",
  "4.2.10": "Investment Scams",
  "4.2.11": "Phishing and Identity Theft",
  "4.2.12": "Pressure Tactics and Fake Urgency",
  "4.2.13": "Hidden Fees and Fine Print",
  "4.2.14": "Social Media and Spending Pressure",
  "4.2.15": "Influencer Marketing and Finance",
  "4.2.16": "Protecting Your Financial Data",
  "4.2.17": "Building a Scam Detection Filter",
  // 4.3 Taxes & Society (10)
  "4.3.1": "Why We Pay Taxes",
  "4.3.2": "Income Tax Basics",
  "4.3.3": "Tax Brackets and Marginal Rates",
  "4.3.4": "Deductions and Credits",
  "4.3.5": "Filing a Tax Return",
  "4.3.6": "Employment vs. Self-Employment Taxes",
  "4.3.7": "VAT and Consumption Taxes",
  "4.3.8": "Capital Gains Tax",
  "4.3.9": "Tax-Advantaged Accounts and Planning",
  "4.3.10": "Taxes, Public Goods, and Civic Responsibility",
  // 5.1 Hero Phase (15)
  "5.1.1": "Hero: Your Money Story",
  "5.1.2": "Hero: Goals Revisited",
  "5.1.3": "Hero: Building Financial Systems",
  "5.1.4": "Hero: Emergency Fund Plan",
  "5.1.5": "Hero: Debt-Free Strategy",
  "5.1.6": "Hero: Investment Strategy",
  "5.1.7": "Hero: Income Growth Plan",
  "5.1.8": "Hero: Risk and Protection Plan",
  "5.1.9": "Hero: Scam Protection Plan",
  "5.1.10": "Hero: Long-Term Vision",
  "5.1.11": "Hero: Teaching Others",
  "5.1.12": "Hero: Community and Money",
  "5.1.13": "Hero: Wealth Philosophy",
  "5.1.14": "Hero: Your Complete Financial Blueprint",
  "5.1.15": "Hero: ArcWealth Graduate",
};

export function getLessonTitle(topicId: string): string {
  const p = parseTopicId(topicId);
  return LESSON_TITLES[topicId] ?? (p ? `Lesson ${p.lesson}` : topicId);
}

const CHECKPOINT_DESCRIPTION =
  "Test your understanding of this section with a short quiz. Pass with 80% or higher to unlock the next section.";

export function getLessonDescription(topicId: string): string | null {
  if (topicId.endsWith(".checkpoint")) return CHECKPOINT_DESCRIPTION;
  return LESSON_DESCRIPTIONS[topicId] ?? null;
}

/** Lesson-only sections (level, section) with section-relative lesson numbers 1..count. 200 lessons. */
const LESSON_RANGES: { level: number; section: number; lessonStart: number; lessonEnd: number }[] = [
  { level: 1, section: 1, lessonStart: 1, lessonEnd: 12 },
  { level: 1, section: 2, lessonStart: 1, lessonEnd: 12 },
  { level: 1, section: 3, lessonStart: 1, lessonEnd: 12 },
  { level: 2, section: 1, lessonStart: 1, lessonEnd: 16 },
  { level: 2, section: 2, lessonStart: 1, lessonEnd: 25 },
  { level: 2, section: 3, lessonStart: 1, lessonEnd: 10 },
  { level: 2, section: 4, lessonStart: 1, lessonEnd: 5 },
  { level: 3, section: 1, lessonStart: 1, lessonEnd: 20 },
  { level: 3, section: 2, lessonStart: 1, lessonEnd: 10 },
  { level: 3, section: 3, lessonStart: 1, lessonEnd: 23 },
  { level: 4, section: 1, lessonStart: 1, lessonEnd: 13 },
  { level: 4, section: 2, lessonStart: 1, lessonEnd: 17 },
  { level: 4, section: 3, lessonStart: 1, lessonEnd: 10 },
  { level: 5, section: 1, lessonStart: 1, lessonEnd: 15 },
];

export interface LessonTopic {
  topic_id: string;
  level_number: number;
  section_number: number;
  lesson_number: number;
  levelName: string;
  sectionName: string;
  title: string;
  description: string | null;
}

export function getAllLessonTopics(): LessonTopic[] {
  const out: LessonTopic[] = [];
  for (const r of LESSON_RANGES) {
    const count = r.lessonEnd - r.lessonStart + 1;
    for (let i = 1; i <= count; i++) {
      const topic_id = `${r.level}.${r.section}.${i}`;
      out.push({
        topic_id,
        level_number: r.level,
        section_number: r.section,
        lesson_number: i,
        levelName: LEVEL_NAMES[r.level] ?? `Level ${r.level}`,
        sectionName: getSectionName(r.level, r.section),
        title: getLessonTitle(topic_id),
        description: getLessonDescription(topic_id),
      });
    }
  }
  return out;
}

export const CHECKPOINT_THRESHOLD = 70;
export const BOSS_THRESHOLD = 80;
