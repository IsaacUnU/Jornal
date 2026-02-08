import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Trade } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { ChevronRight, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';

export default function TradeList() {
    const { t, lang } = useI18n();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrades() {
            const { data } = await supabase
                .from('trades')
                .select('*')
                .order('date', { ascending: false });

            if (data) setTrades(data);
            setLoading(false);
        }
        fetchTrades();
    }, []);

    if (loading) return <div className="text-white">Loading trades...</div>;

    const dateLocale = lang === 'es' ? es : enUS;

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-bold uppercase tracking-tight text-white">{t.tradeLog}</h2>
                    <p className="text-gray-400 mt-1 font-medium">Revisa tu historial, aprende de tus errores y potencia tus aciertos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" placeholder={t.searchMarket} className="bg-[#111111] border border-[#222222] pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-64 text-white font-medium" />
                    </div>
                    <button className="p-2.5 bg-[#111111] border border-[#222222] rounded-xl text-gray-400 hover:text-white transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="bg-[#111111] border border-[#222222] rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#1a1a1a] text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-[#222222]">
                                <th className="px-8 py-5 font-bold">{t.date}</th>
                                <th className="px-8 py-5 font-bold">{t.market}</th>
                                <th className="px-8 py-5 font-bold">Result</th>
                                <th className="px-8 py-5 font-bold">{t.pnl}</th>
                                <th className="px-8 py-5 font-bold">{t.session}</th>
                                <th className="px-8 py-5 font-bold">Emotion</th>
                                <th className="px-8 py-5 font-bold">Quality</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222222]">
                            {trades.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-8 py-24 text-center text-gray-500 italic font-medium">{t.noTrades}</td>
                                </tr>
                            ) : (
                                trades.map((trade) => (
                                    <tr key={trade.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <p className="font-bold text-sm text-white">{format(new Date(trade.date), t.dateFormatted, { locale: dateLocale })}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-base">{trade.market}</span>
                                                <span className={cn(
                                                    "text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider",
                                                    trade.direction === 'long' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                )}>{trade.direction === 'long' ? t.long : t.short}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-widest">{trade.model}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                                                trade.result === 'win' ? "bg-emerald-500/15 text-emerald-500" :
                                                    trade.result === 'loss' ? "bg-red-500/15 text-red-500" : "bg-gray-500/15 text-gray-400"
                                            )}>{trade.result}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className={cn("font-bold text-base", trade.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                                                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}$
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-gray-400 font-bold uppercase tracking-wider">{trade.session}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider">{trade.emotional_state}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={cn("w-3 h-1 rounded-full", i < trade.execution_quality ? "bg-blue-500" : "bg-[#222222]")} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link to={`/trades/${trade.id}`} className="p-3 inline-block rounded-xl hover:bg-[#222222] transition-colors border border-transparent hover:border-[#333333]">
                                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
