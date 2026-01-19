function formatDate(dateString) {
  if (!dateString || dateString.trim() === '') {
    return new Date().toISOString().split('T')[0];
  }

  let cleanDate = dateString
    .replace('aria-label="', '')
    .replace('"', '')
    .trim();

  if (!cleanDate.match(/\d{4}/)) {
    cleanDate += `, ${new Date().getFullYear()}`;
  }

  try {
    const date = new Date(cleanDate);
    if (isNaN(date.getTime())) {
      throw new Error('Data inválida');
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.log(`!Erro ao formatar data: "${dateString}"`);
    return new Date().toISOString().split('T')[0];
  }
}

module.exports = { formatDate };