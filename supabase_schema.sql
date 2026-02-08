-- Trading Journal Supabase Schema

-- Tables
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    market TEXT NOT NULL, -- e.g., "EURUSD", "BTCUSDT"
    session TEXT NOT NULL CHECK (session IN ('Asia', 'London', 'NY')),
    direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
    entry_price NUMERIC NOT NULL,
    stop_loss NUMERIC NOT NULL,
    take_profit NUMERIC NOT NULL,
    risk_rr NUMERIC NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'BE')),
    pnl NUMERIC NOT NULL,
    model TEXT NOT NULL, -- Setup used (e.g., "SMC", "Breakout")
    execution_quality INT NOT NULL CHECK (execution_quality BETWEEN 1 AND 5),
    emotional_state TEXT NOT NULL, -- "Calm", "Anxious", "Fearful", "Greedy", etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;

-- Policies for trades
DROP POLICY IF EXISTS "Users can create their own trades" ON public.trades;
CREATE POLICY "Users can create their own trades" 
ON public.trades FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
CREATE POLICY "Users can view their own trades" 
ON public.trades FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trades" ON public.trades;
CREATE POLICY "Users can update their own trades" 
ON public.trades FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own trades" ON public.trades;
CREATE POLICY "Users can delete their own trades" 
ON public.trades FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for screenshots
DROP POLICY IF EXISTS "Users can view their own screenshots" ON public.screenshots;
CREATE POLICY "Users can view their own screenshots" 
ON public.screenshots FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.trades 
    WHERE id = trade_id AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert their own screenshots" ON public.screenshots;
CREATE POLICY "Users can insert their own screenshots" 
ON public.screenshots FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.trades 
    WHERE id = trade_id AND user_id = auth.uid()
));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON public.trades(date DESC);
CREATE INDEX IF NOT EXISTS idx_screenshots_trade_id ON public.screenshots(trade_id);
