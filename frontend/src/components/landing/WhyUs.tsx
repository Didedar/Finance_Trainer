import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const WhyUs: React.FC = () => {
    return (
        <section id="why-us" className="py-24 bg-gray-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Why Choose Us
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-16">
                        How we differ from thousands of courses on the internet.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">1</div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">Structure, not chaos</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Clear level hierarchy. You can't jump to "Investments" without understanding "Budget". We build a foundation.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">2</div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">AI Generation</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Each lesson is unique. Our AI adapts examples and quizzes so learning is never generic.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">3</div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">Gamification</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Earn XP, reach new titles, and maintain your streak. Learning is as addictive as a game.</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex justify-center">
                        <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 shadow-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">Your Status</div>
                                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Investor</div>
                                </div>
                                <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">+50 XP</div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-3/4"></div>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">To next level</span>
                                    <span className="text-white font-medium">120 XP</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                                    <div className="text-xl font-bold text-white">12</div>
                                    <div className="text-xs text-gray-400">Day Streak</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                                    <div className="text-xl font-bold text-white">45</div>
                                    <div className="text-xs text-gray-400">Lessons Completed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Centered CTA Button */}
                <div className="text-center mt-12">
                    <Link to="/signup">
                        <Button variant="primary" size="lg">
                            Start Learning for Free
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
