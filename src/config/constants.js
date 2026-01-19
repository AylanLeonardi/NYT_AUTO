module.exports = {
    NUM_ARTICLES: parseInt(process.env.NUM_ARTICLES) || 50,
    MAX_PAGE_LOADS: parseInt(process.env.MAX_PAGE_LOADS) || 20,
    MAX_CONCURRENT_TABS: 2,

    SELECTORS: {
        SEARCH_BUTTON: 'button[data-testid="search-button"]',
        SEARCH_INPUT: 'input[data-testid="search-input"]',
        SEARCH_SUBMIT: 'button[data-testid="search-submit"]',
        SEARCH_RESULTS: '[data-testid="search-results"]',
        RESULT_STATUS: '[data-testid="SearchForm-status"]',
        ARTICLE_ITEM: '[data-testid="search-bodega-result"]',
        ARTICLE_DATE: '[data-testid="todays-date"]',
        ARTICLE_TITLE: 'h4',
        ARTICLE_DESC: '.kyt--w4yD',
        ARTICLE_LINK: 'a[href]',
        SHOW_MORE_BUTTON: '[data-testid="search-show-more-button"]'
    }
};