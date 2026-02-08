import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, TrendingDown, Percent, Target } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useI18n } from '../../lib/i18n';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function Dashboard() {
    const { t } = useI18n();
    const [stats, setStats] = useState({
        winrate: 0,
        totalTrades: 0,
        totalPnL: 0,
        avgRR: 0,
        wins: 0,
        losses: 0,
        be: 0
    });
    const [pieData, setPieData] = useState<any[]>([]);
    const [lineData, setLineData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const { data: trades } = await supabase
                .from('trades')
                .select('*')
                .order('date', { ascending: true });

            if (trades) {
                const total = trades.length;
                const winsArray = trades.filter(t => t.result === 'win');
                const lossesArray = trades.filter(t => t.result === 'loss');
                const beArray = trades.filter(t => t.result === 'BE');
                const pnl = trades.reduce((acc, t) => acc + Number(t.pnl), 0);
                const avgRR = total > 0 ? trades.reduce((acc, t) => acc + Number(t.risk_rr), 0) / total : 0;

                setStats({
                    totalTrades: total,
                    winrate: total > (beArray.length) ? (winsArray.length / (total - beArray.length)) * 100 : 0,
                    totalPnL: pnl,
                    avgRR,
                    wins: winsArray.length,
                    losses: lossesArray.length,
                    be: beArray.length
                });

                setPieData([
                    { name: t.wins, value: winsArray.length, color: '#10b981' },
                    { name: t.losses, value: lossesArray.length, color: '#ef4444' },
                    { name: t.be, value: beArray.length, color: '#6b7280' },
                ]);

                let cumulativePnL = 0;
                const curve = trades.map((t, index) => {
                    cumulativePnL += Number(t.pnl);
                    return {
                        trade: index + 1,
                        pnl: cumulativePnL
                    };
                });
                setLineData(curve);
            }
            setLoading(false);
        }

        fetchStats();
    }, [t]);

    if (loading) return <div className="text-white">Loading dashboard...</div>;

    const cards = [
        { label: t.totalTrades, value: stats.totalTrades, icon: Target, color: 'text-blue-500' },
        { label: t.winrate, value: `${stats.winrate.toFixed(1)}%`, icon: Percent, color: 'text-emerald-500' },
        { label: t.totalPnL, value: `$${stats.totalPnL.toFixed(2)}`, icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown, color: stats.totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500' },
        { label: t.avgRR, value: stats.avgRR.toFixed(2), icon: TrendingUp, color: 'text-purple-500' },
    ];

    return (
        <div className="space-y-10">
            <header>
                <h2 className="text-3xl font-bold uppercase tracking-tight">{t.analytics}</h2>
                <p className="text-gray-400 mt-1 font-medium">{t.realTimeStats}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.label} className="bg-[#111111] border border-[#222222] p-6 rounded-3xl shadow-sm hover:border-[#333333] transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl bg-[#0a0a0a]", card.color)}>
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{card.label}</p>
                        <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#111111] border border-[#222222] p-8 rounded-3xl min-h-[400px] flex flex-col">
                    <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-8">{t.distribution}</h3>
                    <div className="flex-1 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <ReTooltip
                                    contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-8 mt-4">
                        {pieData.map(d => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{d.name}: {d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#111111] border border-[#222222] p-8 rounded-3xl min-h-[400px] flex flex-col">
                    <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-8">{t.equityCurve}</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                                <XAxis dataKey="trade" stroke="#444444" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#444444" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="pnl"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
