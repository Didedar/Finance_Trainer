import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { client } from '../api/client';
import { Swords, Users, Plus, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';

interface DuelData {
    id: number;
    invite_code: string;
    challenger_name: string | null;
    opponent_name: string | null;
    level: number;
    status: string;
    challenger_score: number;
    opponent_score: number;
    winner_id: number | null;
    questions_json: string | null;
}

export const DuelsPage: React.FC = () => {
    const [duels, setDuels] = useState<DuelData[]>([]);
    const [joinCode, setJoinCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeDuel, setActiveDuel] = useState<DuelData | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [level, setLevel] = useState(1);

    useEffect(() => { fetchDuels(); }, []);

    const fetchDuels = async () => {
        try {
            const res = await client.get('/game/duels/my');
            setDuels(res.data);
        } catch { /* empty */ }
        setIsLoading(false);
    };

    const createDuel = async () => {
        const res = await client.post('/game/duels/create', { level });
        setDuels([res.data, ...duels]);
    };

    const joinDuel = async () => {
        if (!joinCode.trim()) return;
        const res = await client.post('/game/duels/join', { invite_code: joinCode.trim() });
        setActiveDuel(res.data);
        setQuizAnswers([]);
        setCurrentQ(0);
        setShowResult(false);
    };

    const startPlay = (duel: DuelData) => {
        setActiveDuel(duel);
        setQuizAnswers([]);
        setCurrentQ(0);
        setShowResult(false);
    };

    const answerQuestion = async (answerIdx: number) => {
        if (!activeDuel?.questions_json) return;
        const questions = JSON.parse(activeDuel.questions_json);
        const newAnswers = [...quizAnswers, answerIdx];
        setQuizAnswers(newAnswers);

        if (currentQ + 1 >= questions.length) {
            // Calculate score
            const score = newAnswers.reduce((acc, a, i) =>
                acc + (a === questions[i].answer ? 1 : 0), 0);
            await client.post(`/game/duels/${activeDuel.id}/submit`, {
                duel_id: activeDuel.id, score,
            });
            setShowResult(true);
            fetchDuels();
        } else {
            setCurrentQ(currentQ + 1);
        }
    };

    if (activeDuel && !showResult) {
        const questions = JSON.parse(activeDuel.questions_json || '[]');
        const q = questions[currentQ];
        if (!q) return null;

        return (
            <div className="max-w-2xl mx-auto animate-fade-in pb-12">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setActiveDuel(null)} className="text-gray-400 hover:text-gray-600">
                        ← Back
                    </button>
                    <span className="text-sm font-medium text-gray-500">
                        Question {currentQ + 1} / {questions.length}
                    </span>
                </div>

                <Card className="!p-8">
                    <div className="mb-2 flex justify-between items-center">
                        <span className="text-xs text-indigo-600 font-bold uppercase">Duel Quiz</span>
                        <div className="h-2 flex-1 mx-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all"
                                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">{q.q}</h2>
                    <div className="space-y-3">
                        {q.options.map((opt: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => answerQuestion(idx)}
                                className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-gray-700 font-medium"
                            >
                                <span className="text-indigo-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                                {opt}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    if (showResult && activeDuel) {
        const questions = JSON.parse(activeDuel.questions_json || '[]');
        const score = quizAnswers.reduce((acc, a, i) =>
            acc + (a === questions[i].answer ? 1 : 0), 0);

        return (
            <div className="max-w-md mx-auto animate-fade-in text-center pb-12">
                <Card className="!p-8">
                    <div className="flex justify-center mb-4">
                        {score === questions.length ? (
                            <Trophy className="w-16 h-16 text-yellow-500" />
                        ) : score > questions.length / 2 ? (
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        ) : (
                            <XCircle className="w-16 h-16 text-red-400" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Duel Complete!</h2>
                    <p className="text-4xl font-bold text-indigo-600 mb-2">{score} / {questions.length}</p>
                    <p className="text-gray-500 mb-6">Waiting for your opponent…</p>
                    <Button onClick={() => { setActiveDuel(null); setShowResult(false); }}>
                        Back to Duels
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in pb-12">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Swords className="w-10 h-10 text-indigo-600" />
                    <h1 className="text-4xl font-extrabold text-gray-900">Quiz Duels</h1>
                </div>
                <p className="text-gray-500">Challenge a friend to a 1v1 finance quiz!</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Card className="!p-5">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create a Duel
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                        <label className="text-sm text-gray-500">Difficulty:</label>
                        <select
                            value={level}
                            onChange={e => setLevel(+e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                        >
                            <option value={1}>Level 1 — Basics</option>
                            <option value={2}>Level 2 — Intermediate</option>
                            <option value={3}>Level 3 — Advanced</option>
                        </select>
                    </div>
                    <Button onClick={createDuel} className="w-full flex items-center justify-center gap-2">
                        <Swords className="w-4 h-4" /> Create Duel
                    </Button>
                </Card>

                <Card className="!p-5">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Join a Duel
                    </h3>
                    <div className="flex gap-2">
                        <input
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Enter invite code"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase tracking-widest font-mono"
                        />
                        <Button onClick={joinDuel}>Join</Button>
                    </div>
                </Card>
            </div>

            {/* My Duels */}
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Duels</h2>
            {isLoading ? (
                <p className="text-center text-gray-400 py-8">Loading…</p>
            ) : duels.length === 0 ? (
                <Card className="!p-8 text-center">
                    <div className="flex justify-center mb-2">
                        <Swords className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="text-gray-500">No duels yet. Create one or join with a code!</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {duels.map(duel => (
                        <Card key={duel.id} className="!p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                ${duel.status === 'finished' ? 'bg-green-100 text-green-600' :
                                    duel.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                {duel.status === 'finished' ? <Trophy className="w-5 h-5" /> :
                                    duel.status === 'active' ? <Swords className="w-5 h-5" /> :
                                        <Clock className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                    {duel.challenger_name || 'You'} vs {duel.opponent_name || '???'}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    Lvl {duel.level} • Code: <span className="font-mono bg-gray-100 px-1 rounded">{duel.invite_code}</span>
                                    {duel.status === 'finished' && ` • ${duel.challenger_score}-${duel.opponent_score}`}
                                </div>
                            </div>
                            {duel.status === 'active' && (
                                <Button variant="secondary" onClick={() => startPlay(duel)} className="text-sm">
                                    Play
                                </Button>
                            )}
                            {duel.status === 'pending' && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Waiting
                                </span>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
