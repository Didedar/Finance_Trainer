import React, { useEffect, useState } from 'react';
import { client } from '../api/client';
import { CheckCircle, Lock, Trophy } from 'lucide-react';

const TITLES = [
    { xp: 0, name: "Novice", desc: "You are just starting your journey." },
    { xp: 200, name: "Confident", desc: "You know the basics and manage your budget." },
    { xp: 500, name: "Strategist", desc: "You understand risks and long-term goals." },
    { xp: 900, name: "Investor", desc: "Your money starts working for you." },
    { xp: 1400, name: "Master", desc: "Financial freedom is your reality." },
];

export const AchievementsPage: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        client.get('/progress/summary').then(res => setSummary(res.data)).catch(console.error);
    }, []);

    const currentXP = summary?.total_xp || 0;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Achievements & Titles</h1>
                </div>
                <div className="inline-block bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm">
                    <span className="text-gray-500 mr-2">Your Current XP:</span>
                    <span className="text-2xl font-bold text-blue-600">{currentXP}</span>
                </div>
            </div>

            <div className="grid gap-6">
                {TITLES.map((title, index) => {
                    const isUnlocked = currentXP >= title.xp;
                    const isNext = !isUnlocked && (index === 0 || currentXP >= TITLES[index - 1].xp);

                    return (
                        <div
                            key={index}
                            className={`relative overflow-hidden rounded-2xl border transition-all duration-300
                ${isUnlocked
                                    ? 'bg-white border-blue-200 shadow-md'
                                    : 'bg-gray-50 border-gray-200 opacity-70 grayscale'
                                }
              `}
                        >
                            <div className="p-6 flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2
                  ${isUnlocked
                                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                                        : 'bg-gray-100 border-gray-200 text-gray-300'
                                    }`}
                                >
                                    {isUnlocked ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <Lock className="w-6 h-6" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-xl font-bold">{title.name}</h3>
                                        <span className="font-mono font-medium text-gray-400">{title.xp} XP</span>
                                    </div>
                                    <p className="text-gray-600">{title.desc}</p>

                                    {isNext && (
                                        <div className="mt-4">
                                            <div className="text-xs text-blue-500 font-medium mb-1">
                                                Progress: {currentXP} / {title.xp}
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${Math.min((currentXP / title.xp) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isUnlocked && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent -mr-8 -mt-8 rounded-full blur-xl pointer-events-none"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
