const { main } = require('./scraper/mainScraper');
const { askContinueWithLessThan50 } = require('./utils/userInterface');
const { exportToExcel } = require('./utils/excelExporter');

async function startApp() {
  try {
    const searchTerm = process.argv[2];

    if (!searchTerm) {
      console.error('❌ Erro: Você deve passar o tema da busca como argumento.');
      console.log('Exemplo: node src/index.js "tecnologia"');
      process.exit(1);
    }

    console.log('🚀 NYTimes Scraper - Coleta de Notícias\n');
    console.log(`🔍 Buscando notícias sobre: "${searchTerm}"...\n`);
    
    const articles = await main(searchTerm);
    
    console.log(`\n📊 Resumo da coleta:`);
    console.log(`- Termo buscado: ${searchTerm}`);
    console.log(`- Artigos coletados: ${articles.length}/50`);
    
    if (articles.length < 50 && articles.length > 0) {
      const shouldContinue = await askContinueWithLessThan50(articles.length);
      if (!shouldContinue) {
        console.log('❌ Operação cancelada pelo usuário.');
        return;
      }
    } else if (articles.length === 0) {
        console.log('❌ Nenhum artigo encontrado para este termo.');
        return;
    }
    
    await exportToExcel(articles, searchTerm);
    console.log(`\n✅ Arquivo gerado: noticias-${searchTerm.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
    process.exit(1);
  }
}

startApp();