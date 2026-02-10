import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';

type AuthMode = 'login' | 'register' | 'forgot';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<AuthMode>('login');
    const { t } = useI18n();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (mode === 'register') {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) alert(error.message);
            else alert('Check your email for the confirmation link!');
        } else if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) alert(error.message);
        } else if (mode === 'forgot') {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            if (error) alert(error.message);
            else alert(t.resetSent);
            setMode('login');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white text-center">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
                        <span className="font-extrabold text-2xl">TJ</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-2 uppercase">
                        {t.loginTitle}
                    </h2>
                    <p className="text-gray-400 font-medium">
                        {t.loginSubtitle}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="mt-8 space-y-6 bg-[#111111] p-8 rounded-3xl border border-[#222222] shadow-xl text-left">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t.email}</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                placeholder="name@example.com"
                            />
                        </div>
                        {mode !== 'forgot' && (
                            <div>
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.password}</label>
                                    <button
                                        type="button"
                                        onClick={() => setMode('forgot')}
                                        className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-tighter transition-colors"
                                    >
                                        {t.forgotPassword}
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-wider"
                    >
                        {loading ? '...' : (
                            mode === 'register' ? t.createAccountBtn :
                                mode === 'forgot' ? t.resetPasswordBtn :
                                    t.loginBtn
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="w-full text-center text-sm font-semibold text-gray-500 hover:text-white transition-colors"
                    >
                        {mode === 'register' ? t.alreadyUser : (mode === 'forgot' ? t.backToLogin : t.newUser)}
                    </button>
                </form>
            </div>
        </div>
    );
}
