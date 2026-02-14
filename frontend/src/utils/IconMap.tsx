import React from 'react';
import {
    Swords, Trophy, Star, CheckCircle, TrendingUp, TrendingDown,
    AlertTriangle, Calendar, Flame, DollarSign, Target,
    Shield, Skull, User, Bot, Crown, Sparkles, Zap, Ghost,
    Briefcase, PieChart
} from 'lucide-react';

export const IconMap: Record<string, React.ReactNode> = {
    // General
    '✅': <CheckCircle className="w-5 h-5 text-green-500" />,
    '❌': <AlertTriangle className="w-5 h-5 text-red-500" />,
    '⚠️': <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    '🔥': <Flame className="w-5 h-5 text-orange-500" />,
    '📅': <Calendar className="w-5 h-5 text-blue-500" />,
    '💰': <DollarSign className="w-5 h-5 text-green-600" />,
    '📈': <TrendingUp className="w-5 h-5 text-green-500" />,
    '📉': <TrendingDown className="w-5 h-5 text-red-500" />,
    '🔮': <Sparkles className="w-5 h-5 text-purple-500" />,
    '🛡️': <Shield className="w-5 h-5 text-blue-600" />,

    // Duels
    '⚔️': <Swords className="w-5 h-5" />,
    '🏆': <Trophy className="w-5 h-5 text-yellow-500" />,
    '👑': <Crown className="w-5 h-5 text-yellow-600" />,

    // Traps
    '🪤': <AlertTriangle className="w-5 h-5 text-amber-600" />,
    '☠️': <Skull className="w-5 h-5 text-gray-700" />,
    '💀': <Skull className="w-5 h-5 text-gray-700" />,

    // Budget
    '🏠': <Target className="w-5 h-5 text-indigo-500" />, // Using Target for "Home"/Goals roughly
    '🍔': <PieChart className="w-5 h-5 text-orange-400" />,
    '🚗': <Briefcase className="w-5 h-5 text-slate-500" />,

    // Avatars
    '👤': <User className="w-6 h-6" />,
    '🤖': <Bot className="w-6 h-6" />,
    '🧙‍♂️': <Sparkles className="w-6 h-6" />,
    '🎩': <Briefcase className="w-6 h-6" />,

    // Bosses
    '🐉': <Ghost className="w-8 h-8 text-red-600" />,
    '🗿': <Shield className="w-8 h-8 text-stone-500" />,
    '🐻': <TrendingDown className="w-8 h-8 text-red-700" />,
    '🧙‍♀️': <Zap className="w-8 h-8 text-purple-600" />,
};

export const getIcon = (key: string, className?: string) => {
    // If the key exists in our map, return it (cloned with new class if needed)
    // For now, simpler to just return the component or a fallback
    // But since we want "professional", we should probably return a Lucide icon
    // for specific keywords too.

    if (IconMap[key]) return IconMap[key];

    return <Star className={`w-5 h-5 ${className || ''}`} />;
};

// Helper to wrap text that might contain emojis and replace them?
// Or just export specific icons for pages to use directly.
