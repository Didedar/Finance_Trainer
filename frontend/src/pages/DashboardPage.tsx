import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { client } from '../api/client';
import { LiquidLoader } from '../components/ui/LiquidLoader';

import {
    Zap, Flame, TrendingUp,
    ArrowUpRight, ArrowDownLeft, PlusCircle, Award
} from 'lucide-react';

const TITLE_TRANSLATIONS: { [key: string]: string } = {
    'Новичок': 'Novice',
    'Уверенный': 'Confident',
    'Стратег': 'Strategist',
    'Инвестор': 'Investor',
    'Мастер': 'Master'
};

const getEnglishTitle = (title: string) => {
    return TITLE_TRANSLATIONS[title] || title;
};

export const DashboardPage: React.FC = () => {
    useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await client.get('/progress/summary');
                setSummary(response.data);
            } catch (error) {
                console.error('Failed to fetch summary:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (isLoading) {
        return (
            <LiquidLoader
                message="Loading your wallet..."
                subtext="Checking balances"
                size="md"
            />
        );
    }

    return (
        <div className="w-full space-y-6 animate-fade-in-up pb-8 pt-6">
            {/* Wallet Header */}
            <div className="text-center pb-2">
                <div className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-widest">Total Balance</div>
                <div className="text-6xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-1">
                    {summary?.total_xp || 0} <span className="text-3xl text-[hsl(var(--primary))] font-medium">₸</span>
                </div>
                <div className="text-[hsl(var(--secondary))] text-sm font-medium flex items-center justify-center gap-1 mt-3">
                    <TrendingUp className="w-4 h-4" /> +{(summary?.total_xp || 0) > 0 ? 150 : 0} ₸ this week
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center gap-8 px-4 py-4">
                <button className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center justify-center text-white group-hover:scale-105 transition-transform hover:border-[hsl(var(--primary))]">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-gray-400">Send</span>
                </button>
                <button className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center justify-center text-white group-hover:scale-105 transition-transform hover:border-[hsl(var(--primary))]">
                        <ArrowDownLeft className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-gray-400">Receive</span>
                </button>
                <button onClick={() => navigate('/app/lectures')} className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.6)] group-hover:scale-105 transition-transform">
                        <PlusCircle className="w-6 h-6 text-[hsl(var(--secondary))]" />
                    </div>
                    <span className="text-xs font-bold text-[hsl(var(--secondary))]">Earn</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 px-4">
                <div className="card p-4 flex flex-col justify-between items-start">
                    <div className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" /> Streak
                    </div>
                    <div className="text-2xl font-bold">{summary?.streak_days || 0} days</div>
                </div>
                <div className="card p-4 flex flex-col justify-between items-start">
                    <div className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1">
                        <Award className="w-4 h-4 text-[hsl(var(--primary))]" /> Title
                    </div>
                    <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                        {getEnglishTitle(summary?.current_title || 'Novice')}
                    </div>
                </div>
            </div>

            {/* Quests/Journey */}
            <div className="px-4 pt-2">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-lg font-bold">Active Quests</h2>
                    <button onClick={() => navigate('/app/lectures')} className="text-xs text-[hsl(var(--primary))] font-medium uppercase tracking-wider">See all</button>
                </div>
                <div className="space-y-3">
                    {summary?.level_progress?.slice(0, 3).map((level: any) => (
                        <div
                            key={level.level}
                            onClick={() => !level.is_locked && navigate('/app/lectures')}
                            className={`card p-4 flex items-center gap-4 transition-all
                                ${level.is_locked ? 'opacity-50' : 'cursor-pointer border-l-2 border-l-[hsl(var(--primary))]'}
                            `}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border border-[hsl(var(--border))]
                ${level.is_locked ? 'bg-[hsl(var(--background))] text-gray-600' : 'bg-[hsl(var(--background))] text-[hsl(var(--secondary))]'}
                            `}>
                                Lvl {level.level}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm mb-2 text-white">{level.level_title}</div>
                                <div className="h-1.5 bg-[hsl(var(--background))] rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full" style={{ width: `${level.progress_percent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions / Activity */}
            <div className="px-4 pt-2">
                <h2 className="text-lg font-bold mb-4">Transactions</h2>
                <div className="card p-4 border border-[hsl(var(--border))]">
                    {summary?.recent_activity?.length > 0 ? (
                        <div className="space-y-1">
                            {summary.recent_activity.map((activity: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center border-b border-[hsl(var(--border))] last:border-0 py-3 last:pb-0 first:pt-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center text-[hsl(var(--primary))]">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-white mb-0.5">{activity.lesson_title}</div>
                                            <div className="text-xs text-gray-500">{new Date(activity.completed_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-[hsl(var(--secondary))]">
                                        +{activity.xp_earned} ₸
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-6 text-sm">
                            No transactions yet.<br /><span onClick={() => navigate('/app/lectures')} className="text-[hsl(var(--primary))] cursor-pointer mt-2 inline-block font-medium">Complete a quest to earn</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
