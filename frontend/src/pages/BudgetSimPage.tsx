import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { client } from '../api/client';
import {
    Wallet, Calculator, ArrowRight, TrendingDown,
    Home, Pizza, Car, Sparkles, Gamepad, Lightbulb, Box, ThumbsUp, Star
} from 'lucide-react';

const CATEGORIES = ['Rent', 'Food', 'Transport', 'Savings', 'Entertainment', 'Utilities', 'Other'];
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    Rent: <Home className="w-4 h-4" />,
    Food: <Pizza className="w-4 h-4" />,
    Transport: <Car className="w-4 h-4" />,
    Savings: <Wallet className="w-4 h-4" />,
    Entertainment: <Gamepad className="w-4 h-4" />,
    Utilities: <Lightbulb className="w-4 h-4" />,
    Other: <Box className="w-4 h-4" />,
};

type Phase = 'setup' | 'allocate' | 'result';

export const BudgetSimPage: React.FC = () => {
    const [phase, setPhase] = useState<Phase>('setup');
    const [income, setIncome] = useState(3500);
    const [scenarioId, setScenarioId] = useState(0);
    const [scenarioText, setScenarioText] = useState('');
    const [allocations, setAllocations] = useState<Record<string, number>>({});
    const [result, setResult] = useState<any>(null);

    const startScenario = async () => {
        const res = await client.post('/game/budget/start', { monthly_income: income });
        setScenarioId(res.data.id);
        setScenarioText(res.data.scenario_text);
        const initial: Record<string, number> = {};
        CATEGORIES.forEach(c => initial[c] = 0);
        setAllocations(initial);
        setPhase('allocate');
    };

    const submitBudget = async () => {
        const res = await client.post(`/game/budget/${scenarioId}/submit`, {
            scenario_id: scenarioId,
            allocations,
        });
        setResult(res.data);
        setPhase('result');
    };

    const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
    const remaining = income - totalAllocated;

    return (
        <div className="max-w-2xl mx-auto animate-fade-in pb-12">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Wallet className="w-10 h-10 text-gray-900" />
                    <h1 className="text-4xl font-extrabold text-gray-900">Budget Simulator</h1>
                </div>
                <p className="text-gray-500">Practice allocating a real budget with AI-generated scenarios</p>
            </div>

            {phase === 'setup' && (
                <Card className="!p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <Calculator className="w-16 h-16 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Set Your Monthly Income</h2>
                    <div className="max-w-xs mx-auto mb-6">
                        <input
                            type="number"
                            value={income}
                            onChange={e => setIncome(+e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl font-bold text-gray-900"
                        />
                        <span className="text-sm text-gray-400">$/month</span>
                    </div>
                    <Button onClick={startScenario} className="px-8 py-3 text-lg flex items-center gap-2 mx-auto">
                        Start Scenario <ArrowRight className="w-5 h-5" />
                    </Button>
                </Card>
            )}

            {phase === 'allocate' && (
                <div className="space-y-6">
                    <Card className="!p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Your Scenario
                        </h3>
                        <p className="text-sm text-blue-700">{scenarioText}</p>
                    </Card>

                    <Card className="!p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Allocate Your Budget</h3>
                            <div className={`text-sm font-bold px-3 py-1 rounded-full ${Math.abs(remaining) < 1 ? 'bg-green-100 text-green-700' :
                                remaining > 0 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                ${remaining.toFixed(0)} {remaining > 0 ? 'left' : remaining < 0 ? 'over!' : '✓'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {CATEGORIES.map(cat => {
                                const pct = income > 0 ? (allocations[cat] / income) * 100 : 0;
                                return (
                                    <div key={cat}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <span className="text-gray-500">{CATEGORY_ICONS[cat]}</span> {cat}
                                            </span>
                                            <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min={0}
                                                max={income}
                                                step={50}
                                                value={allocations[cat]}
                                                onChange={e => setAllocations({ ...allocations, [cat]: +e.target.value })}
                                                className="flex-1 h-2 accent-blue-600"
                                            />
                                            <input
                                                type="number"
                                                value={allocations[cat]}
                                                onChange={e => setAllocations({ ...allocations, [cat]: +e.target.value })}
                                                className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm text-right"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Budget bar */}
                        <div className="mt-6 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                            {CATEGORIES.map(cat => {
                                const pct = income > 0 ? (allocations[cat] / income) * 100 : 0;
                                if (pct <= 0) return null;
                                return (
                                    <div
                                        key={cat}
                                        className="h-full transition-all duration-300"
                                        style={{
                                            width: `${pct}%`,
                                            backgroundColor: `hsl(${CATEGORIES.indexOf(cat) * 50}, 60%, 60%)`,
                                        }}
                                        title={`${cat}: $${allocations[cat]}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {CATEGORIES.map((cat, i) => (
                                <span key={cat} className="text-[10px] flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${i * 50}, 60%, 60%)` }} />
                                    {cat}
                                </span>
                            ))}
                        </div>

                        <div className="mt-6">
                            <Button
                                onClick={submitBudget}
                                disabled={Math.abs(remaining) > income * 0.05}
                                className="w-full py-3 text-lg flex items-center justify-center gap-2"
                            >
                                Submit Budget <ArrowRight className="w-5 h-5" />
                            </Button>
                            {Math.abs(remaining) > income * 0.05 && (
                                <p className="text-xs text-red-500 text-center mt-2">
                                    Budget must be within 5% of income to submit
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {phase === 'result' && result && (
                <Card className="!p-8 text-center">
                    <div className="flex justify-center mb-4">
                        {result.score >= 80 ? <Star className="w-16 h-16 text-yellow-500" /> :
                            result.score >= 50 ? <ThumbsUp className="w-16 h-16 text-blue-500" /> :
                                <TrendingDown className="w-16 h-16 text-red-500" />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Score: {result.score}/100</h2>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">{result.feedback}</p>

                    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
                        <div className="bg-blue-50 rounded-xl p-3">
                            <div className="text-xs text-blue-600">Savings Rate</div>
                            <div className="font-bold text-blue-700">{result.savings_percent}%</div>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3">
                            <div className="text-xs text-amber-600">Rent Ratio</div>
                            <div className="font-bold text-amber-700">{result.rent_percent}%</div>
                        </div>
                    </div>

                    <Button onClick={() => setPhase('setup')} className="px-8">
                        Try Again
                    </Button>
                </Card>
            )}
        </div>
    );
};
