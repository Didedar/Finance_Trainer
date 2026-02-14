from .database import SessionLocal, engine, Base
from .models import Lesson

Base.metadata.create_all(bind=engine)

# Format: (level, module, lesson_num, title, topic_key, quest_emoji, quest_hook)
LESSONS_DATA = [
    (1, 1, 1, "What is money: income, expenses, assets, liabilities", "l1m1-money-basics",
     "🗺️", "Quest: Discover the four pillars of money before they crumble!"),
    (1, 1, 2, "Inflation explained simply: why money loses value", "l1m1-inflation",
     "🔥", "Quest: Stop the invisible fire that's burning your savings!"),
    (1, 1, 3, "Financial Goals: short vs long, how to set them right", "l1m1-goals",
     "🎯", "Quest: Draw your treasure map to financial victory!"),
    (1, 1, 4, "Pay yourself first: the basic rule of saving", "l1m1-pay-yourself",
     "💰", "Quest: Unlock the golden rule that millionaires follow!"),
    (1, 1, 5, "Beginner mistakes: impulse buying, loans for wants", "l1m1-beginner-mistakes",
     "⚠️", "Quest: Dodge the 5 traps that drain beginners dry!"),
    (1, 2, 1, "How to budget: the 50/30/20 rule", "l1m2-budget-method",
     "📊", "Quest: Master the magic formula that splits every dollar perfectly!"),
    (1, 2, 2, "Tracking expenses: categories and the 1-minute system", "l1m2-expense-tracking",
     "🔍", "Quest: Hunt down every hidden leak in your spending!"),
    (1, 2, 3, "Emergency fund: how much do you need and how to save", "l1m2-emergency-fund",
     "🛡️", "Quest: Build your financial shield against the unexpected!"),
    (1, 2, 4, "Cutting costs without pain: habits checklist", "l1m2-reduce-expenses",
     "✂️", "Quest: Cut the fat without losing the muscle in your budget!"),
    (1, 2, 5, "Monthly planning: salary, fixed costs, surplus", "l1m2-monthly-planning",
     "📅", "Quest: Architect the perfect month — zero waste, maximum power!"),
    (1, 3, 1, "Card, account, deposit: what's the difference", "l1m3-banking-basics",
     "🏦", "Quest: Navigate the banking maze — choose your weapons wisely!"),
    (1, 3, 2, "Fees and interest: how banks make money on you", "l1m3-bank-fees",
     "🕵️", "Quest: Unmask the hidden ways banks profit from your money!"),
    (1, 3, 3, "Avoiding scams: schemes, phishing, fake calls", "l1m3-fraud-protection",
     "🎭", "Quest: Detect the disguised villains trying to steal your cash!"),
    (1, 3, 4, "Financial Hygiene: passwords, 2FA, limits, separate cards", "l1m3-security-hygiene",
     "🔒", "Quest: Fortify your digital vault — no hacker gets through!"),
    (1, 3, 5, "Credit history: what is it and why start from zero", "l1m3-credit-history",
     "📜", "Quest: Write your first chapter in the Credit Chronicles!"),
    (2, 1, 1, "Credit vs Installment: where's the catch", "l2m1-credit-vs-installment",
     "🪤", "Quest: Spot the hidden trap — credit or installment?"),
    (2, 1, 2, "Interest rate, overpayment, APR explained", "l2m1-interest-rates",
     "📈", "Quest: Decode the secret language of interest rates!"),
    (2, 1, 3, "When is debt justified: rules of good debt", "l2m1-good-debt",
     "⚖️", "Quest: Learn when borrowing is a weapon, not a weakness!"),
    (2, 1, 4, "Paying off debt faster: snowball vs avalanche", "l2m1-debt-payoff",
     "❄️", "Quest: Choose your attack — snowball or avalanche to crush debt!"),
    (2, 1, 5, "Financial discipline: staying out of debt", "l2m1-financial-discipline",
     "🧘", "Quest: Train your financial willpower to resist temptation!"),
    (2, 2, 1, "SMART Financial Goals + deadline/amount/plan", "l2m2-smart-goals",
     "🎯", "Quest: Turn vague wishes into laser-focused money missions!"),
    (2, 2, 2, "Saving faster: automation, envelopes, savings accounts", "l2m2-saving-strategies",
     "🚀", "Quest: Turbocharge your savings with 3 secret engines!"),
    (2, 2, 3, "Low income strategy: how to grow your income", "l2m2-income-growth",
     "🌱", "Quest: Plant the seeds that grow your income stream!"),
    (2, 2, 4, "Emergency reserve: medical, repairs, force majeure", "l2m2-emergency-reserve",
     "🆘", "Quest: Build a fortress against life's surprise attacks!"),
    (2, 2, 5, "Big purchases: phone/laptop/travel without credit", "l2m2-big-purchases",
     "🎁", "Quest: Unlock big rewards without falling into the credit trap!"),
    (2, 3, 1, "Risk in life and finance: what you can control", "l2m3-risk-basics",
     "🎲", "Quest: Map the risks you control vs those you can't!"),
    (2, 3, 2, "Insurance: why you need it and when it helps", "l2m3-insurance-basics",
     "☂️", "Quest: Open the umbrella before the financial storm!"),
    (2, 3, 3, "Health/Property/Life: basic types of insurance", "l2m3-insurance-types",
     "🏥", "Quest: Assemble your protection squad for every scenario!"),
    (2, 3, 4, "Fraud and Pyramids: how to spot them", "l2m3-scams",
     "🔺", "Quest: Crack the pyramid code before it crumbles on you!"),
    (2, 3, 5, "Money protection checklist: reserve, insurance, diversification", "l2m3-protection-checklist",
     "✅", "Quest: Complete the ultimate money defense checklist!"),
    (3, 1, 1, "Why invest: compound interest examples", "l3m1-compound-interest",
     "📐", "Quest: Witness the 8th wonder of the world — compound interest!"),
    (3, 1, 2, "Instruments: Stocks, Bonds, ETFs — where to start", "l3m1-investment-instruments",
     "🛠️", "Quest: Choose your investment weapons from the arsenal!"),
    (3, 1, 3, "Risk/Return and Horizon: why get-rich-quick is dangerous", "l3m1-risk-return",
     "⏳", "Quest: Learn patience — the deadliest weapon on Wall Street!"),
    (3, 1, 4, "Diversification: not losing everything on one mistake", "l3m1-diversification",
     "🧺", "Quest: Don't put all your golden eggs in one basket!"),
    (3, 1, 5, "Passive investing: buy & hold strategy for beginners", "l3m1-passive-investing",
     "😴", "Quest: Build wealth while you sleep — the lazy genius strategy!"),
    (3, 2, 1, "Taxes: why understanding the basics matters", "l3m2-tax-basics",
     "🏛️", "Quest: Decode the tax system before it takes more than it should!"),
    (3, 2, 2, "Self-employed/Business/Employee: financial model differences", "l3m2-employment-types",
     "💼", "Quest: Pick your financial path — employee, freelancer, or boss!"),
    (3, 2, 3, "Financial documents: contracts, receipts, warranty, refunds", "l3m2-financial-documents",
     "📋", "Quest: Master paperwork — your shield in every dispute!"),
    (3, 2, 4, "Avoiding fines: common mistakes", "l3m2-avoid-penalties",
     "🚫", "Quest: Steer clear of the expensive mistakes everyone makes!"),
    (3, 2, 5, "Financial transparency: accounting, reporting, habits", "l3m2-financial-transparency",
     "🔎", "Quest: See through your finances with crystal-clear vision!"),
    (3, 3, 1, "Overspending triggers: psychology of impulse buying", "l3m3-spending-triggers",
     "🧠", "Quest: Outsmart your brain's sneaky spending triggers!"),
    (3, 3, 2, "Lifestyle inflation: why income growth doesn't save you", "l3m3-lifestyle-inflation",
     "🎈", "Quest: Deflate the lifestyle bubble before it pops!"),
    (3, 3, 3, "Unlimited wealth mindset: systems over motivation", "l3m3-wealthy-habits",
     "♾️", "Quest: Install the operating system that millionaires run!"),
    (3, 3, 4, "Decision making: thinking in numbers, not emotions", "l3m3-decision-making",
     "🧮", "Quest: Upgrade your brain to calculate, not just feel!"),
    (3, 3, 5, "Family finance rules: agreements and conflict management", "l3m3-family-finance",
     "👨‍👩‍👧", "Quest: Unite the family around money — no more fights!"),
    (4, 1, 1, "Increasing income: skills, market, negotiation", "l4m1-increase-income",
     "💪", "Quest: Level up your earning power with 3 pro moves!"),
    (4, 1, 2, "Personal Brand: monetizing your competence", "l4m1-personal-brand",
     "⭐", "Quest: Turn your name into a money-making machine!"),
    (4, 1, 3, "Business Basics: revenue, margin, profit, cashflow", "l4m1-business-basics",
     "🏗️", "Quest: Build the engine of business from scratch!"),
    (4, 1, 4, "Price vs Value: how pricing works", "l4m1-pricing",
     "💎", "Quest: See the difference between price tags and real value!"),
    (4, 1, 5, "Entrepreneur mistakes: cash gaps, bad loans, chaos", "l4m1-entrepreneur-mistakes",
     "💥", "Quest: Survive the explosions that kill most startups!"),
    (4, 2, 1, "Automating finance: transfer rules and distribution", "l4m2-finance-automation",
     "🤖", "Quest: Program your money to work on autopilot!"),
    (4, 2, 2, "Assets/Liabilities: personal balance sheet", "l4m2-personal-balance",
     "⚖️", "Quest: Weigh your wealth — assets vs liabilities showdown!"),
    (4, 2, 3, "Yearly Plan: goals, budget, reserve, investments", "l4m2-yearly-planning",
     "📆", "Quest: Design the master blueprint for your financial year!"),
    (4, 2, 4, "Credit Strategy: when to use leverage", "l4m2-credit-strategy",
     "🎰", "Quest: Play the leverage game — but know when to fold!"),
    (4, 2, 5, "Life Scenarios: job loss, illness, relocation", "l4m2-life-scenarios",
     "🌪️", "Quest: Prepare your finances for life's biggest storms!"),
    (4, 3, 1, "Rent vs Mortgage: how to compare correctly", "l4m3-rent-vs-mortgage",
     "🏠", "Quest: Solve the eternal debate — rent or own?"),
    (4, 3, 2, "Mortgage details: rates, overpayment, risks, down payment", "l4m3-mortgage-details",
     "🔑", "Quest: Unlock the mortgage secrets banks won't tell you!"),
    (4, 3, 3, "Property valuation: apartment/house as an asset", "l4m3-property-valuation",
     "🏢", "Quest: Learn to see buildings as money-printing machines!"),
    (4, 3, 4, "Renovation and Ownership: hidden costs", "l4m3-ownership-costs",
     "🔧", "Quest: Discover the hidden price tag of owning property!"),
    (4, 3, 5, "Buying mistakes: emotional choices, underestimating costs", "l4m3-buying-mistakes",
     "😱", "Quest: Dodge the emotional traps in your biggest purchase!"),
    (5, 1, 1, "Investment Portfolio: Stocks/Bonds/Cash structure", "l5m1-portfolio-structure",
     "📦", "Quest: Assemble the ultimate investment portfolio!"),
    (5, 1, 2, "Rebalancing: when and why to adjust your portfolio", "l5m1-rebalancing",
     "🔄", "Quest: Master the art of portfolio tuning!"),
    (5, 1, 3, "Capital Protection: safety vs yield", "l5m1-capital-protection",
     "🛡️", "Quest: Guard your capital while keeping it growing!"),
    (5, 1, 4, "Passive Income: myths vs reality, working models", "l5m1-passive-income",
     "💤", "Quest: Separate passive income fantasy from reality!"),
    (5, 1, 5, "Avoiding hype: risk management and discipline", "l5m1-risk-management",
     "🧊", "Quest: Stay ice-cold when the market goes crazy!"),
    (5, 2, 1, "Financial Independence: formula and calculating your number", "l5m2-financial-independence",
     "🏝️", "Quest: Calculate YOUR magic number for financial freedom!"),
    (5, 2, 2, "Savings Strategy: how much to save and where", "l5m2-savings-strategy",
     "🗄️", "Quest: Optimize your savings architecture for max growth!"),
    (5, 2, 3, "Retirement Planning: starting young", "l5m2-retirement-planning",
     "🧓", "Quest: Future-proof yourself — retirement starts NOW!"),
    (5, 2, 4, "Future Insurance: health, income, longevity risks", "l5m2-future-insurance",
     "🔮", "Quest: Protect your future self from risks you can't see yet!"),
    (5, 2, 5, "Life Goals + Money: avoiding burnout", "l5m2-life-goals",
     "🧘", "Quest: Balance wealth and happiness — without burning out!"),
    (5, 3, 1, "Macroeconomics for life: rates, inflation, currency", "l5m3-macroeconomics",
     "🌍", "Quest: See the world economy through the lens of your wallet!"),
    (5, 3, 2, "Evaluating investment ideas: thinking like an investor", "l5m3-investment-thinking",
     "🦅", "Quest: Develop the eagle eye of a seasoned investor!"),
    (5, 3, 3, "Financial Statements: reading company reports simply", "l5m3-financial-statements",
     "📊", "Quest: Read balance sheets like a Wall Street pro!"),
    (5, 3, 4, "Personal Finance in crisis: survival and opportunity", "l5m3-crisis-strategy",
     "🔥", "Quest: Turn financial crisis into your greatest opportunity!"),
    (5, 3, 5, "Ethical & Safe Finance: fraud, risks, responsibility", "l5m3-ethical-finance",
     "🌿", "Quest: Walk the path of responsible, sustainable wealth!"),
]


def seed_lessons():
    db = SessionLocal()
    try:
        for level, module, lesson_num, title, topic_key, quest_emoji, quest_hook in LESSONS_DATA:
            existing_lesson = db.query(Lesson).filter(Lesson.topic_key == topic_key).first()
            
            if existing_lesson:
                changed = False
                if existing_lesson.title != title:
                    existing_lesson.title = title
                    changed = True
                if existing_lesson.quest_emoji != quest_emoji:
                    existing_lesson.quest_emoji = quest_emoji
                    changed = True
                if existing_lesson.quest_hook != quest_hook:
                    existing_lesson.quest_hook = quest_hook
                    changed = True
                if changed:
                    print(f"Updated lesson: {topic_key}")
            else:
                lesson = Lesson(
                    level=level,
                    module=module,
                    lesson_number=lesson_num,
                    title=title,
                    topic_key=topic_key,
                    quest_emoji=quest_emoji,
                    quest_hook=quest_hook,
                )
                db.add(lesson)
        
        db.commit()
        print(f"Successfully processed {len(LESSONS_DATA)} lessons!")
        
    finally:
        db.close()


if __name__ == "__main__":
    seed_lessons()
