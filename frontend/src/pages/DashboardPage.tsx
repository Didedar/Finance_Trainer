import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { client } from '../api/client';
import { LiquidLoader } from '../components/ui/LiquidLoader';

import {
    Zap, Flame, BookOpen, TrendingUp, Lock, ChevronRight,
    Calendar, Award, Trophy
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
    const { user } = useAuth();
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
                message="Loading your progress..."
                subtext="Preparing your dashboard"
                size="md"
            />
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up container-custom py-8">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                        Welcome back, <span className="text-gradient">{user?.name}</span>
                    </h1>
                    <p className="text-gray-500 text-lg">Ready to master your finances today?</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-full shadow-sm border border-gray-100">
                    <div className="p-2 bg-blue-50 rounded-full">
                        <Trophy className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Current Title</div>
                        <div className="text-lg font-bold text-blue-600">{getEnglishTitle(summary?.current_title || 'Novice')}</div>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white !border-none p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500"></div>

                    <div className="relative z-10">
                        <div className="text-blue-100 text-sm font-medium mb-1 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Total XP
                        </div>
                        <div className="text-4xl font-bold mb-4">{summary?.total_xp || 0}</div>
                        <div className="h-1.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                style={{ width: `${Math.min(((summary?.total_xp || 0) % 1000) / 10, 100)}%` }}
                            ></div>
                        </div>
                        <div className="mt-3 text-xs text-blue-100 flex justify-between font-medium">
                            <span>Next Level</span>
                            <span>{summary?.xp_for_next_title || 200} XP remaining</span>
                        </div>
                    </div>
                </div>

                <div className="card p-6 flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" /> Day Streak
                        </div>
                        <div className="text-4xl font-bold mb-1 flex items-center gap-2">
                            {summary?.streak_days || 0}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 bg-orange-50 text-orange-600 px-3 py-1 rounded-full inline-block w-max">
                        Keep it up!
                    </p>
                </div>

                <div className="card p-6 flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-500" /> Lessons Completed
                        </div>
                        <div className="text-4xl font-bold mb-1">
                            {summary?.lessons_completed || 0}
                            <span className="text-xl text-gray-300 font-normal ml-2">/ 75</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        {summary?.modules_completed || 0} modules finished
                    </p>
                </div>

                <div className="card p-6 flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" /> Current Level
                        </div>
                        <div className="text-4xl font-bold mb-1 text-gradient">
                            Level {summary?.level_progress?.find((l: any) => l.progress_percent < 100)?.level || 1}
                        </div>
                    </div>
                    <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block w-max font-medium mt-4">
                        Intermediate
                    </p>
                </div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Level Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight">Your Journey</h2>
                    <div className="space-y-4">
                        {summary?.level_progress?.map((level: any) => (
                            <div
                                key={level.level}
                                onClick={() => !level.is_locked && navigate('/app/lectures')}
                                className={`card p-4 flex items-center gap-5 transition-all
                                    ${level.is_locked ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-blue-50/50 hover:shadow-md hover:scale-[1.01]'}
                                `}
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm
                    ${level.is_locked ? 'bg-gray-100 text-gray-400 opacity-50' :
                                        level.progress_percent === 100 ? 'bg-green-100 text-green-600' :
                                            'bg-blue-100 text-blue-600'}`}
                                >
                                    {level.is_locked ? (
                                        <Lock className="w-6 h-6" />
                                    ) : level.level}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <span className={`font-bold ${level.is_locked ? 'text-gray-400' : 'text-gray-900'}`}>
                                            {level.level_title}
                                        </span>
                                        <span className="text-sm font-medium text-gray-500">
                                            {level.is_locked ? 'Locked' : `${level.completed_lessons} / ${level.total_lessons} completed`}
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${level.is_locked ? 'bg-gray-300' :
                                                level.progress_percent === 100 ? 'bg-green-500' : 'bg-blue-600'
                                                }`}
                                            style={{ width: `${level.progress_percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {!level.is_locked && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Activity</h2>
                    <div className="card p-6 min-h-[300px]">
                        {summary?.recent_activity?.length > 0 ? (
                            <div className="space-y-6">
                                {summary.recent_activity.map((activity: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 relative pl-4 border-l-2 border-gray-100 last:border-0 pb-6 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-100 border-2 border-white ring-1 ring-blue-500/20"></div>
                                        <div>
                                            <div className="font-semibold text-gray-900 leading-none mb-1">{activity.lesson_title}</div>
                                            <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {new Date(activity.completed_at).toLocaleDateString()}
                                            </div>
                                            <div className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium">
                                                <Award className="w-3 h-3 mr-1" /> +{activity.xp_earned} XP
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-10">
                                No activity yet. Start your first lesson!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
