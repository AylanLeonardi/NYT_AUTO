const { MAX_CONCURRENT_TABS } = require('../config/constants');
const { wait, waitWithLog } = require('../utils/waitHelper');

class PageHandler {
    constructor(browser, mainPage) {
        this.browser = browser;
        this.mainPage = mainPage;
        this.activeTabs = new Set();
    }

    async extractTitleFromLink(url) {
        if (this.activeTabs.size >= MAX_CONCURRENT_TABS) {
            await this.waitForTabClose();
        }

        console.log(`Abrindo: ${url.substring(0, 80)}...`);

        const newPage = await this.browser.newPage();
        this.activeTabs.add(newPage);

        try {
            await newPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            await newPage.setDefaultNavigationTimeout(30000);

            await newPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            const title = await newPage.evaluate(() => {
                const ogTitle = document.querySelector('meta[property="og:title"]');
                if (ogTitle && ogTitle.content) return ogTitle.content.trim();

                const h1 = document.querySelector('h1');
                if (h1 && h1.textContent.trim()) return h1.textContent.trim();

                const pageTitle = document.title;
                if (pageTitle) {
                    return pageTitle
                        .replace(' - The New York Times', '')
                        .replace(' - The Athletic', '')
                        .replace('| The New York Times', '')
                        .trim();
                }

                return 'Título não encontrado';
            });

            return title || 'Título não disponível';

        } catch (error) {
            console.log(`   Erro ao extrair título: ${error.message}`);
            return this.extractTitleFromURL(url);
        } finally {
            await newPage.close();
            this.activeTabs.delete(newPage);
            console.log(`Título extraído (aba fechada)`);
            await this.mainPage.bringToFront();
            await waitWithLog(500)
        }
    }

    extractTitleFromURL(url) {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(part => part);
            const lastPart = pathParts[pathParts.length - 1] || '';
            return lastPart
                .replace(/-/g, ' ')
                .replace(/\?.*/, '')
                .replace(/\.html$/, '')
                .trim();
        } catch {
            return 'Título da URL';
        }
    }

    async waitForTabClose() {
        console.log('Aguardando aba fechar...');
        while (this.activeTabs.size >= MAX_CONCURRENT_TABS) {
            await waitWithLog(1000)
        }
    }
}

module.exports = PageHandler;