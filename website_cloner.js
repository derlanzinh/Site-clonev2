const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const url = require("url");
const fs = require("fs-extra");

const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9_\-.]/g, "_");
};

const fetchPage = async (pageUrl) => {
    try {
        const response = await axios.get(pageUrl);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar a página: ${error.message}`);
        return null;
    }
};

const downloadResource = async (resource_url, outputDir) => {
    try {
        const absoluteLink = new URL(resource_url).href;
        const response = await axios.get(absoluteLink, { responseType: "arraybuffer" });
        const parsedUrl = new URL(absoluteLink);
        const filename = sanitizeFilename(path.basename(parsedUrl.pathname));
        const resourcePath = path.join(outputDir, filename);
        await fs.writeFile(resourcePath, response.data);
        return filename;
    } catch (error) {
        console.error(`Erro ao baixar recurso ${resource_url}: ${error.message}`);
        return null;
    }
};

const updateLinksAndDownloadResources = async (html, baseUrl, outputDir) => {
    const $ = cheerio.load(html);
    const promises = [];

    const processElement = async (elem, attr) => {
        const link = $(elem).attr(attr);
        if (link) {
            try {
                const absoluteLink = new URL(link, baseUrl).href;
                const downloadedFilename = await downloadResource(absoluteLink, outputDir);
                if (downloadedFilename) {
                    $(elem).attr(attr, downloadedFilename);
                }
            } catch (error) {
                console.error(`Erro ao processar link ${link}: ${error.message}`);
            }
        }
    };

    $("a[href]").each((i, elem) => promises.push(processElement(elem, "href")));
    $("img[src]").each((i, elem) => promises.push(processElement(elem, "src")));
    $("link[href]").each((i, elem) => promises.push(processElement(elem, "href")));
    $("script[src]").each((i, elem) => promises.push(processElement(elem, "src")));

    await Promise.all(promises);
    return $.html();
};

const cloneWebsite = async (targetUrl, outputDir) => {
    try {
        const html = await fetchPage(targetUrl);
        if (!html) {
            throw new Error("Failed to fetch the page HTML");
        }
        await fs.ensureDir(outputDir); // Ensure the output directory exists
        return updateLinksAndDownloadResources(html, targetUrl, outputDir);
    } catch (error) {
        console.error("Erro ao clonar o site:", error.message);
        return null;
    }
};

module.exports = { cloneWebsite, sanitizeFilename };


