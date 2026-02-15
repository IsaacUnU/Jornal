export type Session = 'Asia' | 'London' | 'NY';
export type Direction = 'long' | 'short';
export type Result = 'win' | 'loss' | 'BE';

export interface Trade {
    id: string;
    user_id: string;
    date: string;
    market: string;
    session: Session;
    direction: Direction;
    entry_price: number;
    stop_loss: number;
    take_profit: number;
    risk_rr: number;
    result: Result;
    pnl: number;
    model: string;
    execution_quality: number;
    emotional_state: string;
    notes?: string;
    ai_analysis?: string;
    created_at: string;
}

export interface Screenshot {
    id: string;
    trade_id: string;
    image_url: string;
    created_at: string;
}

export interface TradeWithScreenshots extends Trade {
    screenshots: Screenshot[];
}
