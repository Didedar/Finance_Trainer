import React from 'react';


export const AboutUs: React.FC = () => {
    return (
        <section id="about-us" className="py-24 relative overflow-hidden">
            {/* Gradient transition from dark section */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-20"></div>

            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-100 via-white to-white"></div>

            {/* Decorative background elements */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-8">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    About Us
                </h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
                    Our mission is to make financial independence accessible through education.
                </p>

                {/* Main content card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 mb-16">
                    <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
                        <p className="mb-6 text-lg">
                            We are not gurus and we don't sell crypto signals.
                            <strong className="text-gray-900 font-semibold"> Finance Trainer</strong> — is an educational simulator
                            that will guide you step-by-step from a basic understanding of "how not to spend everything to zero"
                            to a deep understanding of investment strategies.
                        </p>
                        <p className="text-gray-500">
                            Our approach is simple: less boring theory, more clear examples and gamification.
                            Because we believe: learning to manage money should be as interesting as playing a game.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-8 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-3">5+</div>
                        <p className="text-gray-600 font-medium">Difficulty Levels</p>
                    </div>
                    <div className="text-center p-8 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-3">70+</div>
                        <p className="text-gray-600 font-medium">Unique Lessons</p>
                    </div>
                    <div className="text-center p-8 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-3">∞</div>
                        <p className="text-gray-600 font-medium">Your Possibilities</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
