import { useState } from 'react';
import {
    AlertTriangle, Shield, Skull, CheckCircle,
    HelpCircle, ShoppingBag, TrendingUp, DollarSign,
    ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface ScenarioStep {
    text: string;
    choices: string[];
    correct: number; // Index of the safe choice
    explanation: string;
}

interface ScenarioType {
    type: string;
    title: string;
    intro: string;
    steps: ScenarioStep[];
}

const SCENARIOS: ScenarioType[] = [
    {
        type: 'scam',
        title: 'The "Bank" Call',
        intro: 'You receive a frantic call from "Bank Security". They say your account is compromised.',
        steps: [
            {
                text: 'The caller says: "We need you to verify your identity immediately by reading the code we just sent to your phone."',
                choices: [
                    'Read them the code quickly to secure the account.',
                    'Hang up and call the number on the back of your card.'
                ],
                correct: 1,
                explanation: 'Never share 2FA codes. Banks will never ask for them. Always call the official number yourself.'
            },
            {
                text: 'You hang up, but they text you a link saying: "Click here to freeze your account now!"',
                choices: [
                    'Click the link to be safe.',
                    'Ignore the text and log in to your banking app directly.'
                ],
                correct: 1,
                explanation: 'Links in unsolicited texts are often phishing attempts. Use the official app or website.'
            }
        ]
    },
    {
        type: 'impulse',
        title: 'The Flash Sale',
        intro: 'A limited-time offer for a gadget you kind of want pops up. 50% off for the next 10 minutes!',
        steps: [
            {
                text: 'The countdown timer is ticking. You have 2 minutes left!',
                choices: [
                    'Buy it now! It\'s a steal!',
                    'Wait. Do I actually need this?'
                ],
                correct: 1,
                explanation: 'Urgency is a marketing tactic. If you didn\'t plan to buy it, it\'s not a deal—it\'s spending.'
            },
            {
                text: 'You decide to wait, but now you see "Only 2 left in stock!"',
                choices: [
                    'Okay, now I have to buy it!',
                    'Close the tab and walk away.'
                ],
                correct: 1,
                explanation: 'Scarcity tactics (fake stock counters) are common to force impulse buys. Walk away.'
            }
        ]
    },
    {
        type: 'pyramid',
        title: 'The "Business Opportunity"',
        intro: 'An old friend messages you about a "revolutionary" way to make money working from home.',
        steps: [
            {
                text: 'They say: "You just need to buy a $500 starter kit, and then you get paid for everyone you recruit!"',
                choices: [
                    'Sounds easy! Where do I sign up?',
                    'Ask: "Do I make money from selling products or recruiting?"'
                ],
                correct: 1,
                explanation: 'If money comes primarily from recruiting, it\'s a pyramid scheme. Real businesses sell products.'
            },
            {
                text: 'They deflect: "Don\'t you want financial freedom? Stop being a wage slave!"',
                choices: [
                    'You\'re right. I\'m in.',
                    'Block them. This is a scam.'
                ],
                correct: 1,
                explanation: 'High-pressure emotional manipulation is a red flag. Protect your wallet and your friendships.'
            }
        ]
    },
    {
        type: 'bad_loan',
        title: 'The Payday Loan',
        intro: 'You\'re short entirely on rent this month. You see an ad for "Fast Cash, No Credit Check!"',
        steps: [
            {
                text: 'The terms say: "Borrow $500 now, pay back $575 in two weeks."',
                choices: [
                    'Take the deal. I need the money.',
                    'Calculate the APR. (It\'s nearly 400%!)'
                ],
                correct: 1,
                explanation: 'Payday loans define predatory lending. The annualized interest rate (APR) is astronomical.'
            },
            {
                text: 'You realize the interest is high, but you have no other cash. What do you do?',
                choices: [
                    'Take the loan anyway.',
                    'Call the landlord to explain and ask for an extension.'
                ],
                correct: 1,
                explanation: 'Most landlords prefer communication over eviction. Payday loans often lead to a debt spiral.'
            }
        ]
    }
];

const TRAP_ICONS: Record<string, React.ReactNode> = {
    scam: <HelpCircle className="w-8 h-8 text-orange-500" />,
    impulse: <ShoppingBag className="w-8 h-8 text-pink-500" />,
    pyramid: <TrendingUp className="w-8 h-8 text-purple-500" />,
    bad_loan: <DollarSign className="w-8 h-8 text-red-500" />,
};

type GamePhase = 'select' | 'playing' | 'result';

export const TrapsPage: React.FC = () => {
    const [phase, setPhase] = useState<GamePhase>('select');
    const [currentScenario, setCurrentScenario] = useState<ScenarioType | null>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [lastSafe, setLastSafe] = useState<boolean | null>(null);
    const [result, setResult] = useState<{ outcome: 'survived' | 'trapped', xp_earned: number } | null>(null);

    const startScenario = (type: string) => {
        const scenario = SCENARIOS.find(s => s.type === type);
        if (scenario) {
            setCurrentScenario(scenario);
            setPhase('playing');
            setStepIndex(0);
            setLastSafe(null);
            setResult(null);
        }
    };

    const makeChoice = (choiceIdx: number) => {
        if (!currentScenario) return;

        const currentStep = currentScenario.steps[stepIndex];
        const isSafe = choiceIdx === currentStep.correct;

        setLastSafe(isSafe);

        if (!isSafe) {
            // Instant fail? Or just score reduction? Let's go with "Three strikes" or just one fail = trapped?
            // To make it educational, let's say one wrong move traps you, but maybe we let them finish?
            // Let's do instant fail for high stakes feel.
            setTimeout(() => {
                finishGame('trapped');
            }, 1000);
            return;
        }

        // If safe, proceed
        if (stepIndex < currentScenario.steps.length - 1) {
            setTimeout(() => {
                setStepIndex(prev => prev + 1);
                setLastSafe(null);
            }, 1000);
        } else {
            // Survived all steps
            setTimeout(() => {
                finishGame('survived');
            }, 1000);
        }
    };

    const finishGame = (outcome: 'survived' | 'trapped') => {
        setResult({
            outcome,
            xp_earned: outcome === 'survived' ? 50 : 0
        });
        setPhase('result');
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in pb-12">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                    <h1 className="text-4xl font-extrabold text-gray-900">Financial Traps</h1>
                </div>
                <p className="text-gray-500">Can you spot the danger and survive?</p>
            </div>

            {phase === 'select' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SCENARIOS.map(t => (
                        <Card
                            key={t.type}
                            className="!p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
                            onClick={() => startScenario(t.type)}
                        >
                            <div className="flex justify-center mb-3">
                                {TRAP_ICONS[t.type] || <AlertTriangle className="w-8 h-8" />}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors text-center">
                                {t.title}
                            </h3>
                            <p className="text-sm text-gray-500 text-center">{t.intro}</p>
                        </Card>
                    ))}
                </div>
            )}

            {phase === 'playing' && currentScenario && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            {TRAP_ICONS[currentScenario.type]}
                            {currentScenario.title}
                        </h2>
                        <span className="text-sm text-gray-400">Step {stepIndex + 1}/{currentScenario.steps.length}</span>
                    </div>

                    {/* Progress */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${((stepIndex + 1) / currentScenario.steps.length) * 100}%` }}
                        />
                    </div>

                    {/* Feedback from last choice */}
                    {lastSafe !== null && (
                        <div className={`rounded-xl p-3 text-sm font-medium flex items-center gap-2 ${lastSafe ? 'bg-green-50 text-green-700 border border-green-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {lastSafe ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            {lastSafe ? 'Smart move! You avoided the trap.' : 'Careful — that was a risky choice!'}
                        </div>
                    )}

                    <Card className="!p-6">
                        <p className="text-gray-700 mb-6 leading-relaxed text-lg">{currentScenario.steps[stepIndex].text}</p>
                        <div className="space-y-3">
                            {currentScenario.steps[stepIndex].choices.map((choice, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => makeChoice(idx)}
                                    disabled={lastSafe !== null}
                                    className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm text-gray-700 font-medium flex items-center group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-indigo-500 mr-3 font-bold bg-indigo-50 w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">{idx + 1}</span>
                                    {choice}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {phase === 'result' && result && (
                <Card className="!p-8 text-center">
                    <div className="flex justify-center mb-4">
                        {result.outcome === 'survived' ? (
                            <Shield className="w-20 h-20 text-green-500" />
                        ) : (
                            <Skull className="w-20 h-20 text-red-500" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {result.outcome === 'survived' ? 'You Survived!' : 'You Got Trapped!'}
                    </h2>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        {result.outcome === 'survived'
                            ? 'Excellent! You spotted all the red flags.'
                            : 'Don\'t worry — now you know the warning signs for next time.'}
                    </p>
                    {result.outcome === 'survived' && (
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-50 text-green-700 font-bold text-sm mb-8 border border-green-100">
                            <CheckCircle className="w-4 h-4 mr-1.5" /> +{result.xp_earned} XP
                        </div>
                    )}
                    <br />
                    <Button onClick={() => setPhase('select')} className="px-8 flex items-center gap-2 mx-auto">
                        Try Another Scenario <ArrowRight className="w-4 h-4" />
                    </Button>
                </Card>
            )}
        </div>
    );
};
