import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { LiquidLoader } from '../components/ui/LiquidLoader';
import { client } from '../api/client';
import {
    Map, Lock, CheckCircle, Play, BookOpen,
    Wallet, CreditCard, TrendingUp, Building, Crown,
    ChevronRight
} from 'lucide-react';

// level zone colors
const ZONE_COLORS: Record<number, { bg: string; border: string; text: string; accent: string; gradient: string }> = {
    1: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500', gradient: 'from-emerald-400 to-green-500' },
    2: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500', gradient: 'from-blue-400 to-indigo-500' },
    3: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'bg-purple-500', gradient: 'from-purple-400 to-violet-500' },
    4: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500', gradient: 'from-amber-400 to-orange-500' },
    5: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', accent: 'bg-rose-500', gradient: 'from-rose-400 to-pink-500' },
};

const ZONE_ICONS: Record<number, React.ReactNode> = {
    1: <Wallet className="w-6 h-6 text-white" />,
    2: <CreditCard className="w-6 h-6 text-white" />,
    3: <TrendingUp className="w-6 h-6 text-white" />,
    4: <Building className="w-6 h-6 text-white" />,
    5: <Crown className="w-6 h-6 text-white" />,
};

export const LecturesPage: React.FC = () => {
    const navigate = useNavigate();
    const [structure, setStructure] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await client.get('/lessons');
                setStructure(response.data);
            } catch (error) {
                console.error('Failed to fetch lessons:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLessons();
    }, []);

    if (isLoading) {
        return (
            <LiquidLoader
                message="Loading curriculum..."
                subtext="Preparing your quest map"
                size="md"
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            {/* Hero Header */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Map className="w-10 h-10 text-blue-600" />
                    <h1 className="text-4xl font-extrabold text-gray-900">Quest Map</h1>
                </div>
                <p className="text-gray-500">Complete quests to level up your financial mastery</p>
            </div>

            <div className="space-y-10">
                {structure?.levels?.map((level: any) => {
                    const zoneColor = ZONE_COLORS[level.level_number] || ZONE_COLORS[1];
                    const ZoneIcon = ZONE_ICONS[level.level_number] || <Map className="w-6 h-6 text-white" />;
                    const totalLessons = level.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);
                    const completedLessons = level.modules.reduce((sum: number, m: any) =>
                        sum + m.lessons.filter((l: any) => l.is_completed).length, 0);
                    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

                    return (
                        <div key={level.level_number} className="relative">
                            {/* Zone Header */}
                            <div className={`flex items-center gap-4 mb-5 ${level.is_locked ? 'opacity-50' : ''}`}>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${zoneColor.gradient} flex items-center justify-center shadow-lg ${level.is_locked ? 'grayscale' : ''}`}>
                                    {level.is_locked ? <Lock className="w-6 h-6 text-white" /> : ZoneIcon}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        {level.level_title}
                                        {progress === 100 && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                <CheckCircle className="w-3 h-3" /> CLEARED
                                            </span>
                                        )}
                                    </h2>
                                    {!level.is_locked && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-48">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${zoneColor.gradient} transition-all duration-700`}
                                                    style={{ width: `\${progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">
                                                {completedLessons}/{totalLessons}
                                            </span>
                                        </div>
                                    )}
                                    {level.is_locked && (
                                        <span className="text-sm text-gray-400 flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Complete previous level to unlock
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Modules */}
                            <div className={`space-y-4 ml-7 pl-6 border-l-2 ${level.is_locked ? 'border-gray-200 opacity-40 pointer-events-none select-none grayscale' : `\${zoneColor.border}`}`}>
                                {level.modules.map((module: any) => {
                                    const allModuleCompleted = module.lessons.length > 0 &&
                                        module.lessons.every((lesson: any) => lesson.is_completed);

                                    return (
                                        <Card
                                            key={module.module_number}
                                            className={`!p-0 overflow-hidden transition-all duration-300 ${allModuleCompleted ? `ring-2 ring-offset-2 \${zoneColor.border.replace('border-', 'ring-')}` : ''}`}
                                        >
                                            {/* Module Header */}
                                            <div className={`px-5 py-3 border-b flex items-center justify-between ${allModuleCompleted ? `\${zoneColor.bg} \${zoneColor.border}` : 'bg-gray-50 border-gray-100'}`}>
                                                <h3 className={`font-semibold text-sm flex items-center gap-2 ${allModuleCompleted ? zoneColor.text : 'text-gray-700'}`}>
                                                    {allModuleCompleted && <CheckCircle className="w-4 h-4" />}{module.module_title}
                                                </h3>
                                                <span className="text-xs text-gray-400">
                                                    {module.lessons.filter((l: any) => l.is_completed).length}/{module.lessons.length} quests
                                                </span>
                                            </div>

                                            {/* Quest Cards */}
                                            <div className="divide-y divide-gray-50">
                                                {module.lessons.map((lesson: any) => (
                                                    <div
                                                        key={lesson.id}
                                                        className={`px-5 py-3.5 flex items-center gap-3 cursor-pointer group transition-all duration-200
                                                            ${lesson.is_completed
                                                                ? 'hover:bg-gray-50'
                                                                : `hover:\${zoneColor.bg} hover:shadow-sm`
                                                            }`}
                                                        onClick={() => !level.is_locked && navigate(`/app/lessons/${lesson.id}`)}
                                                    >
                                                        {/* Quest Icon */}
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
                                                            ${lesson.is_completed
                                                                ? 'bg-green-100 text-green-600'
                                                                : `\${zoneColor.bg} \${zoneColor.text}`
                                                            }`}
                                                        >
                                                            {lesson.is_completed ? <CheckCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                                        </div>

                                                        {/* Quest Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`font-medium text-sm truncate ${lesson.is_completed ? 'text-gray-400 line-through' : 'text-gray-800 group-hover:text-gray-900'}`}>
                                                                {lesson.title}
                                                            </div>
                                                            {lesson.quest_hook && !lesson.is_completed && (
                                                                <div className="text-xs text-indigo-500 font-medium truncate mt-0.5 italic flex items-center gap-1">
                                                                    <Play className="w-3 h-3" /> {lesson.quest_hook}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Status */}
                                                        {lesson.is_completed ? (
                                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 shrink-0">
                                                                Done
                                                            </span>
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all shrink-0" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
