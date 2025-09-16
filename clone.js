const { cloneWebsite, sanitizeFilename } = require("../website_cloner");
const path = require("path");
const fs = require("fs-extra");

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

    const { url, name } = req.body;

    if (!url || !name) {
        return res.status(400).json({ error: "URL e nome do site são obrigatórios." });
    }

    try {
        const sanitizedName = sanitizeFilename(name);
        const outputDir = `/tmp/cloned_sites/${sanitizedName}`;
        const clonedHtml = await cloneWebsite(url, outputDir);
        
        if (clonedHtml) {
            const outputPath = path.join(outputDir, "index.html");
            await fs.writeFile(outputPath, clonedHtml);

            // Para Vercel, retornamos o HTML diretamente
            res.status(200).json({ 
                message: "Site clonado com sucesso!", 
                html: clonedHtml,
                name: sanitizedName
            });
        } else {
            res.status(500).json({ error: "Erro ao clonar o site." });
        }
    } catch (error) {
        console.error("Erro no endpoint /api/clone:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

