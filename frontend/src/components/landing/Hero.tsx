import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Scene } from '../../three/Scene';

export const Hero: React.FC = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-60 animate-pulse-soft"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-pulse-soft delay-1000"></div>
            </div>

            <div className="absolute inset-0 z-0">
                <Scene />
            </div>

            <div className="relative z-10 container-custom text-center pointer-events-none">
                <div className="pointer-events-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Game-Changing Financial Education
                    </div>

                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 animate-fade-in-up delay-100">
                        <span className="block text-gray-900">Master Your</span>
                        <span className="text-gradient">Financial Future</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
                        Experience financial literacy like never before with our gamified platform.
                        Real cases, interactive simulations, and zero boring spreadsheets.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <Link to="/signup">
                            <Button variant="primary" size="lg" className="px-12 py-6 text-lg rounded-full font-semibold shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300">
                                Start Learning Now
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="secondary" size="lg" className="px-12 py-6 text-lg rounded-full font-semibold bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-300">
                                View Demo
                            </Button>
                        </Link>
                    </div>

                    <p className="mt-8 text-sm text-gray-400 font-medium animate-fade-in-up delay-300">
                        Join 10,000+ students mastering their finances
                    </p>
                </div>
            </div>
        </section>
    );
};
