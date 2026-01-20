require('dotenv').config();

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const PageHandler = require('./pageHandler');
const { formatDate } = require('../utils/dateFormatter');
const { wait, waitWithLog } = require('../utils/waitHelper');
const { SELECTORS, NUM_ARTICLES, MAX_PAGE_LOADS } = require('../config/constants');

class NYTimesScraper {
    constructor() {
        this.browser = null;
        this.mainPage = null;
        this.pageHandler = null;
        this.articles = [];
        this.processedTitles = new Set();
        this.processedLinks = new Set();
        this.lastProcessedIndex = 0;
    }

    async initialize() {
        console.log('Inicializando navegador...');
        const edgePath = process.env.EDGE_PATH;

        this.browser = await puppeteer.launch({
            headless: false,
            executablePath: edgePath,
            args: ['--start-maximized']
        });

        this.mainPage = await this.browser.newPage();
        this.pageHandler = new PageHandler(this.browser, this.mainPage);
    }

    async handleCookieBanner() {
        try {
            console.log('Tentando remover modal de cookies...');
            await this.mainPage.evaluate(() => {
                const button = document.getElementById('fides-accept-all-button');
                if (button) button.click();
            });
            await waitWithLog(2000);
        } catch (e) {
            console.log('Banner não encontrado ou erro ao clicar.');
        }
    }

    async searchArticles(searchTerm) {
        await this.mainPage.goto('https://www.nytimes.com/', { waitUntil: 'networkidle2' });
        
        await this.handleCookieBanner();

        try {
            await this.mainPage.waitForSelector(SELECTORS.SEARCH_BUTTON, { visible: true });
            await this.mainPage.click(SELECTORS.SEARCH_BUTTON);
            await this.mainPage.waitForSelector(SELECTORS.SEARCH_INPUT, { visible: true });
            await this.mainPage.type(SELECTORS.SEARCH_INPUT, searchTerm);
            await this.mainPage.keyboard.press('Enter');
            await this.mainPage.waitForSelector(SELECTORS.SEARCH_RESULTS);
        } catch (error) {
            const searchUrl = `https://www.nytimes.com/search?query=${encodeURIComponent(searchTerm)}`;
            await this.mainPage.goto(searchUrl, { waitUntil: 'networkidle2' });
        }
    }

    async collectArticles() {
        let pageLoads = 0;
        this.articles = [];
        this.processedTitles.clear();
        this.processedLinks.clear();
        this.lastProcessedIndex = 0;

        while (this.articles.length < NUM_ARTICLES && pageLoads < MAX_PAGE_LOADS) {
            console.log(`Coletados: ${this.articles.length}/${NUM_ARTICLES} | Índice atual: ${this.lastProcessedIndex}`);

            const visibleArticles = await this.extractVisibleArticles();
            const totalArticlesOnPage = visibleArticles.length;

            console.log(`Total de artigos na página: ${totalArticlesOnPage}`);

            for (let i = this.lastProcessedIndex; i < totalArticlesOnPage; i++) {
                if (this.articles.length >= NUM_ARTICLES) break;

                const article = visibleArticles[i];
                const articleLink = article.link;

                if (!articleLink || this.processedLinks.has(articleLink)) {
                    console.log(`[${i}] [SKIP] Link já processado ou vazio`);
                    continue;
                }

                this.processedLinks.add(articleLink);

                let finalTitle = article.title.trim();

                if (finalTitle === "" && articleLink) {
                    console.log(`[${i}] [DEEP SCAN] Título vazio, extraindo: ${articleLink.substring(0, 60)}...`);
                    finalTitle = await this.pageHandler.extractTitleFromLink(articleLink);
                }

                const normalizedTitle = finalTitle.toLowerCase().trim();

                if (normalizedTitle !== "" && normalizedTitle !== "título não disponível") {
                    if (!this.processedTitles.has(normalizedTitle)) {
                        
                        this.processedTitles.add(normalizedTitle);
                        
                        this.articles.push({
                            titulo: finalTitle,
                            data_publicacao: formatDate(article.date),
                            descricao: article.description,
                        });

                        console.log(`[${i}] ✅ [${this.articles.length}/${NUM_ARTICLES}] ${finalTitle.substring(0, 50)}...`);
                    } else {
                        console.log(`[${i}] [SKIP] Título duplicado: "${finalTitle.substring(0, 40)}..."`);
                    }
                } else {
                    console.log(`[${i}] [SKIP] Título inválido`);
                }
            }

            this.lastProcessedIndex = totalArticlesOnPage;
            console.log(`📍 Novo índice salvo: ${this.lastProcessedIndex}`);

            if (this.articles.length < NUM_ARTICLES) {
                const hasMore = await this.loadMoreArticles();
                if (!hasMore) {
                    console.log('🏁 Não há mais artigos para carregar.');
                    break;
                }
                pageLoads++;
                await waitWithLog(2500, '⏳ Aguardando próxima página'); 
            }
        }
        return this.articles;
    }

    async extractVisibleArticles() {
        return await this.mainPage.evaluate((SELECTORS) => {
            const items = document.querySelectorAll(SELECTORS.ARTICLE_ITEM);
            return Array.from(items).map(item => {
                const titleEl = item.querySelector(SELECTORS.ARTICLE_TITLE);
                const linkEl = item.querySelector(SELECTORS.ARTICLE_LINK);
                return {
                    title: titleEl ? titleEl.textContent.trim() : '',
                    link: linkEl ? linkEl.href : '',
                    date: item.querySelector(SELECTORS.ARTICLE_DATE)?.textContent || '',
                    description: item.querySelector(SELECTORS.ARTICLE_DESC)?.textContent || '',
                    hasEmptyTitle: !titleEl || titleEl.textContent.trim() === ''
                };
            });
        }, SELECTORS);
    }

    async loadMoreArticles() {
        try {
            const btn = await this.mainPage.$(SELECTORS.SHOW_MORE_BUTTON);
            if (btn) {
                await btn.click();
                console.log('🔄 Botão "Show More" clicado');
                return true;
            }
            return false;
        } catch { return false; }
    }

    async close() {
        if (this.browser) await this.browser.close();
    }
}

async function main(searchTerm) {
    const scraper = new NYTimesScraper();
    try {
        await scraper.initialize();
        await scraper.searchArticles(searchTerm);
        return await scraper.collectArticles();
    } finally {
        await scraper.close();
    }
}

module.exports = { main };