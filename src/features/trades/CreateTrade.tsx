import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Session, Direction, Result } from '../../types';
import { Calendar, Activity, Brain, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useI18n } from '../../lib/i18n';

export default function CreateTrade() {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        market: '',
        session: 'London' as Session,
        direction: 'long' as Direction,
        entry_price: '',
        stop_loss: '',
        take_profit: '',
        risk_rr: '',
        result: 'win' as Result,
        pnl: '',
        model: '',
        execution_quality: 5,
        emotional_state: 'Calm',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { error } = await supabase.from('trades').insert([{
            ...formData,
            user_id: user.id,
            entry_price: Number(formData.entry_price),
            stop_loss: Number(formData.stop_loss),
            take_profit: Number(formData.take_profit),
            risk_rr: Number(formData.risk_rr),
            pnl: Number(formData.pnl),
            execution_quality: Number(formData.execution_quality)
        }]);

        if (error) {
            alert(error.message);
        } else {
            navigate('/trades');
        }
        setLoading(false);
    };

    const emotions = ['Calm', 'Neutral', 'Anxious', 'Fearful', 'Greedy', 'Overconfident', 'Stressed'];

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <header>
                <h2 className="text-3xl font-bold">{t.logNewTrade}</h2>
                <p className="text-gray-400 mt-1">{t.honestyNote}</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section: Basic Data */}
                <section className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
                    <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#222222] flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">{t.contextSetup}</span>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.date}</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.market}</label>
                            <input
                                type="text"
                                placeholder="NAS100, EURUSD..."
                                value={formData.market}
                                onChange={e => setFormData({ ...formData, market: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.session}</label>
                            <select
                                value={formData.session}
                                onChange={e => setFormData({ ...formData, session: e.target.value as Session })}
                                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                            >
                                <option value="Asia">Asia</option>
                                <option value="London">London</option>
                                <option value="NY">NY</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.model}</label>
                            <input
                                type="text"
                                placeholder="OB Tap, Breakout, SMC..."
                                value={formData.model}
                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Execution */}
                <section className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
                    <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#222222] flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" />
                        <span className="font-semibold">{t.executionDetails}</span>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.direction}</label>
                            <div className="flex bg-[#0a0a0a] rounded-xl p-1 border border-[#222222]">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, direction: 'long' })}
                                    className={cn("flex-1 py-2 rounded-lg font-semibold transition-all", formData.direction === 'long' ? "bg-emerald-500 text-white shadow-lg" : "text-gray-500")}
                                >{t.long}</button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, direction: 'short' })}
                                    className={cn("flex-1 py-2 rounded-lg font-semibold transition-all", formData.direction === 'short' ? "bg-red-500 text-white shadow-lg" : "text-gray-500")}
                                >{t.short}</button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.entryPrice}</label>
                            <input
                                type="number" step="any"
                                value={formData.entry_price}
                                onChange={e => setFormData({ ...formData, entry_price: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-1 md:col-start-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.sl} / {t.tp} / {t.rr}</label>
                            <div className="flex gap-2">
                                <input placeholder={t.sl} type="number" step="any" value={formData.stop_loss} onChange={e => setFormData({ ...formData, stop_loss: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                <input placeholder={t.tp} type="number" step="any" value={formData.take_profit} onChange={e => setFormData({ ...formData, take_profit: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                <input placeholder={t.rr} type="number" step="any" value={formData.risk_rr} onChange={e => setFormData({ ...formData, risk_rr: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.pnl} ($)</label>
                            <input placeholder="$ PnL" type="number" step="any" value={formData.pnl} onChange={e => setFormData({ ...formData, pnl: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Result</label>
                            <select
                                value={formData.result}
                                onChange={e => setFormData({ ...formData, result: e.target.value as Result })}
                                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                            >
                                <option value="win">Win</option>
                                <option value="loss">Loss</option>
                                <option value="BE">BE</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Section: Psychology */}
                <section className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
                    <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#222222] flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold">{t.psychology}</span>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.emotionalState}</label>
                            <div className="flex flex-wrap gap-2">
                                {emotions.map(emotion => (
                                    <button
                                        key={emotion}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, emotional_state: emotion })}
                                        className={cn(
                                            "px-4 py-2 rounded-full border border-[#222222] text-sm font-medium transition-all active:scale-95",
                                            formData.emotional_state === emotion ? "bg-purple-600 border-transparent text-white" : "bg-transparent text-gray-400 hover:border-gray-600"
                                        )}
                                    >{emotion}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.executionQuality} (1-5)</label>
                            <input
                                type="range" min="1" max="5"
                                value={formData.execution_quality}
                                onChange={e => setFormData({ ...formData, execution_quality: Number(e.target.value) })}
                                className="w-full accent-blue-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1 uppercase">
                                <span>{t.terrible}</span>
                                <span>{t.perfect}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.notes}</label>
                            <textarea
                                rows={4}
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="..."
                                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </section>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-6 h-6" />
                    {loading ? t.loggingTrade : t.registerTrade}
                </button>
            </form>
        </div>
    );
}
