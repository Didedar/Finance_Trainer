import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="footer mt-auto">
            <div className="max-w-7xl mx-auto px-4">
                <div className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 py-16 mb-12 text-center shadow-xl">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white tracking-tight">ARE YOU IN?</h2>
                    <Link to="/signup" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-lg font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 px-10 py-4 bg-white text-blue-600 hover:bg-gray-50 hover:scale-105 shadow-lg">
                        Start Learning Now
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-gray-200 pt-6 px-4">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6 text-gray-900">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">CoinUp</span>
                        </div>
                        <p className="text-gray-600 max-w-sm">
                            We created this simulator to fill the gap in accessible and understandable financial education.
                            Simple lessons, gamification, and real skills.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-gray-900">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link></li>
                            <li><a href="#about-us" className="text-gray-600 hover:text-blue-600 transition-colors">About</a></li>
                            <li><a href="#functions" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a></li>
                            <li><a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pb-8 text-center text-sm text-gray-500 w-full flex flex-col items-center justify-center">
                    <p>© 2026 CoinUp.</p>
                    <p>All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};
