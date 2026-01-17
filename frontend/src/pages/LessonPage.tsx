import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LiquidLoader } from '../components/ui/LiquidLoader';
import { XPToast } from '../components/ui/Toast';
import { client } from '../api/client';

// Types
interface LessonMeta {
    id: number;
    title: string;
    level: number;
    module: number;
    lesson_number: number;
    topic_key: string;
    has_content: boolean;
    is_completed: boolean;
}

interface Flashcard {
    question: string;
    answer: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

interface LessonContentData {
    lesson_id: number;
    lesson_text: string;
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
}

type LearningStep = 'reading' | 'flashcards' | 'quiz' | 'results';

export const LessonPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Data states
    const [meta, setMeta] = useState<LessonMeta | null>(null);
    const [content, setContent] = useState<LessonContentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Learning flow states
    const [currentStep, setCurrentStep] = useState<LearningStep>('reading');
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
    const [showQuizExplanation, setShowQuizExplanation] = useState(false);
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [xpEarned, setXpEarned] = useState<number | null>(null);
    const [showXpToast, setShowXpToast] = useState(false);

    // Markdown to HTML conversion
    const lessonHtml = useMemo(() => {
        if (!content?.lesson_text) return '';
        return marked(content.lesson_text, { breaks: true, gfm: true });
    }, [content?.lesson_text]);

    // Quiz results calculation
    const quizResults = useMemo(() => {
        if (!content?.quiz || quizAnswers.length === 0) return { correct: 0, total: 0, percentage: 0 };
        const correct = content.quiz.reduce((acc, q, idx) => {
            return acc + (quizAnswers[idx] === q.correct_index ? 1 : 0);
        }, 0);
        return {
            correct,
            total: content.quiz.length,
            percentage: Math.round((correct / content.quiz.length) * 100)
        };
    }, [content?.quiz, quizAnswers]);

    // Fetch lesson data
    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const metaResponse = await client.get(`/lessons/${id}`);
                setMeta(metaResponse.data);

                let contentData: LessonContentData | null = null;

                try {
                    const contentResponse = await client.get(`/lessons/${id}/content`);
                    contentData = contentResponse.data;
                } catch (contentErr: any) {
                    if (contentErr.response?.status === 404) {
                        setIsGenerating(true);
                        try {
                            const generateResponse = await client.post(`/lessons/${id}/generate`);
                            contentData = generateResponse.data;
                        } catch (genErr: any) {
                            throw new Error(genErr.response?.data?.detail || 'Failed to generate lesson content');
                        } finally {
                            setIsGenerating(false);
                        }
                    } else {
                        throw contentErr;
                    }
                }

