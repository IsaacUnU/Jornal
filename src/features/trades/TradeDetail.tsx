import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Trade, Screenshot } from '../../types';
import { ArrowLeft, Trash2, Edit2, Clock, Map, Activity, Brain, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { useI18n } from '../../lib/i18n';
import { analyzeTrade } from '../../services/ai';
import ReactMarkdown from 'react-markdown';

export default function TradeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, lang } = useI18n();
    const [trade, setTrade] = useState<Trade | null>(null);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchTradeData = async () => {
        const { data: tradeData } = await supabase
            .from('trades')
            .select('*')
            .eq('id', id)
            .single();

        if (tradeData) {
            setTrade(tradeData);

            const { data: screenData } = await supabase
                .from('screenshots')
                .select('*')
                .eq('trade_id', id);

            if (screenData) setScreenshots(screenData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTradeData();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this trade?')) return;
        const { error } = await supabase.from('trades').delete().eq('id', id);
        if (!error) navigate('/trades');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !trade) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${trade.user_id}/${trade.id}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('screenshots')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('screenshots')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('screenshots')
                .insert([{ trade_id: trade.id, image_url: publicUrl }]);

            if (dbError) throw dbError;

            fetchTradeData();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleAIAnalysis = async () => {
        if (!trade) return;
        setAnalyzing(true);
        try {
            const analysis = await analyzeTrade(trade, lang as 'en' | 'es');
            const { error } = await supabase
                .from('trades')
                .update({ ai_analysis: analysis })
                .eq('id', trade.id);

            if (error) throw error;
            setTrade({ ...trade, ai_analysis: analysis });
        } catch (error: any) {
            console.error("AI Analysis Error Detail:", error);
            alert(`${t.aiError}\n\nDetalles: ${error.message || 'Error desconocido'}`);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <div className="text-white p-10">Loading...</div>;
    if (!trade) return <div className="text-white p-10">Trade not found.</div>;

    return (
        <div className="space-y-10">
            <header className="flex items-center justify-between">
                <Link to="/trades" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-5 h-5" />
                    <span>{t.backToTrades}</span>
                </Link>
                <div className="flex items-center gap-3">
                    <Link to={`/trades/${trade.id}/edit`} className="p-3 rounded-xl bg-[#111111] border border-[#222222] text-gray-400 hover:text-blue-500 hover:border-blue-500/30 transition-all">
                        <Edit2 className="w-5 h-5" />
                    </Link>
                    <button onClick={handleDelete} className="p-3 rounded-xl bg-[#111111] border border-[#222222] text-gray-400 hover:text-red-500 hover:border-red-500/30 transition-all">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-[#111111] border border-[#222222] rounded-3xl p-6 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-extrabold tracking-tight">{trade.market}</h1>
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-xs font-bold uppercase",
                                        trade.direction === 'long' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                    )}>{trade.direction === 'long' ? t.long : t.short}</span>
                                </div>
                                <p className="text-gray-400 font-medium">{trade.model} • {format(new Date(trade.date), 'MMMM dd, yyyy')}</p>
                            </div>
                            <div className="text-left md:text-right">
                                <p className={cn(
                                    "text-4xl font-bold tracking-tight",
                                    trade.pnl >= 0 ? "text-emerald-500" : "text-red-500"
                                )}>
                                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}$
                                </p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Net Outcome</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#0a0a0a] rounded-2xl border border-[#222222]">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.entryPrice}</p>
                                <p className="text-lg font-bold">{trade.entry_price}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.sl}</p>
                                <p className="text-lg font-bold">{trade.stop_loss}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.tp}</p>
                                <p className="text-lg font-bold">{trade.take_profit || '0'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.rr}</p>
                                <p className="text-lg font-bold text-blue-500">{trade.risk_rr}RR</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gradient-to-br from-[#111111] to-[#0d0d0d] border border-blue-500/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(59,130,246,0.03)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                            <Sparkles className="w-16 h-16" />
                        </div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">{t.aiAnalysis}</h3>
                            </div>
                            <button
                                onClick={handleAIAnalysis}
                                disabled={analyzing}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed",
                                    analyzing && "px-4"
                                )}
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        <span>{t.analyzing}</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        <span>{trade.ai_analysis ? t.edit : t.analyzeBtn}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-[#0a0a0a]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#222222] min-h-[150px] relative z-10">
                            {trade.ai_analysis ? (
                                <div className="prose prose-invert max-w-none prose-sm prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-400 prose-p:leading-relaxed prose-strong:text-blue-400 prose-ul:text-gray-400">
                                    <ReactMarkdown>{trade.ai_analysis}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <p className="text-gray-500 font-medium italic max-w-md mx-auto leading-relaxed">
                                        {t.aiFeedbackPlaceholder}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-[#111111] border border-[#222222] rounded-3xl p-6 md:p-10">
                        <h3 className="text-sm font-bold uppercase text-gray-500 tracking-widest mb-6">Execution Screenshots</h3>
                        <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />

                        <div className="grid grid-cols-1 gap-6">
                            {screenshots.map((s) => (
                                <div key={s.id} className="rounded-2xl overflow-hidden border border-[#222222]">
                                    <img src={s.image_url} alt="Trade Screenshot" className="w-full h-auto block" />
                                </div>
                            ))}

                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={cn(
                                    "aspect-video bg-[#0a0a0a] rounded-2xl border-2 border-dashed border-[#222222] flex flex-col items-center justify-center text-gray-600 gap-3 group hover:border-blue-500/30 hover:bg-blue-500/[0.02] cursor-pointer transition-all",
                                    uploading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {uploading ? (
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-10 h-10 group-hover:text-blue-500" />
                                        <p className="font-medium text-sm md:text-base text-center px-4">{t.uploadScreenshot}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-[#111111] border border-[#222222] rounded-3xl p-8 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 text-purple-500 mb-4">
                                <Brain className="w-5 h-5" />
                                <span className="font-bold text-xs uppercase tracking-widest">{t.psychology}</span>
                            </div>
                            <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                                <p className="text-purple-400 font-bold text-lg mb-1">{trade.emotional_state}</p>
                                <p className="text-xs text-purple-400/60 leading-relaxed font-medium">Recorded emotion during entry. This state significantly influences decision quality.</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-blue-500 mb-4">
                                <Activity className="w-5 h-5" />
                                <span className="font-bold text-xs uppercase tracking-widest">{t.executionQuality}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={cn("flex-1 h-3 rounded-full", i < trade.execution_quality ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.03)]" : "bg-[#222222]")} />
                                ))}
                            </div>
                            <p className="text-xs text-blue-400/60 mt-3 font-medium">A quality score of {trade.execution_quality}/5 reflects how well you followed your plan.</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-gray-500 mb-4">
                                <Clock className="w-5 h-5" />
                                <span className="font-bold text-xs uppercase tracking-widest">Market Context</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold">
                                <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-xl border border-[#222222]">
                                    <Map className="w-4 h-4 text-gray-400" />
                                    <span>{trade.session} Session</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#111111] border border-[#222222] rounded-3xl p-8">
                        <h3 className="text-sm font-bold uppercase text-gray-500 tracking-widest mb-4">{t.notes}</h3>
                        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-[#222222] min-h-[200px]">
                            <p className="text-gray-300 italic text-sm leading-relaxed">
                                {trade.notes || t.noNotes}
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
