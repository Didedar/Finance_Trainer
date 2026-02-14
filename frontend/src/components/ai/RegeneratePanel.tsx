import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { client } from '../../api/client';
import { marked } from 'marked';

interface RegeneratePanelProps {
    lessonId: number;
    onApply: (content: { lesson_text: string; flashcards: any[]; quiz: any[] }) => void;
    onClose: () => void;
}

export const RegeneratePanel: React.FC<RegeneratePanelProps> = ({ lessonId, onApply, onClose }) => {
    const [difficulty, setDifficulty] = useState<'easier' | 'same' | 'harder'>('same');
    const [length, setLength] = useState<'shorter' | 'same' | 'longer'>('same');
    const [moreExamples, setMoreExamples] = useState(false);
    const [topicFocus, setTopicFocus] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await client.post('/ai/lesson-regenerate', {
                lesson_id: lessonId,
                params: {
                    difficulty,
                    length,
                    more_examples: moreExamples,
                    topic_focus: topicFocus || null,
                },
            });
            setPreview(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to regenerate. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        if (preview) {
            onApply({
                lesson_text: preview.lesson_text,
                flashcards: preview.flashcards,
                quiz: preview.quiz,
            });
        }
    };

    const DifficultyOption = ({ value, label, emoji }: { value: typeof difficulty; label: string; emoji: string }) => (
        <button
            onClick={() => setDifficulty(value)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${difficulty === value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
        >
            <span className="block text-lg mb-0.5">{emoji}</span>
            {label}
        </button>
    );

    const LengthOption = ({ value, label }: { value: typeof length; label: string }) => (
        <button
            onClick={() => setLength(value)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${length === value
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto !p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Regenerate Lesson</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Customize AI-generated content</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/60 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Difficulty */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Difficulty</label>
                        <div className="flex gap-2">
                            <DifficultyOption value="easier" label="Easier" emoji="🌱" />
                            <DifficultyOption value="same" label="Same" emoji="⚖️" />
                            <DifficultyOption value="harder" label="Harder" emoji="🔥" />
                        </div>
                    </div>

                    {/* Length */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Length</label>
                        <div className="flex gap-2">
                            <LengthOption value="shorter" label="📄 Shorter" />
                            <LengthOption value="same" label="📋 Standard" />
                            <LengthOption value="longer" label="📚 Longer" />
                        </div>
                    </div>

                    {/* More Examples Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">More practical examples</label>
                        <button
                            onClick={() => setMoreExamples(!moreExamples)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${moreExamples ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${moreExamples ? 'translate-x-5.5' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>

                    {/* Topic Focus */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Topic focus (optional)</label>
                        <div className="flex flex-wrap gap-2">
                            {['investments', 'loans', 'budget', 'savings', 'taxes'].map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setTopicFocus(topicFocus === topic ? '' : topic)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${topicFocus === topic
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Preview */}
                    {preview && (
                        <div className="border border-green-200 rounded-xl bg-green-50/50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-green-600 font-semibold text-sm">✨ Preview ready</span>
                                {preview.from_cache && (
                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Cached</span>
                                )}
                            </div>
                            <div
                                className="prose prose-sm max-w-none max-h-48 overflow-y-auto text-gray-700"
                                dangerouslySetInnerHTML={{
                                    __html: marked(preview.lesson_text?.slice(0, 500) + '...', { breaks: true, gfm: true }),
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <Button variant="secondary" onClick={onClose} className="text-sm">
                        Cancel
                    </Button>
                    <div className="flex gap-2">
                        {!preview ? (
                            <Button
                                variant="primary"
                                onClick={handleGenerate}
                                disabled={isLoading}
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
                                ) : '🤖 Generate Preview'}
                            </Button>
                        ) : (
                            <>
                                <Button variant="secondary" onClick={() => setPreview(null)} className="text-sm">
                                    🔄 Re-generate
                                </Button>
                                <Button variant="primary" onClick={handleApply} className="text-sm">
                                    ✅ Apply Content
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};
