import React, { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '../../api/client';

interface MiniTestQuestion {
    question: string;
    options: string[];
    correct_index: number;
}

interface DictionaryData {
    term: string;
    definition: string;
    example: string;
    mini_test: MiniTestQuestion[];
}

interface DictionaryPopoverProps {
    lessonId: number;
    userLevel: number;
    /** The container element to listen for text selections */
    containerRef: React.RefObject<HTMLElement | null>;
}

export const DictionaryPopover: React.FC<DictionaryPopoverProps> = ({ lessonId, userLevel, containerRef }) => {
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [showTrigger, setShowTrigger] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<DictionaryData | null>(null);
    const [showPopover, setShowPopover] = useState(false);
    const [testAnswers, setTestAnswers] = useState<(number | null)[]>([]);
    const [showExplanations, setShowExplanations] = useState<boolean[]>([]);
    const popoverRef = useRef<HTMLDivElement>(null);

    const handleSelection = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            // Delay hiding to allow clicking the trigger
            setTimeout(() => {
                if (!showPopover) setShowTrigger(false);
            }, 200);
            return;
        }

        const text = selection.toString().trim();
        if (text.length < 2 || text.length > 100 || text.includes('\n')) {
            setShowTrigger(false);
            return;
        }

        // Check if selection is within our container
        const container = containerRef.current;
        if (!container) return;
        const range = selection.getRangeAt(0);
        if (!container.contains(range.commonAncestorContainer)) return;

        const rect = range.getBoundingClientRect();
        setSelectedTerm(text);
        setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        });
        setShowTrigger(true);
        setShowPopover(false);
        setData(null);
    }, [containerRef, showPopover]);

    useEffect(() => {
        document.addEventListener('mouseup', handleSelection);
        return () => document.removeEventListener('mouseup', handleSelection);
    }, [handleSelection]);

    // Close popover on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setShowPopover(false);
                setShowTrigger(false);
                setData(null);
            }
        };
        if (showPopover) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showPopover]);

    const handleDefine = async () => {
        if (!selectedTerm) return;
        setShowTrigger(false);
        setShowPopover(true);
        setIsLoading(true);

        try {
            const response = await client.post('/ai/dictionary', {
                term: selectedTerm,
                lesson_id: lessonId,
                user_level: userLevel,
            });
            setData(response.data);
            setTestAnswers(new Array(response.data.mini_test?.length || 0).fill(null));
            setShowExplanations(new Array(response.data.mini_test?.length || 0).fill(false));
        } catch (err) {
            setData({
                term: selectedTerm,
                definition: 'Unable to look up this term right now. Please try again later.',
                example: '',
                mini_test: [],
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestAnswer = (qIdx: number, answerIdx: number) => {
        if (showExplanations[qIdx]) return;
        const newAnswers = [...testAnswers];
        newAnswers[qIdx] = answerIdx;
        setTestAnswers(newAnswers);
        const newShow = [...showExplanations];
        newShow[qIdx] = true;
        setShowExplanations(newShow);
    };

    // "Define" trigger button near selection
    if (showTrigger && selectedTerm) {
        return (
            <button
                onClick={handleDefine}
                className="fixed z-50 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600
                    text-white text-xs font-medium shadow-lg shadow-purple-500/30
                    hover:shadow-purple-500/50 transition-all animate-fade-in"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -100%)',
                }}
            >
                📖 Define "{selectedTerm.length > 20 ? selectedTerm.slice(0, 20) + '...' : selectedTerm}"
            </button>
        );
    }

    // Full popover with definition + mini-test
    if (showPopover) {
        return (
            <div
                ref={popoverRef}
                className="fixed z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200
                    bg-white shadow-2xl shadow-black/10 animate-fade-in overflow-hidden"
                style={{
                    left: `${Math.min(position.x, window.innerWidth - 340)}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -100%)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-800">📖 {selectedTerm}</span>
                    <button
                        onClick={() => { setShowPopover(false); setData(null); }}
                        className="p-1 hover:bg-white/60 rounded transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    ) : data ? (
                        <div className="space-y-3">
                            {/* Definition */}
                            <div>
                                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Definition</div>
                                <p className="text-sm text-gray-800 leading-relaxed">{data.definition}</p>
                            </div>

                            {/* Example */}
                            {data.example && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="text-xs font-semibold text-blue-500 uppercase mb-1">Example</div>
                                    <p className="text-sm text-blue-800">{data.example}</p>
                                </div>
                            )}

                            {/* Mini Test */}
                            {data.mini_test.length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Quick Check</div>
                                    {data.mini_test.map((q, qIdx) => (
                                        <div key={qIdx} className="mb-3">
                                            <p className="text-sm font-medium text-gray-700 mb-2">{q.question}</p>
                                            <div className="space-y-1.5">
                                                {q.options.map((opt, oIdx) => {
                                                    let cls = 'w-full text-left text-xs p-2 rounded-lg border transition-all ';
                                                    if (showExplanations[qIdx]) {
                                                        if (oIdx === q.correct_index) cls += 'border-green-400 bg-green-50 text-green-700';
                                                        else if (oIdx === testAnswers[qIdx]) cls += 'border-red-400 bg-red-50 text-red-600';
                                                        else cls += 'border-gray-100 text-gray-400';
                                                    } else {
                                                        cls += 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-600';
                                                    }
                                                    return (
                                                        <button key={oIdx} className={cls} onClick={() => handleTestAnswer(qIdx, oIdx)}>
                                                            {String.fromCharCode(65 + oIdx)}. {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {showExplanations[qIdx] && (
                                                <div className={`mt-2 text-xs font-medium ${testAnswers[qIdx] === q.correct_index ? 'text-green-600' : 'text-amber-600'
                                                    }`}>
                                                    {testAnswers[qIdx] === q.correct_index ? '✅ Correct!' : '💡 The correct answer is ' + String.fromCharCode(65 + q.correct_index) + '.'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    return null;
};
