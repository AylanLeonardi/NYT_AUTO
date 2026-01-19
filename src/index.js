const { main } = require('./scraper/mainScraper');
const { askSearchTerm, askContinueWithLessThan50 } = require('./utils/userInterface');
const { exportToExcel } = require('./utils/excelExporter');

async function startApp() {
  try {
    console.log('NYTimes Scraper - Coleta de Notícias');
    
    const searchTerm = await askSearchTerm();
    
    console.log(`Buscando notícias sobre: "${searchTerm}"`);
    const articles = await main(searchTerm);
    
    console.log(`Resumo da coleta:`);
    console.log(`Termo buscado: ${searchTerm}`);
    console.log(`Artigos coletados: ${articles.length}/50`);
    
    if (articles.length < 50) {
      const shouldContinue = await askContinueWithLessThan50(articles.length);
      if (!shouldContinue) {
        console.log('Operação cancelada pelo usuário.');
        return;
      }
    }
    
    await exportToExcel(articles, searchTerm);
    console.log(`Arquivo gerado: noticias-${searchTerm.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
    
  } catch (error) {
    console.error('Erro durante a execução:', error.message);
    process.exit(1);
  }
}

startApp();