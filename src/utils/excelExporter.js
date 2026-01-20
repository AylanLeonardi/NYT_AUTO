const ExcelJS = require('exceljs');

async function exportToExcel(articles, searchTerm) {
    console.log('\nGerando arquivo Excel...');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Notícias');

    worksheet.columns = [
        { header: 'Título', key: 'titulo', width: 60 },
        { header: 'Data de Publicação', key: 'data_publicacao', width: 20 },
        { header: 'Descrição', key: 'descricao', width: 100 },
    ];

    articles.forEach(article => {
        worksheet.addRow({
            titulo: article.titulo,
            data_publicacao: article.data_publicacao,
            descricao: article.descricao,
        });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    const fileName = `noticias-${searchTerm.toLowerCase().replace(/\s+/g, '-')}.xlsx`;
    await workbook.xlsx.writeFile(fileName);

    return fileName;
}

module.exports = { exportToExcel };