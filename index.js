const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const { cloneWebsite, sanitizeFilename } = require("./website_cloner");
const { cloneDiscordServer } = require("./discord_cloner");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from a 'public' directory (will be created later for frontend)
app.use(express.static(path.join(__dirname, "public")));
app.use("/cloned_sites", express.static(path.join(__dirname, "cloned_sites")));

app.post("/clone", async (req, res) => {
    const { url, name } = req.body;

    if (!url || !name) {
        return res.status(400).json({ error: "URL e nome do site são obrigatórios." });
    }

    try {
        const sanitizedName = sanitizeFilename(name);
        const outputDir = path.join(__dirname, "cloned_sites", sanitizedName);
        const clonedHtml = await cloneWebsite(url, outputDir);
        
        if (clonedHtml) {
            const outputPath = path.join(outputDir, "index.html");
            await fs.writeFile(outputPath, clonedHtml);

            res.status(200).json({ message: "Site clonado com sucesso!", path: `/cloned_sites/${sanitizedName}/index.html` });
        } else {
            res.status(500).json({ error: "Erro ao clonar o site." });
        }
    } catch (error) {
        console.error("Erro no endpoint /clone:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

app.post("/clone-discord", async (req, res) => {
    const { token, originalServerId, targetServerId } = req.body;

    if (!token || !originalServerId || !targetServerId) {
        return res.status(400).json({ error: "Token, ID do servidor original e ID do servidor destino são obrigatórios." });
    }

    try {
        const result = await cloneDiscordServer(token, originalServerId, targetServerId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erro no endpoint /clone-discord:", error);
        res.status(500).json({ error: error.message || "Erro interno do servidor." });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


