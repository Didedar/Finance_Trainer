import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { client } from '../api/client';
import {
    Calendar, Flame, CheckCircle, Plus, X,
    FileText, StopCircle, BarChart2, PiggyBank, Newspaper, Utensils,
    Smile, Zap, Target, Award, Star
} from 'lucide-react';

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, React.ReactNode> = {
    FileText: <FileText className="w-6 h-6" />,
    StopCircle: <StopCircle className="w-6 h-6" />,
    BarChart2: <BarChart2 className="w-6 h-6" />,
    PiggyBank: <PiggyBank className="w-6 h-6" />,
    Newspaper: <Newspaper className="w-6 h-6" />,
    Utensils: <Utensils className="w-6 h-6" />,
    Smile: <Smile className="w-6 h-6" />,
    Zap: <Zap className="w-6 h-6" />,
    Target: <Target className="w-6 h-6" />,
    Award: <Award className="w-6 h-6" />,
    Star: <Star className="w-6 h-6" />,
    '✅': <CheckCircle className="w-6 h-6" />, // Fallback for legacy
};

const getIcon = (name: string | null) => {
    if (!name) return <CheckCircle className="w-6 h-6" />;
    return ICON_MAP[name] || <span className="text-xl">{name}</span>; // Fallback to text/emoji if not found
};

const AVAILABLE_ICONS = ['Smile', 'Zap', 'Target', 'Award', 'Star', 'PiggyBank'];

interface Habit {
    id: number;
    habit_name: string;
    habit_emoji: string | null;
    target_days: number;
    streak_current: number;
    streak_best: number;
    completions: string[];
    is_active: boolean;
    progress_percent?: number;
}

interface Preset {
    name: string;
    emoji: string;
}

export const HabitsPage: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Smile');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { fetchHabits(); }, []);

    const fetchHabits = async () => {
        try {
            const res = await client.get('/game/habits');
            setHabits(res.data.habits);
            setPresets(res.data.presets);
        } catch { /* empty */ }
        setIsLoading(false);
    };

    const addHabit = async (name: string, emoji: string) => {
        await client.post('/game/habits', { habit_name: name, habit_emoji: emoji });
        setShowAdd(false);
        setNewName('');
        setSelectedIcon('Smile');
        fetchHabits();
    };

    const checkIn = async (habitId: number) => {
        try {
            await client.post(`/game/habits/${habitId}/check`);
            fetchHabits();
        } catch { /* already checked today */ }
    };

    const deleteHabit = async (habitId: number) => {
        await client.delete(`/game/habits/${habitId}`);
        fetchHabits();
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="max-w-2xl mx-auto animate-fade-in pb-12">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="w-10 h-10 text-blue-600" />
                    <h1 className="text-4xl font-extrabold text-gray-900">Habit Tracker</h1>
                </div>
                <p className="text-gray-500">Build financial habits in 21 days</p>
            </div>

            {/* Habits */}
            {isLoading ? (
                <p className="text-center text-gray-400 py-8">Loading…</p>
            ) : habits.length === 0 && !showAdd ? (
                <Card className="!p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <Target className="w-16 h-16 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Start Your First Habit</h2>
                    <p className="text-gray-500 mb-6">Pick a financial habit to build over 21 days.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-6">
                        {presets.map(p => (
                            <button
                                key={p.name}
                                onClick={() => addHabit(p.name, p.emoji)}
                                className="text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-3"
                            >
                                <div className="text-indigo-500">{getIcon(p.emoji)}</div>
                                <span className="text-sm font-medium text-gray-700">{p.name}</span>
                            </button>
                        ))}
                    </div>
                    <Button variant="secondary" onClick={() => setShowAdd(true)} className="flex items-center gap-2 mx-auto">
                        <Plus className="w-4 h-4" /> Custom Habit
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {habits.map(habit => {
                        const checkedToday = habit.completions.includes(today);
                        const progress = (habit.completions.length / habit.target_days) * 100;
                        const completed = habit.completions.length >= habit.target_days;

                        return (
                            <Card key={habit.id} className={`!p-5 transition-all ${completed ? 'ring-2 ring-green-300 ring-offset-2' : ''}`}>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                        ${completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {getIcon(habit.habit_emoji)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                            {habit.habit_name}
                                            {completed && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Complete!</span>}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                            <span>{habit.completions.length}/{habit.target_days} days</span>
                                            <span className="flex items-center gap-1 text-orange-500 font-medium"><Flame className="w-3 h-3" /> {habit.streak_current} streak</span>
                                            {habit.streak_best > 0 && <span className="text-gray-300">• Best: {habit.streak_best}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!checkedToday && !completed && (
                                            <Button
                                                onClick={() => checkIn(habit.id)}
                                                className="!px-4 !py-2 text-sm flex items-center gap-2"
                                            >
                                                Check In <CheckCircle className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {checkedToday && (
                                            <span className="text-green-600 text-sm font-bold px-3 py-2 flex items-center gap-1">Done <CheckCircle className="w-4 h-4" /></span>
                                        )}
                                        <button
                                            onClick={() => deleteHabit(habit.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                            title="Remove"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-green-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${Math.min(100, progress)}%` }}
                                    />
                                </div>

                                {/* Day dots */}
                                <div className="flex gap-1 mt-2 flex-wrap">
                                    {Array.from({ length: habit.target_days }, (_, i) => {
                                        const isDone = i < habit.completions.length;
                                        return (
                                            <div
                                                key={i}
                                                className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold
                                                    ${isDone ? 'bg-green-500 text-white' :
                                                        i === habit.completions.length ? 'bg-blue-200 text-blue-600 ring-2 ring-blue-300' :
                                                            'bg-gray-100 text-gray-300'}`}
                                            >
                                                {i + 1}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        );
                    })}

                    {/* Add more */}
                    {!showAdd && habits.length < 5 && (
                        <div className="text-center pt-4 space-y-3">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {presets.filter(p => !habits.some(h => h.habit_name === p.name)).map(p => (
                                    <button
                                        key={p.name}
                                        onClick={() => addHabit(p.name, p.emoji)}
                                        className="text-sm px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-2"
                                    >
                                        <span className="text-indigo-500">{getIcon(p.emoji)}</span> {p.name}
                                    </button>
                                ))}
                            </div>
                            <Button variant="secondary" onClick={() => setShowAdd(true)} className="flex items-center gap-2 mx-auto">
                                <Plus className="w-4 h-4" /> Custom Habit
                            </Button>
                        </div>
                    )}

                    {showAdd && (
                        <Card className="!p-5">
                            <h3 className="font-bold text-gray-900 mb-3">Add Custom Habit</h3>
                            <div className="flex gap-3">
                                {/* Icon Picker */}
                                <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                                    {AVAILABLE_ICONS.map(icon => (
                                        <button
                                            key={icon}
                                            onClick={() => setSelectedIcon(icon)}
                                            className={`p-2 rounded-md transition-all ${selectedIcon === icon ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {getIcon(icon)}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Save $5 daily"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                                <Button
                                    onClick={() => newName.trim() && addHabit(newName, selectedIcon)}
                                    disabled={!newName.trim()}
                                >
                                    Add
                                </Button>
                                <Button variant="secondary" onClick={() => setShowAdd(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};
