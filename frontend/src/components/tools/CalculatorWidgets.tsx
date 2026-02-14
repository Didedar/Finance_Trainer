import React, { useState } from 'react';

/* ─── Credit Calculator ────────────────────────────────────────────── */
const CreditCalc: React.FC = () => {
    const [amount, setAmount] = useState(10000);
    const [rate, setRate] = useState(12);
    const [months, setMonths] = useState(12);

    const monthlyRate = rate / 100 / 12;
    const payment = monthlyRate > 0
        ? (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
        : amount / months;
    const totalPaid = payment * months;
    const overpayment = totalPaid - amount;

    return (
        <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-xl">💳</span> Credit Calculator
            </h4>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Loan Amount ($)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Annual Rate (%)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={rate}
                        onChange={e => setRate(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Months</label>
                    <input
                        type="number"
                        value={months}
                        onChange={e => setMonths(Math.max(1, +e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-blue-600 font-medium">Monthly Payment</div>
                    <div className="text-lg font-bold text-blue-700">${payment.toFixed(2)}</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-amber-600 font-medium">Overpayment</div>
                    <div className="text-lg font-bold text-amber-700">${overpayment.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-600 font-medium">Total Paid</div>
                    <div className="text-lg font-bold text-gray-700">${totalPaid.toFixed(2)}</div>
                </div>
            </div>
            {/* Visual overpayment bar */}
            <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (overpayment / amount) * 100)}%` }}
                />
            </div>
            <p className="text-xs text-gray-400 text-center">
                Overpayment is {((overpayment / amount) * 100).toFixed(1)}% of the loan
            </p>
        </div>
    );
};

/* ─── Inflation Calculator ─────────────────────────────────────────── */
const InflationCalc: React.FC = () => {
    const [amount, setAmount] = useState(1000);
    const [years, setYears] = useState(5);
    const [inflationRate, setInflationRate] = useState(5);

    const futureValue = amount / Math.pow(1 + inflationRate / 100, years);
    const loss = amount - futureValue;

    return (
        <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-xl">🔥</span> Inflation Calculator
            </h4>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Years</label>
                    <input
                        type="number"
                        value={years}
                        onChange={e => setYears(Math.max(1, +e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Inflation (%/yr)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={inflationRate}
                        onChange={e => setInflationRate(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            <div className="relative bg-gradient-to-r from-green-50 to-red-50 rounded-xl p-4">
                <div className="flex justify-between items-end">
                    <div className="text-center">
                        <div className="text-xs text-green-600 font-medium mb-1">Today</div>
                        <div className="text-2xl font-bold text-green-700">${amount.toLocaleString()}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="text-xs text-gray-400">{years} years</span>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-red-600 font-medium mb-1">Real Value</div>
                        <div className="text-2xl font-bold text-red-700">${futureValue.toFixed(0)}</div>
                    </div>
                </div>
                <div className="mt-3 text-center">
                    <span className="text-sm text-red-500 font-medium">
                        You lose ${loss.toFixed(0)} ({((loss / amount) * 100).toFixed(1)}%) to inflation
                    </span>
                </div>
            </div>
        </div>
    );
};

/* ─── Savings Growth Calculator ────────────────────────────────────── */
const SavingsCalc: React.FC = () => {
    const [monthly, setMonthly] = useState(200);
    const [rate, setRate] = useState(8);
    const [years, setYears] = useState(10);

    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;
    const futureValue = monthlyRate > 0
        ? monthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
        : monthly * totalMonths;
    const contributed = monthly * totalMonths;
    const earned = futureValue - contributed;

    // Build year-by-year data for the chart
    const chartData: number[] = [];
    for (let y = 0; y <= years; y++) {
        const m = y * 12;
        const val = monthlyRate > 0
            ? monthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate)
            : monthly * m;
        chartData.push(val);
    }
    const maxVal = Math.max(...chartData, 1);

    return (
        <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-xl">📈</span> Savings Growth
            </h4>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Monthly ($)</label>
                    <input
                        type="number"
                        value={monthly}
                        onChange={e => setMonthly(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Return (%/yr)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={rate}
                        onChange={e => setRate(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Years</label>
                    <input
                        type="number"
                        value={years}
                        onChange={e => setYears(Math.max(1, +e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-[2px] h-20 px-1">
                {chartData.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                            className="w-full rounded-t bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all duration-500"
                            style={{ height: `${(val / maxVal) * 100}%`, minHeight: '2px' }}
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 px-1">
                <span>Year 0</span>
                <span>Year {years}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-emerald-600 font-medium">Total Saved</div>
                    <div className="text-lg font-bold text-emerald-700">${futureValue.toFixed(0)}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-blue-600 font-medium">Contributed</div>
                    <div className="text-lg font-bold text-blue-700">${contributed.toLocaleString()}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-purple-600 font-medium">Interest Earned</div>
                    <div className="text-lg font-bold text-purple-700">${earned.toFixed(0)}</div>
                </div>
            </div>
        </div>
    );
};


/* ─── Main Wrapper ─────────────────────────────────────────────────── */
type CalcTab = 'credit' | 'inflation' | 'savings';

interface CalculatorWidgetsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CalculatorWidgets: React.FC<CalculatorWidgetsProps> = ({ isOpen, onClose }) => {
    const [tab, setTab] = useState<CalcTab>('credit');

    if (!isOpen) return null;

    const tabs: { key: CalcTab; label: string; emoji: string }[] = [
        { key: 'credit', label: 'Credit', emoji: '💳' },
        { key: 'inflation', label: 'Inflation', emoji: '🔥' },
        { key: 'savings', label: 'Savings', emoji: '📈' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-fade-in">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        🧮 Financial Calculators
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tab bar */}
                <div className="flex border-b border-gray-100 px-6">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all
                                ${tab === t.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <span>{t.emoji}</span> {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {tab === 'credit' && <CreditCalc />}
                    {tab === 'inflation' && <InflationCalc />}
                    {tab === 'savings' && <SavingsCalc />}
                </div>
            </div>
        </div>
    );
};
