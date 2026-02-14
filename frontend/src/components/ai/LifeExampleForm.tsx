import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { client } from '../../api/client';
import { marked } from 'marked';

interface LifeExampleFormProps {
    lessonId?: number;
    onClose: () => void;
}

interface PracticeQuestion {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

interface LifeExampleResult {
    example_text: string;
    explanation: string;
    practice_questions: PracticeQuestion[];
}

export const LifeExampleForm: React.FC<LifeExampleFormProps> = ({ lessonId, onClose }) => {
    const [incomeType, setIncomeType] = useState<string>('salary');
    const [amount, setAmount] = useState<string>('');
    const [frequency, setFrequency] = useState<string>('monthly');
    const [goals, setGoals] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<LifeExampleResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [practiceAnswers, setPracticeAnswers] = useState<(number | null)[]>([]);
    const [showPracticeExplanation, setShowPracticeExplanation] = useState<boolean[]>([]);

    const toggleGoal = (goal: string) => {
        setGoals(prev =>
            prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
        );
    };

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid income amount.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await client.post('/ai/life-example', {
                income_type: incomeType,
                amount: parseFloat(amount),
                frequency,
                goals,
                lesson_id: lessonId,
            });
            setResult(response.data);
            setPracticeAnswers(new Array(response.data.practice_questions?.length || 0).fill(null));
            setShowPracticeExplanation(new Array(response.data.practice_questions?.length || 0).fill(false));
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to generate example.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePracticeAnswer = (qIdx: number, answerIdx: number) => {
        if (showPracticeExplanation[qIdx]) return;
        const newAnswers = [...practiceAnswers];
        newAnswers[qIdx] = answerIdx;
        setPracticeAnswers(newAnswers);
        const newShow = [...showPracticeExplanation];
        newShow[qIdx] = true;
        setShowPracticeExplanation(newShow);
    };

    const incomeTypes = [
        { value: 'scholarship', label: '🎓 Scholarship', },
        { value: 'allowance', label: '👨‍👩‍👧 Allowance' },
        { value: 'salary', label: '💼 Salary' },
        { value: 'freelance', label: '🖥️ Freelance' },
        { value: 'other', label: '📦 Other' },
    ];

    const goalOptions = ['save', 'buy something', 'pay off debt', 'invest', 'travel', 'emergency fund'];

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto !p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">📝 Example from Your Life</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Get a personalized financial example</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/60 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {!result ? (
                    /* Form */
                    <div className="p-6 space-y-5">
                        {/* Income Type */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Type of income</label>
                            <div className="flex flex-wrap gap-2">
                                {incomeTypes.map(it => (
                                    <button
                                        key={it.value}
                                        onClick={() => setIncomeType(it.value)}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${incomeType === it.value
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        {it.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount + Frequency */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Amount ($)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="e.g. 2000"
                                    className="input-field"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Frequency</label>
                                <select
                                    value={frequency}
                                    onChange={e => setFrequency(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>

                        {/* Goals */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Goals (optional)</label>
                            <div className="flex flex-wrap gap-2">
                                {goalOptions.map(goal => (
                                    <button
                                        key={goal}
                                        onClick={() => toggleGoal(goal)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${goals.includes(goal)
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        {goal}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={onClose} className="text-sm">Cancel</Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={isLoading || !amount}
                                className="text-sm"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                        Generating...
                                    </span>
                                ) : '✨ Generate My Example'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Result */
                    <div className="p-6 space-y-5">
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: marked(result.example_text, { breaks: true, gfm: true }) }}
                        />

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <h4 className="text-sm font-bold text-blue-800 mb-2">💡 Why this matters for you</h4>
                            <div
                                className="prose prose-sm max-w-none text-blue-700"
                                dangerouslySetInnerHTML={{ __html: marked(result.explanation, { breaks: true, gfm: true }) }}
                            />
                        </div>

                        {/* Practice Questions */}
                        {result.practice_questions.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-800 mb-3">🎯 Practice Questions</h4>
                                <div className="space-y-4">
                                    {result.practice_questions.map((q, qIdx) => (
                                        <div key={qIdx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="font-medium text-sm text-gray-800 mb-3">{q.question}</p>
                                            <div className="space-y-2">
                                                {q.options.map((opt, oIdx) => {
                                                    let cls = 'w-full text-left text-sm p-2.5 rounded-lg border transition-all ';
                                                    if (showPracticeExplanation[qIdx]) {
                                                        if (oIdx === q.correct_index) cls += 'border-green-400 bg-green-50 text-green-700';
                                                        else if (oIdx === practiceAnswers[qIdx]) cls += 'border-red-400 bg-red-50 text-red-700';
                                                        else cls += 'border-gray-200 text-gray-400';
                                                    } else {
                                                        cls += 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700';
                                                    }
                                                    return (
                                                        <button key={oIdx} className={cls} onClick={() => handlePracticeAnswer(qIdx, oIdx)}>
                                                            {String.fromCharCode(65 + oIdx)}. {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {showPracticeExplanation[qIdx] && (
                                                <div className={`mt-3 p-3 rounded-lg text-sm ${practiceAnswers[qIdx] === q.correct_index
                                                        ? 'bg-green-50 text-green-700 border border-green-100'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                    {practiceAnswers[qIdx] === q.correct_index ? '✅ ' : '💡 '}
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setResult(null)} className="text-sm">
                                🔄 Try Different Inputs
                            </Button>
                            <Button variant="primary" onClick={onClose} className="text-sm">Done</Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
