const readline = require('readline');

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

function askSearchTerm() {
    const rl = createInterface();

    return new Promise((resolve) => {
        rl.question('Digite o termo para busca no NYTimes: ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function askContinueWithLessThan50(count) {
    const rl = createInterface();

    return new Promise((resolve) => {
        rl.question(`\nApenas ${count} artigos encontrados (menos que 50). Exportar mesmo assim? (s/n): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 's');
        });
    });
}

module.exports = {
    askSearchTerm,
    askContinueWithLessThan50
};