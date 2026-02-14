import React, { useState, useRef, useEffect } from 'react';
import { client } from '../../api/client';

interface ChatMessage {
    role: string;
    content: string;
    created_at?: string;
}

interface CoachChatProps {
    lessonId: number;
    userLevel: number;
    quizErrors: string[];
}

const QUICK_REPLIES = [
    { label: '💡 Explain simpler', message: 'Can you explain this topic in simpler terms?' },
    { label: '🔗 Give analogy', message: 'Can you give me a real-life analogy for this concept?' },
    { label: '❓ Ask me questions', message: 'Ask me a question to test my understanding.' },
];

export const CoachChat: React.FC<CoachChatProps> = ({ lessonId, userLevel, quizErrors }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await client.post('/ai/coach', {
                lesson_id: lessonId,
                user_message: messageText,
                user_level: userLevel,
                recent_quiz_errors: quizErrors,
            });

            const data = response.data;
            setMessages(data.history || [...messages, userMsg, { role: 'assistant', content: data.reply }]);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Connection error. Please try again.';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ ${errorMsg}`,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    // Collapsed trigger button
    if (!isOpen) {
        return (
            <button
                id="coach-chat-trigger"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full
                    bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30
                    hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200
                    font-medium text-sm"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                AI Coach
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] flex flex-col
            rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-black/10
            animate-fade-in overflow-hidden"
            style={{ maxHeight: '70vh' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🤖</div>
                    <div>
                        <div className="font-semibold text-sm">AI Financial Coach</div>
                        <div className="text-xs text-blue-100">Ask me anything about this lesson</div>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px', maxHeight: '400px' }}>
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-3">👋</div>
                        <p className="text-gray-500 text-sm">Hi! I'm your AI financial coach.</p>
                        <p className="text-gray-400 text-xs mt-1">Ask me to explain concepts, give analogies, or quiz you.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-800 rounded-bl-md'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-gray-100">
                {QUICK_REPLIES.map((qr, idx) => (
                    <button
                        key={idx}
                        onClick={() => sendMessage(qr.message)}
                        disabled={isLoading}
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full
                            border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600
                            hover:border-blue-200 transition-all disabled:opacity-50"
                    >
                        {qr.label}
                    </button>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 flex gap-2">
                <input
                    id="coach-chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                        disabled:opacity-50 transition-all"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm
                        hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
};
