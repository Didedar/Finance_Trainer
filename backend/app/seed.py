from .database import SessionLocal, engine, Base
from .models import Lesson

Base.metadata.create_all(bind=engine)

LESSONS_DATA = [
    (1, 1, 1, "What is money: income, expenses, assets, liabilities", "l1m1-money-basics"),
    (1, 1, 2, "Inflation explained simply: why money loses value", "l1m1-inflation"),
    (1, 1, 3, "Financial Goals: short vs long, how to set them right", "l1m1-goals"),
    (1, 1, 4, "Pay yourself first: the basic rule of saving", "l1m1-pay-yourself"),
    (1, 1, 5, "Beginner mistakes: impulse buying, loans for wants", "l1m1-beginner-mistakes"),
    (1, 2, 1, "How to budget: the 50/30/20 rule", "l1m2-budget-method"),
    (1, 2, 2, "Tracking expenses: categories and the 1-minute system", "l1m2-expense-tracking"),
    (1, 2, 3, "Emergency fund: how much do you need and how to save", "l1m2-emergency-fund"),
    (1, 2, 4, "Cutting costs without pain: habits checklist", "l1m2-reduce-expenses"),
    (1, 2, 5, "Monthly planning: salary, fixed costs, surplus", "l1m2-monthly-planning"),
    (1, 3, 1, "Card, account, deposit: what's the difference", "l1m3-banking-basics"),
    (1, 3, 2, "Fees and interest: how banks make money on you", "l1m3-bank-fees"),
    (1, 3, 3, "Avoiding scams: schemes, phishing, fake calls", "l1m3-fraud-protection"),
    (1, 3, 4, "Financial Hygiene: passwords, 2FA, limits, separate cards", "l1m3-security-hygiene"),
    (1, 3, 5, "Credit history: what is it and why start from zero", "l1m3-credit-history"),
    (2, 1, 1, "Credit vs Installment: where's the catch", "l2m1-credit-vs-installment"),
    (2, 1, 2, "Interest rate, overpayment, APR explained", "l2m1-interest-rates"),
    (2, 1, 3, "When is debt justified: rules of good debt", "l2m1-good-debt"),
    (2, 1, 4, "Paying off debt faster: snowball vs avalanche", "l2m1-debt-payoff"),
    (2, 1, 5, "Financial discipline: staying out of debt", "l2m1-financial-discipline"),
    (2, 2, 1, "SMART Financial Goals + deadline/amount/plan", "l2m2-smart-goals"),
    (2, 2, 2, "Saving faster: automation, envelopes, savings accounts", "l2m2-saving-strategies"),
    (2, 2, 3, "Low income strategy: how to grow your income", "l2m2-income-growth"),
    (2, 2, 4, "Emergency reserve: medical, repairs, force majeure", "l2m2-emergency-reserve"),
    (2, 2, 5, "Big purchases: phone/laptop/travel without credit", "l2m2-big-purchases"),
    (2, 3, 1, "Risk in life and finance: what you can control", "l2m3-risk-basics"),
    (2, 3, 2, "Insurance: why you need it and when it helps", "l2m3-insurance-basics"),
    (2, 3, 3, "Health/Property/Life: basic types of insurance", "l2m3-insurance-types"),
    (2, 3, 4, "Fraud and Pyramids: how to spot them", "l2m3-scams"),
    (2, 3, 5, "Money protection checklist: reserve, insurance, diversification", "l2m3-protection-checklist"),
    (3, 1, 1, "Why invest: compound interest examples", "l3m1-compound-interest"),
    (3, 1, 2, "Instruments: Stocks, Bonds, ETFs — where to start", "l3m1-investment-instruments"),
    (3, 1, 3, "Risk/Return and Horizon: why get-rich-quick is dangerous", "l3m1-risk-return"),
    (3, 1, 4, "Diversification: not losing everything on one mistake", "l3m1-diversification"),
    (3, 1, 5, "Passive investing: buy & hold strategy for beginners", "l3m1-passive-investing"),
    (3, 2, 1, "Taxes: why understanding the basics matters", "l3m2-tax-basics"),
    (3, 2, 2, "Self-employed/Business/Employee: financial model differences", "l3m2-employment-types"),
    (3, 2, 3, "Financial documents: contracts, receipts, warranty, refunds", "l3m2-financial-documents"),
    (3, 2, 4, "Avoiding fines: common mistakes", "l3m2-avoid-penalties"),
    (3, 2, 5, "Financial transparency: accounting, reporting, habits", "l3m2-financial-transparency"),
    (3, 3, 1, "Overspending triggers: psychology of impulse buying", "l3m3-spending-triggers"),
    (3, 3, 2, "Lifestyle inflation: why income growth doesn't save you", "l3m3-lifestyle-inflation"),
    (3, 3, 3, "Unlimited wealth mindset: systems over motivation", "l3m3-wealthy-habits"),
    (3, 3, 4, "Decision making: thinking in numbers, not emotions", "l3m3-decision-making"),
    (3, 3, 5, "Family finance rules: agreements and conflict management", "l3m3-family-finance"),
    (4, 1, 1, "Increasing income: skills, market, negotiation", "l4m1-increase-income"),
    (4, 1, 2, "Personal Brand: monetizing your competence", "l4m1-personal-brand"),
    (4, 1, 3, "Business Basics: revenue, margin, profit, cashflow", "l4m1-business-basics"),
    (4, 1, 4, "Price vs Value: how pricing works", "l4m1-pricing"),
    (4, 1, 5, "Entrepreneur mistakes: cash gaps, bad loans, chaos", "l4m1-entrepreneur-mistakes"),
    (4, 2, 1, "Automating finance: transfer rules and distribution", "l4m2-finance-automation"),
    (4, 2, 2, "Assets/Liabilities: personal balance sheet", "l4m2-personal-balance"),
    (4, 2, 3, "Yearly Plan: goals, budget, reserve, investments", "l4m2-yearly-planning"),
    (4, 2, 4, "Credit Strategy: when to use leverage", "l4m2-credit-strategy"),
    (4, 2, 5, "Life Scenarios: job loss, illness, relocation", "l4m2-life-scenarios"),
    (4, 3, 1, "Rent vs Mortgage: how to compare correctly", "l4m3-rent-vs-mortgage"),
    (4, 3, 2, "Mortgage details: rates, overpayment, risks, down payment", "l4m3-mortgage-details"),
    (4, 3, 3, "Property valuation: apartment/house as an asset", "l4m3-property-valuation"),
    (4, 3, 4, "Renovation and Ownership: hidden costs", "l4m3-ownership-costs"),
    (4, 3, 5, "Buying mistakes: emotional choices, underestimating costs", "l4m3-buying-mistakes"),
    (5, 1, 1, "Investment Portfolio: Stocks/Bonds/Cash structure", "l5m1-portfolio-structure"),
    (5, 1, 2, "Rebalancing: when and why to adjust your portfolio", "l5m1-rebalancing"),
    (5, 1, 3, "Capital Protection: safety vs yield", "l5m1-capital-protection"),
    (5, 1, 4, "Passive Income: myths vs reality, working models", "l5m1-passive-income"),
    (5, 1, 5, "Avoiding hype: risk management and discipline", "l5m1-risk-management"),
    (5, 2, 1, "Financial Independence: formula and calculating your number", "l5m2-financial-independence"),
    (5, 2, 2, "Savings Strategy: how much to save and where", "l5m2-savings-strategy"),
    (5, 2, 3, "Retirement Planning: starting young", "l5m2-retirement-planning"),
    (5, 2, 4, "Future Insurance: health, income, longevity risks", "l5m2-future-insurance"),
    (5, 2, 5, "Life Goals + Money: avoiding burnout", "l5m2-life-goals"),
    (5, 3, 1, "Macroeconomics for life: rates, inflation, currency", "l5m3-macroeconomics"),
    (5, 3, 2, "Evaluating investment ideas: thinking like an investor", "l5m3-investment-thinking"),
    (5, 3, 3, "Financial Statements: reading company reports simply", "l5m3-financial-statements"),
    (5, 3, 4, "Personal Finance in crisis: survival and opportunity", "l5m3-crisis-strategy"),
    (5, 3, 5, "Ethical & Safe Finance: fraud, risks, responsibility", "l5m3-ethical-finance"),
]


def seed_lessons():
    db = SessionLocal()
    try:
        for level, module, lesson_num, title, topic_key in LESSONS_DATA:
            existing_lesson = db.query(Lesson).filter(Lesson.topic_key == topic_key).first()
            
            if existing_lesson:
                if existing_lesson.title != title:
                    existing_lesson.title = title
                    print(f"Updated lesson: {topic_key}")
            else:
                lesson = Lesson(
                    level=level,
                    module=module,
                    lesson_number=lesson_num,
                    title=title,
                    topic_key=topic_key
                )
                db.add(lesson)
        
        db.commit()
        print(f"Successfully processed {len(LESSONS_DATA)} lessons!")
        
    finally:
        db.close()


if __name__ == "__main__":
    seed_lessons()
