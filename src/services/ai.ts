import type { Trade } from "../types";

const getApiKey = () => import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";

export async function analyzeTrade(trade: Trade, lang: 'en' | 'es' = 'en') {
    const apiKey = getApiKey().trim();
    if (!apiKey) {
        throw new Error("No se encontró la API Key. Revisa tu archivo .env");
    }

    const promptText = lang === 'es'
        ? `Actúa como un coach de trading profesional. Analiza este trade: Mercado ${trade.market}, ${trade.direction}, Resultado ${trade.result}, PnL ${trade.pnl}$, Setup ${trade.model}, Calidad ${trade.execution_quality}/5, Estado ${trade.emotional_state}. Responde en Español detallando qué se hizo bien, qué falló y consejo psicológico. Usa Markdown.`
        : `Act as a professional trading coach. Analyze this trade: Market ${trade.market}, ${trade.direction}, Result ${trade.result}, PnL ${trade.pnl}$, Setup ${trade.model}, Quality ${trade.execution_quality}/5, State ${trade.emotional_state}. Respond in English with what went well, what failed and psychological advice. Use Markdown.`;

    // Listado actualizado según el diagnóstico de tu consola
    const modelsToTry = [
        "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-pro"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Intentando con modelo: ${modelName}...`);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }]
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`¡Éxito con el modelo: ${modelName}!`);
                return data.candidates[0].content.parts[0].text;
            } else {
                console.warn(`Fallo con ${modelName}:`, data.error?.message || response.statusText);
                lastError = data.error?.message || response.statusText;
            }
        } catch (err: any) {
            console.warn(`Error de red con ${modelName}:`, err.message);
            lastError = err.message;
        }
    }

    // Si llegamos aquí, todos fallaron. Vamos a diagnosticar por qué listando los modelos disponibles.
    console.error("Todos los modelos fallaron. Iniciando autodiagnóstico...");
    try {
        const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const listData = await listResponse.json();
        console.log("Modelos disponibles para tu API Key:", listData);

        if (listData.models && listData.models.length > 0) {
            const availableNames = listData.models.map((m: any) => m.name.split('/').pop()).join(", ");
            throw new Error(`Ninguno de los modelos estándar funcionó. Tus modelos disponibles son: ${availableNames}. Por favor, avisa para que actualice la configuración.`);
        }
    } catch (diagErr) {
        console.error("Error en el diagnóstico:", diagErr);
    }

    throw new Error(`No se pudo conectar con la IA después de varios intentos. Error final: ${lastError}`);
}
