import React from 'react';
import { Card } from '../ui/Card';
import { BookOpen, CheckCircle, BrainCircuit, TrendingUp } from 'lucide-react';

export const Functions: React.FC = () => {
    const steps = [
        {
            title: "Learn Theory",
            desc: "Short 5-minute lessons. Complex topics in simple language, no fluff.",
            icon: <BookOpen className="w-7 h-7 text-blue-500" />
        },
        {
            title: "Take Quizzes",
            desc: "Reinforce knowledge with interactive quizzes and level up.",
            icon: <CheckCircle className="w-7 h-7 text-blue-500" />
        },
        {
            title: "Memorize",
            desc: "Smart flashcards help you remember important terms forever.",
            icon: <BrainCircuit className="w-7 h-7 text-blue-500" />
        },
        {
            title: "Level Up",
            desc: "Earn XP, unlock achievements and new titles — from Novice to Master.",
            icon: <TrendingUp className="w-7 h-7 text-blue-500" />
        }
    ];

    return (
        <section id="functions" className="py-24 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    How it Works
                </h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-16">
                    Simple and effective learning method based on gamification.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <Card key={index} gridHeader className="h-full text-left relative">
                            {/* Step number badge */}
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-5">
                                {step.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
