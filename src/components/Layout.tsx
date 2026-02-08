import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, PlusCircle, LogOut, Menu, X, Languages, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useI18n } from '../lib/i18n';

export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { t, lang, toggleLang } = useI18n();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems = [
        { label: t.dashboard, icon: LayoutDashboard, path: '/' },
        { label: t.calendar, icon: CalendarIcon, path: '/calendar' },
        { label: t.trades, icon: List, path: '/trades' },
        { label: t.addTrade, icon: PlusCircle, path: '/trades/new' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex font-['Inter']">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-[#111111] border-r border-[#222222] p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-sm">TJ</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Journal</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                location.pathname === item.path
                                    ? "bg-blue-600/10 text-blue-500"
                                    : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5",
                                location.pathname === item.path ? "text-blue-500" : "text-gray-400 group-hover:text-white"
                            )} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <button
                        onClick={toggleLang}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-blue-400 hover:bg-blue-400/5 rounded-xl transition-all"
                    >
                        <Languages className="w-5 h-5" />
                        <span className="font-medium">{lang === 'en' ? 'Español' : 'English'}</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">{t.logout}</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col p-6 animate-in slide-in-from-left">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-sm">TJ</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">Journal</h1>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium",
                                    location.pathname === item.path
                                        ? "bg-blue-600/10 text-blue-500"
                                        : "text-gray-400"
                                )}
                            >
                                <item.icon className="w-6 h-6" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto space-y-4">
                        <button
                            onClick={() => { toggleLang(); setIsMobileMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-4 text-blue-500 font-medium"
                        >
                            <Languages className="w-6 h-6" />
                            {lang === 'en' ? 'Español' : 'English'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-4 text-red-500 w-full"
                        >
                            <LogOut className="w-6 h-6" />
                            <span className="text-lg font-medium">{t.logout}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="md:hidden border-b border-[#222222] bg-[#111111] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                            <span className="font-bold text-[10px]">TJ</span>
                        </div>
                        <h1 className="font-bold tracking-tight">Journal</h1>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-6 h-6 text-gray-400" />
                    </button>
                </header>

                <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <div className="max-w-6xl mx-auto h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
