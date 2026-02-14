import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard, BookOpen, Award, Swords,
    PieChart, AlertTriangle, CalendarCheck, Skull,
    LogOut, TrendingUp, Menu
} from 'lucide-react';

const SidebarLink = ({ to, children, icon }: any) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
        }
    >
        <span className="w-5 h-5">{icon}</span>
        <span className="font-medium">{children}</span>
    </NavLink>
);

export const DashboardLayout: React.FC = () => {
    const { isAuthenticated, isLoading, logout, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="loading w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full w-64 bg-[#0f0f0f] text-gray-400 flex flex-col z-40 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Finance Trainer</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
                    <SidebarLink
                        to="/app/dashboard"
                        icon={<LayoutDashboard className="w-5 h-5" />}
                    >
                        Dashboard
                    </SidebarLink>

                    <SidebarLink
                        to="/app/lectures"
                        icon={<BookOpen className="w-5 h-5" />}
                    >
                        Lectures
                    </SidebarLink>

                    <SidebarLink
                        to="/app/achievements"
                        icon={<Award className="w-5 h-5" />}
                    >
                        Achievements
                    </SidebarLink>

                    <div className="pt-4 pb-2">
                        <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Games & Tools
                        </div>
                    </div>

                    <SidebarLink
                        to="/app/duels"
                        icon={<Swords className="w-5 h-5" />}
                    >
                        Quiz Duels
                    </SidebarLink>

                    <SidebarLink
                        to="/app/budget-sim"
                        icon={<PieChart className="w-5 h-5" />}
                    >
                        Budget Sim
                    </SidebarLink>

                    <SidebarLink
                        to="/app/traps"
                        icon={<AlertTriangle className="w-5 h-5" />}
                    >
                        Financial Traps
                    </SidebarLink>

                    <SidebarLink
                        to="/app/habits"
                        icon={<CalendarCheck className="w-5 h-5" />}
                    >
                        Habit Tracker
                    </SidebarLink>

                    <div className="pt-4 pb-2">
                        <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Boss Mode
                        </div>
                    </div>

                    <SidebarLink
                        to="/app/boss"
                        icon={<Skull className="w-5 h-5" />}
                    >
                        Boss Battle
                    </SidebarLink>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <NavLink to="/app/profile" className="flex items-center gap-3 px-4 py-3 mb-2 hover:bg-white/5 rounded-lg transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                        </div>
                    </NavLink>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};
