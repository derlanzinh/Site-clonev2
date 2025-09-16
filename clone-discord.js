const { cloneDiscordServer } = require("../discord_cloner");

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { token, originalServerId, targetServerId } = req.body;

    if (!token || !originalServerId || !targetServerId) {
        return res.status(400).json({ error: "Token, ID do servidor original e ID do servidor destino são obrigatórios." });
    }

    try {
        const result = await cloneDiscordServer(token, originalServerId, targetServerId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erro no endpoint /api/clone-discord:", error);
        res.status(500).json({ error: error.message || "Erro interno do servidor." });
    }
};