                setContent(contentData);
                if (contentData?.quiz) {
                    setQuizAnswers(new Array(contentData.quiz.length).fill(null));
                }
            } catch (err: any) {
                setError(err.response?.data?.detail || err.message || 'Failed to load lesson');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLesson();
    }, [id]);

    // Handlers
    const handleCompleteLesson = async () => {
        if (!meta || meta.is_completed) return;

        setIsCompleting(true);
        try {
            const response = await client.post(`/progress/${id}/complete`);
            setMeta({ ...meta, is_completed: true });
            // Show XP toast with actual earned XP from backend
            if (response.data?.xp_earned) {
                setXpEarned(response.data.xp_earned);
                setShowXpToast(true);
            }
        } catch (err: any) {
            console.error('Failed to complete lesson:', err);
        } finally {
            setIsCompleting(false);
        }
    };

    const handleRegenerateConfirm = async () => {
        setShowRegenerateModal(false);
        setIsLoading(true);
        try {
            const response = await client.post(`/lessons/${id}/regenerate`);
            setContent(response.data);
            // Reset progress
            setCurrentFlashcardIndex(0);
            setQuizAnswers(new Array(response.data.quiz.length).fill(null));
            setShowQuizExplanation(false);
        } catch (err: any) {
            alert('Generation error: ' + (err.response?.data?.detail || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextFlashcard = () => {
        setIsFlashcardFlipped(false);
        if (content && currentFlashcardIndex < content.flashcards.length - 1) {
            setCurrentFlashcardIndex(prev => prev + 1);
        } else {
            setCurrentStep('quiz');
            setCurrentQuizIndex(0);
        }
    };

    const handlePrevFlashcard = () => {
        if (currentFlashcardIndex > 0) {
            setIsFlashcardFlipped(false);
            setCurrentFlashcardIndex(prev => prev - 1);
        }
    };

    const handleQuizAnswer = (answerIndex: number) => {
        if (showQuizExplanation) return;
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuizIndex] = answerIndex;
        setQuizAnswers(newAnswers);
        setShowQuizExplanation(true);
    };

    const handleNextQuizQuestion = () => {
        setShowQuizExplanation(false);
        if (content && currentQuizIndex < content.quiz.length - 1) {
            setCurrentQuizIndex(prev => prev + 1);
        } else {
            setCurrentStep('results');
            handleCompleteLesson();
        }
    };

    // Loading state
    if (isLoading || isGenerating) {
        return (
            <LiquidLoader
                message={isGenerating ? '🤖 AI is generating lesson content...' : 'Loading lesson...'}
                subtext={isGenerating ? 'This may take a few seconds' : 'Preparing your learning materials'}
                size="lg"
            />
        );
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <Card className="text-center py-12">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={() => navigate('/app/lectures')}>
                        Back to Lessons
                    </Button>
                </Card>
            </div>
        );
    }

    if (!meta || !content) return null;

    // Progress bar component
    const ProgressBar = () => {
        const steps = [
            { key: 'reading', label: 'Reading', index: 1 },
            { key: 'flashcards', label: 'Flashcards', index: 2 },
            { key: 'quiz', label: 'Quiz', index: 3 },
            { key: 'results', label: 'Results', index: 4 }
        ];
        const currentIndex = steps.findIndex(s => s.key === currentStep);

        return (
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.key}>
                            <div className={`flex flex-col items-center ${idx <= currentIndex ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 transition-all ${idx < currentIndex ? 'bg-green-500 text-white' :
                                    idx === currentIndex ? 'bg-blue-600 text-white shadow-md scale-110' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                    {idx < currentIndex ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        step.index
                                    )}
                                </div>
                                <span className="text-xs font-medium hidden sm:block">{step.label}</span>
                            </div>
                            {
                                idx < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 rounded transition-all ${idx < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )
                            }
                        </React.Fragment>
                    ))}
                </div>
            </div >
        );
    };

    // Reading step
    const ReadingStep = () => (
        <div className="animate-fade-in">
            <Card className="mb-6">
                <div className="flex justify-end mb-4">
                    <Button
                        variant="secondary"
                        onClick={() => setShowRegenerateModal(true)}
                        className="text-sm py-1 px-3"
                        disabled={isLoading || isGenerating}
                    >
                        🔄 Regenerate (AI)
                    </Button>
                </div>
                <article
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-blue-600 prose-ul:my-4 prose-ol:my-4"
                    dangerouslySetInnerHTML={{ __html: lessonHtml }}
                />
            </Card>
            <div className="flex justify-center">
                <Button
                    variant="primary"
                    onClick={() => {
                        setCurrentStep('flashcards');
                        setCurrentFlashcardIndex(0);
                        setIsFlashcardFlipped(false);
                    }}
                    className="px-8 py-3 text-lg"
                >
                    Continue to Flashcards →
                </Button>
            </div>
        </div>
    );

    // Flashcards step
    const FlashcardsStep = () => {
        const card = content.flashcards[currentFlashcardIndex];

        return (
            <div className="animate-fade-in max-w-2xl mx-auto">
                <div className="text-center mb-6">
                    <span className="text-gray-500 text-sm font-medium">
                        {currentFlashcardIndex + 1} of {content.flashcards.length}
                    </span>
                </div>

                <div
                    className="relative h-80 cursor-pointer perspective-1000"
                    onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                >
                    <div className={`w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlashcardFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front */}
                        <Card className={`absolute inset-0 flex items-center justify-center p-8 backface-hidden ${isFlashcardFlipped ? 'invisible' : ''}`}>
                            <div className="text-center">
                                <p className="text-xl font-medium text-gray-800">{card.question}</p>
                                <p className="text-sm text-gray-400 mt-6 font-medium">Click to reveal answer</p>
                            </div>
                        </Card>
                        {/* Back */}
                        <Card className={`absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 ${!isFlashcardFlipped ? 'invisible' : ''}`} style={{ transform: 'rotateY(180deg)' }}>
                            <div className="text-center">
                                <p className="text-xl font-medium text-gray-800">{card.answer}</p>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-between mt-8">
                    <Button
                        variant="secondary"
                        onClick={handlePrevFlashcard}
                        disabled={currentFlashcardIndex === 0}
                    >
                        ← Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleNextFlashcard}
                    >
                        {currentFlashcardIndex === content.flashcards.length - 1 ? 'Go to Quiz →' : 'Next →'}
                    </Button>
                </div>
            </div>
        );
    };

    // Quiz step
    const QuizStep = () => {
        const question = content.quiz[currentQuizIndex];
        const selectedAnswer = quizAnswers[currentQuizIndex];
        const isCorrect = selectedAnswer === question.correct_index;

        return (
            <div className="animate-fade-in max-w-2xl mx-auto">
                <div className="text-center mb-6">
                    <span className="text-gray-500 text-sm font-medium">
                        Question {currentQuizIndex + 1} of {content.quiz.length}
                    </span>
                </div>

                <Card className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">{question.question}</h3>

                    <div className="space-y-3">
                        {question.options.map((option, idx) => {
                            let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-all ';

                            if (showQuizExplanation) {
                                if (idx === question.correct_index) {
                                    buttonClass += 'border-green-500 bg-green-50 text-green-800';
                                } else if (idx === selectedAnswer && !isCorrect) {
                                    buttonClass += 'border-red-500 bg-red-50 text-red-800';
                                } else {
                                    buttonClass += 'border-gray-200 bg-gray-50 text-gray-500';
                                }
                            } else if (selectedAnswer === idx) {
                                buttonClass += 'border-blue-500 bg-blue-50 text-blue-800';
                            } else {
                                buttonClass += 'border-gray-200 hover:border-blue-300 hover:bg-blue-50';
                            }

                            return (
                                <button
                                    key={idx}
                                    className={buttonClass}
                                    onClick={() => handleQuizAnswer(idx)}
                                    disabled={showQuizExplanation}
                                >
                                    <span className="font-medium mr-3">
                                        {String.fromCharCode(65 + idx)}.
                                    </span>
                                    {option}
                                    {showQuizExplanation && idx === question.correct_index && (
                                        <span className="float-right text-green-600">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {showQuizExplanation && (
                        <div className={`mt-6 p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                            <div className="flex items-start gap-3">
                                <div>
                                    <p className={`font-bold ${isCorrect ? 'text-green-800' : 'text-amber-800'}`}>
                                        {isCorrect ? 'Correct!' : 'Not quite...'}
                                    </p>
                                    <p className={isCorrect ? 'text-green-700' : 'text-amber-700'}>
                                        {question.explanation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {showQuizExplanation && (
                    <div className="flex justify-center">
                        <Button variant="primary" onClick={handleNextQuizQuestion} className="px-8">
                            {currentQuizIndex === content.quiz.length - 1 ? 'See Results →' : 'Next Question →'}
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    // Results step
    const ResultsStep = () => {


        const getResultMessage = () => {
            if (quizResults.percentage >= 90) return 'Excellent result!';
            if (quizResults.percentage >= 70) return 'Good result!';
            if (quizResults.percentage >= 50) return 'Not bad, but can be better!';
            return 'Recommended to review the material';
        };

        return (
            <div className="animate-fade-in max-w-2xl mx-auto text-center">
                <Card className="py-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Lesson Completed!</h2>
                    <p className="text-xl text-gray-600 mb-8">{getResultMessage()}</p>

                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white mb-8">
                        <div className="text-5xl font-bold mb-2">{quizResults.percentage}%</div>
                        <div className="text-blue-100">
                            Correct answers: {quizResults.correct} of {quizResults.total}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-green-50 rounded-xl p-4">
                            <div className="text-3xl font-bold text-green-600 animate-xp-pop">
                                +{xpEarned || 0}
                            </div>
                            <div className="text-sm text-green-700">XP earned</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                            <div className="text-3xl font-bold text-purple-600">+{quizResults.correct * 10}</div>
                            <div className="text-sm text-purple-700">Bonus XP for quiz</div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setCurrentStep('reading');
                                setCurrentFlashcardIndex(0);
                                setCurrentQuizIndex(0);
                                setQuizAnswers(new Array(content.quiz.length).fill(null));
                                setShowQuizExplanation(false);
                            }}
                            disabled={isCompleting}
                        >
                            🔄 Start Again
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/app/lectures')}
                            disabled={isCompleting}
                        >
                            {isCompleting ? 'Saving...' : '📚 Back to Lessons'}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/app/lectures')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">Level {meta.level} • Module {meta.module}</span>
                        {meta.is_completed && (
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                                Completed
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress */}
            <ProgressBar />

            {/* Content based on step */}
            {currentStep === 'reading' && <ReadingStep />}
            {currentStep === 'flashcards' && <FlashcardsStep />}
            {currentStep === 'quiz' && <QuizStep />}
            {currentStep === 'results' && <ResultsStep />}

            {/* Regeneration Modal */}
            <Modal
                isOpen={showRegenerateModal}
                onClose={() => setShowRegenerateModal(false)}
                title="Regenerate Lesson?"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowRegenerateModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleRegenerateConfirm}
                            className="bg-red-600 hover:bg-red-700 shadow-red-500/30"
                        >
                            Yes, Regenerate
                        </Button>
                    </>
                }
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 mb-2">
                        The current lesson content will be permanently deleted and replaced with new AI-generated content.
                    </p>
                    <p className="text-sm text-gray-500">
                        This will take a few seconds.
                    </p>
                </div>
            </Modal>

            {/* XP Earned Toast */}
            {showXpToast && xpEarned && (
                <XPToast xp={xpEarned} onClose={() => setShowXpToast(false)} />
            )}
        </div>
    );
};
