import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Trade } from '../../types';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    parseISO
} from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useI18n } from '../../lib/i18n';
import { Link } from 'react-router-dom';

export default function TradeCalendar() {
    const { t, lang } = useI18n();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrades() {
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);

            const { data } = await supabase
                .from('trades')
                .select('*')
                .gte('date', start.toISOString())
                .lte('date', end.toISOString());

            if (data) setTrades(data);
            setLoading(false);
        }
        setLoading(true);
        fetchTrades();
    }, [currentMonth]);

    const renderHeader = () => {
        const dateFormat = "MMMM yyyy";
        const dateLocale = lang === 'es' ? es : enUS;

        return (
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold uppercase tracking-tight text-white">
                        {format(currentMonth, dateFormat, { locale: dateLocale })}
                    </h2>
                    <p className="text-gray-400 mt-1 font-medium">{t.calendar}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2.5 bg-[#111111] border border-[#222222] rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2.5 bg-[#111111] border border-[#222222] rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];
        return (
            <div className="grid grid-cols-7 mb-4">
                {days.map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;

                const dayTrades = trades.filter(trade => isSameDay(parseISO(trade.date), cloneDay));
                const dailyPnL = dayTrades.reduce((acc, trade) => acc + Number(trade.pnl), 0);
                const wins = dayTrades.filter(t => t.result === 'win').length;
                const losses = dayTrades.filter(t => t.result === 'loss').length;

                days.push(
                    <div
                        key={day.toString()}
                        className={cn(
                            "relative min-h-[120px] bg-[#111111] border border-[#222222] p-4 transition-all overflow-hidden group",
                            !isSameMonth(day, monthStart) ? "opacity-20 pointer-events-none" : "hover:bg-white/[0.02]"
                        )}
                    >
                        <span className="text-sm font-bold text-gray-500">{formattedDate}</span>

                        {dayTrades.length > 0 && (
                            <div className="mt-2 space-y-2">
                                <div className="flex gap-1 flex-wrap">
                                    {[...Array(wins)].map((_, i) => (
                                        <div key={`win-${i}`} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    ))}
                                    {[...Array(losses)].map((_, i) => (
                                        <div key={`loss-${i}`} className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    ))}
                                </div>

                                <div className={cn(
                                    "text-xs font-black",
                                    dailyPnL >= 0 ? "text-emerald-500" : "text-red-500"
                                )}>
                                    {dailyPnL !== 0 && (dailyPnL >= 0 ? '+' : '') + dailyPnL.toFixed(2) + '$'}
                                </div>

                                <div className="flex flex-col gap-1 mt-2">
                                    {dayTrades.slice(0, 2).map(trade => (
                                        <Link
                                            key={trade.id}
                                            to={`/trades/${trade.id}`}
                                            className="text-[9px] font-bold truncate p-1 bg-[#1a1a1a] rounded border border-[#222222] text-gray-400 hover:text-white"
                                        >
                                            {trade.market}
                                        </Link>
                                    ))}
                                    {dayTrades.length > 2 && (
                                        <span className="text-[8px] text-gray-600 font-bold">+{dayTrades.length - 2} MORE</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="rounded-[32px] overflow-hidden border border-[#222222] shadow-2xl relative">
            {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            )}
            {rows}
        </div>;
    };

    return (
        <div className="space-y-4 font-['Inter'] pb-20">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}
