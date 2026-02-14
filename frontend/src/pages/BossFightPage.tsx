import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { client } from '../api/client';
import { Flame, Shield, TrendingDown, Skull, AlertTriangle, Swords, Trophy } from 'lucide-react';

interface BossTurn {
    battle_id: number;
    player_hp: number;
    boss_hp: number;
    damage_dealt: number;
    damage_taken: number;
    message: string;
    question: {
        q: string;
        opts: string[];
    } | null;
    is_finished: boolean;
    outcome: string | null;
}

const BOSSES = [
    { level: 1, name: "Inflation Dragon", hp: 100, icon: <Flame className="w-16 h-16 text-red-500" /> },
    { level: 2, name: "Debt Golem", hp: 150, icon: <Shield className="w-16 h-16 text-gray-500" /> },
    { level: 3, name: "Market Bear", hp: 200, icon: <TrendingDown className="w-16 h-16 text-orange-500" /> },
    { level: 4, name: "Scam Sorcerer", hp: 250, icon: <Skull className="w-16 h-16 text-purple-600" /> },
    { level: 5, name: "The Recession", hp: 300, icon: <AlertTriangle className="w-16 h-16 text-yellow-600" /> },
];

export const BossFightPage: React.FC = () => {
    const [battleState, setBattleState] = useState<BossTurn | null>(null);
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const startBattle = async () => {
        setIsLoading(true);
        try {
            const res = await client.post('/social/boss/start', { boss_level: selectedLevel });
            setBattleState({
                battle_id: res.data.battle_id,
                player_hp: res.data.player_hp,
                boss_hp: res.data.boss_hp,
                damage_dealt: 0,
                damage_taken: 0,
                message: "Battle Started!",
                question: res.data.question,
                is_finished: false,
                outcome: null,
            });
            setLog(["Battle started! Answer correctly to attack."]);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    };

    const submitAnswer = async (idx: number) => {
        if (!battleState) return;

        try {
            const res = await client.post('/social/boss/turn', {
                battle_id: battleState.battle_id,
                action_type: "answer",
                answer_idx: idx,
            });

            const newState = res.data;
            setBattleState(newState);
            setLog(prev => [newState.message, ...prev]);
        } catch (err) {
            console.error(err);
        }
    };

    if (!battleState) {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in pb-12 text-center">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-4 flex items-center justify-center gap-4">
                    <Swords className="w-12 h-12 text-red-600" /> BOSS BATTLES <Swords className="w-12 h-12 text-red-600" />
                </h1>
                <p className="text-gray-500 mb-12 text-lg">Test your knowledge against financial monsters.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {BOSSES.map(boss => (
                        <div
                            key={boss.level}
                            onClick={() => setSelectedLevel(boss.level)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 flex flex-col items-center
                                ${selectedLevel === boss.level
                                    ? 'border-red-500 bg-red-50 shadow-lg'
                                    : 'border-gray-200 hover:border-red-200'}`}
                        >
                            <div className="mb-2 p-3 bg-white rounded-full shadow-sm">{boss.icon}</div>
                            <div className="font-bold text-gray-900 text-sm">{boss.name}</div>
                            <div className="text-xs text-gray-500">Lvl {boss.level} • {boss.hp} HP</div>
                        </div>
                    ))}
                </div>

                <Button onClick={startBattle} disabled={isLoading} className="px-12 py-4 text-xl bg-red-600 hover:bg-red-700 flex items-center gap-2 mx-auto">
                    {isLoading ? 'Summoning...' : <>FIGHT! <Swords className="w-6 h-6" /></>}
                </Button>
            </div>
        );
    }

    const bossInfo = BOSSES.find(b => b.level === selectedLevel) || BOSSES[0];
    const maxBossHp = bossInfo.hp; // Simplified, ideally strictly from backend
    const maxPlayerHp = 100;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            {/* Health Bars */}
            <div className="flex justify-between items-center mb-8 gap-8">
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold text-gray-900 flex items-center gap-2"><Trophy className="w-4 h-4 text-blue-500" /> YOU</span>
                        <span className="font-mono">{battleState.player_hp}/{maxPlayerHp}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${(battleState.player_hp / maxPlayerHp) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="text-2xl font-bold text-gray-300">VS</div>

                <div className="flex-1 text-right">
                    <div className="flex justify-between mb-1">
                        <span className="font-mono">{battleState.boss_hp}/{maxBossHp}</span>
                        <span className="font-bold text-red-600 flex items-center justify-end gap-2">{bossInfo.name} <Skull className="w-4 h-4" /></span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300 relative">
                        <div
                            className="h-full bg-red-600 transition-all duration-500 absolute right-0"
                            style={{ width: `${(battleState.boss_hp / maxBossHp) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Battle Arena */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Visuals */}
                <Card className="!p-8 flex items-center justify-center bg-gray-900 min-h-[300px] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

                    {/* Boss */}
                    <div className={`transition-transform duration-300 ${battleState.damage_dealt > 0 ? 'scale-90 opacity-50' : 'scale-100'}`}>
                        <div className="transform scale-[2.0]">
                            {bossInfo.icon}
                        </div>
                    </div>

                    {/* Damage number popup effect (simplified) */}
                    {battleState.damage_dealt > 0 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100px] text-4xl font-bold text-yellow-400 animate-bounce">
                            -{battleState.damage_dealt}
                        </div>
                    )}
                </Card>

                {/* Controls / Question */}
                <div className="space-y-4">
                    {!battleState.is_finished && battleState.question ? (
                        <Card className="!p-6 border-blue-200 shadow-md h-full flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{battleState.question.q}</h3>
                            <div className="space-y-2">
                                {battleState.question.opts.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => submitAnswer(idx + 1)} // Used 1-based index in backend mock
                                        className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <Card className="!p-6 h-full flex flex-col items-center justify-center text-center">
                            <div className="text-6xl mb-4">
                                {battleState.outcome === 'won' ? '🎉' : '💀'}
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                {battleState.outcome === 'won' ? 'VICTORY!' : 'DEFEAT'}
                            </h2>
                            <p className="text-gray-500 mb-6">
                                {battleState.outcome === 'won' ? `You defeated ${bossInfo.name}!` : 'Try again stronger...'}
                            </p>
                            <Button onClick={() => setBattleState(null)}>Back to Map</Button>
                        </Card>
                    )}
                </div>
            </div>

            {/* Battle Log */}
            <div className="bg-gray-100 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs text-gray-600">
                {log.map((line, i) => (
                    <div key={i} className="mb-1 border-b border-gray-200 pb-1 last:border-0">
                        {'>'} {line}
                    </div>
                ))}
            </div>
        </div>
    );
};
