import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    Wallet, Zap, PieChart, User, LogOut
} from 'lucide-react';

const BottomNavLink = ({ to, icon, label }: any) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 w-16 transition-colors ${isActive ? 'text-[hsl(var(--primary))] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-gray-500 hover:text-gray-300'
            }`
        }
    >
        <span className="w-6 h-6">{icon}</span>
        <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
);

export const DashboardLayout: React.FC = () => {
    const { isAuthenticated, isLoading, logout } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
                <div className="loading w-12 h-12 rounded-full border-4 border-gray-800 border-t-[hsl(var(--primary))] animate-spin shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-[hsl(var(--background))] text-white pb-20 selection:bg-[hsl(var(--primary))] selection:text-white">

            {/* Top Bar */}
            <header className="sticky top-0 z-40 bg-[hsl(var(--card))]/80 backdrop-blur-md border-b border-[hsl(var(--border))] px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-black shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                        <Zap className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">CoinUp</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-white transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            {/* Main Content (Mobile Optimized Container) */}
            <main className="flex-1 w-full max-w-md mx-auto">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 w-full bg-[hsl(var(--card))]/90 backdrop-blur-xl border-t border-[hsl(var(--border))] z-50 px-2 py-3 flex justify-around items-center pb-safe">
                <BottomNavLink
                    to="/app/dashboard"
                    icon={<Wallet className="w-6 h-6" />}
                    label="Wallet"
                />
                <BottomNavLink
                    to="/app/lectures"
                    icon={<Zap className="w-6 h-6" />}
                    label="Quests"
                />
                <BottomNavLink
                    to="/app/budget-sim"
                    icon={<PieChart className="w-6 h-6" />}
                    label="Invest"
                />
                <BottomNavLink
                    to="/app/profile"
                    icon={<User className="w-6 h-6" />}
                    label="Profile"
                />
            </nav>
        </div>
    );
};
