import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
    const location = useLocation();
    const isAuthPage = ['/login', '/signup'].includes(location.pathname);
    const isDashboard = location.pathname.startsWith('/app');
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            // Determine active section
            const sections = ['home', 'functions', 'why-us', 'about-us', 'faq'];
            let current = '';

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // If top of section is within the top half of viewport
                    if (rect.top <= 300 && rect.bottom >= 300) {
                        current = section;
                        break;
                    }
                }
            }
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        // Trigger once on mount
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isDashboard) return null;

    return (
        <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
            <div className="container-custom">
                <nav className={`w-full flex items-center justify-between p-2 pl-4 pr-2 rounded-2xl transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg border border-white/20' : 'bg-transparent'
                    }`}>
                    <Link to="/" className="flex items-center gap-2 group mr-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
                            Finance Trainer
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center bg-gray-100/50 p-1 rounded-xl backdrop-blur-sm border border-white/20">
                        {['Home', 'Functions', 'Why Us', 'About Us', 'FAQ'].map((item) => {
                            const sectionId = item.toLowerCase().replace(' ', '-');
                            const isActive = activeSection === sectionId;

                            return (
                                <a
                                    key={item}
                                    href={`#${sectionId}`}
                                    onClick={() => setActiveSection(sectionId)}
                                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors z-10 ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            style={{ zIndex: -1 }}
                                        />
                                    )}
                                    {item}
                                </a>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        {!isAuthPage && (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors hidden sm:block">
                                    Log in
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" size="sm" className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
                                        Sign up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </div>
    );
};
