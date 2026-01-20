# NYTimes News Scraper

Automação desenvolvida em Node.js para coleta de dados do portal [The New York Times](https://www.nytimes.com/). O projeto utiliza técnicas de web scraping para extrair informações sobre temas específicos e organizá-las em planilhas Excel.

---

## Descrição do Projeto

Este script foi criado para automatizar a busca e extração de notícias. Ele navega pelo site do NYTimes, realiza uma busca dinâmica com o termo fornecido pelo usuário e coleta no mínimo 50 notícias únicas.

### Diferenciais implementados:
- **Filtro Anti-Duplicidade**: O código valida notícias pelo título normalizado, ignorando repetições mesmo que o site apresente URLs diferentes para o mesmo conteúdo.
- **Deep Scraping**: Caso o título da notícia não seja carregado na lista principal (comum no layout do NYT), o bot abre o link automaticamente, extrai o título interno e fecha a aba.
- **Tratamento de Cookies**: Clique automático no modal de consentimento "Aceitar tudo" via JavaScript injection.

---

## Necessidades (Bibliotecas e Ambiente)

### 1. Bibliotecas Instaladas
O projeto utiliza as seguintes dependências:
- `puppeteer` & `puppeteer-extra`: Motor de navegação para automação.
- `puppeteer-extra-plugin-stealth`: Evita a detecção do bot pelo site.
- `puppeteer-extra-plugin-adblocker`: Acelera o carregamento bloqueando anúncios.
- `exceljs`: Manipulação de arquivos Excel (.xlsx).
- `dotenv`: Gerenciamento de variáveis de ambiente.
- `readline`: Interface interativa via terminal.

### 2. Configuração do Arquivo .env
O uso do arquivo `.env` é obrigatório para configurar o caminho do seu navegador e parâmetros de busca:

1. Renomeie o arquivo `.env.example` para `.env`.
2. Configure as seguintes variáveis:
   ```env
   # Caminho do executável do navegador (Edge ou Chrome) no seu computador
   EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
   
   # Limites de coleta
   MAX_ARTICLES=50
   MAX_PAGE_LOADS=20
   ```

---

## Prepare o ambiente

### 1. Clone o repositório
Utilize o comando `git clone [https://github.com/AylanLeonardi/NYT_AUTO.git](https://github.com/AylanLeonardi/NYT_AUTO.git)` no terminal

### 2. Entre na pasta
Use o comando `cd NYT_AUTO`

### 3. Instale as dependências necessárias
Realize a instalação das bibliotecas citadas anteriormente usando o comando `npm install`

### 4. Inicie o código
Para rodar o script, você deve passar o tema desejado entre aspas como argumento:

```bash
node src/index.js "Seu Tema Aqui"
```

---

## Estrutura e Explicação do Código
O projeto segue uma arquitetura modular para facilitar a manutenção e leitura:

### 1. Index.js
`src/index.js` é o ponto de entrada da aplicação. Gerencia o fluxo entre a interface (perguntas ao usuário) e o motor de busca.

### 2. mainScraper.js
`src/scraper/mainScraper.js` é a classe principal que controla o ciclo de vida do Puppeteer, o tratamento de cookies e a lógica de scroll infinito para carregar novas notícias.

### 3. pageHandler.js
`src/scraper/pageHandler.js` é um módulo especializado em gerenciar abas secundárias, garantindo que elas sejam abertas e fechadas corretamente após a extração de títulos faltantes.

### 4. excelExporter.js
`src/utils/excelExporter.js` utiliza a biblioteca exceljs para criar a planilha. Ele configura o cabeçalho, define a largura das colunas, aplica estilos (negrito e cores) e salva o arquivo com o nome do termo buscado.

### 5. dateFormatter.js
`src/utils/dateFormatter.js` é responsável por tratar as datas variadas do NYTimes. Ele converte termos relativos ou formatos americanos para o padrão ISO (YYYY-MM-DD) exigido, garantindo a padronização no Excel.

### 6. userInterface.js
`src/utils/userInterface.js` gerencia a interação com o usuário no terminal usando o módulo readline. Ele gerencia a confirmação caso o bot encontre menos de 50 resultados.

### 7. waitHelper.js
`src/utils/waitHelper.js` contém funções de pausa inteligente. Ele ajuda a esperar o carregamento de elementos dinâmicos e animações do site, evitando que o bot tente clicar em algo que ainda não apareceu.

### 8. constants.js
`src/config/constants.js` centraliza todos os seletores CSS e configurações de limites (como o número de notícias). Isso permite que, se o site mudar o layout, você precise alterar o código em apenas um lugar.

---

## Resumo do fluxo

### 1. Inicio
Ao executar o projeto, o fluxo de trabalho seguido pelo software é:

### 2. Entrada de Dados
O usuário digita o tema desejado no terminal.

### 3. Inicialização
O bot abre o navegador (Edge/Chrome) através do caminho configurado no .env e acessa o site do NYTimes.

### 4. Controle de Acesso: 
O bot identifica e clica no botão "Aceitar Tudo" do banner de cookies para liberar a visualização da página.

### 5. Busca e Coleta
O bot realiza a pesquisa e rola a página (clicando em "Show More") até identificar 50 notícias únicas.

### 6. Exceção
Se uma notícia estiver sem título na lista, o bot abre o link em uma aba separada para extrair o título real e depois a fecha.

### 7. Filtro Inteligente:
Cada notícia passa por uma verificação de título. Se o título já foi coletado, ele é descartado para evitar duplicatas no arquivo final.

### 8. Exportação
Após atingir a meta (ou o limite de resultados disponíveis), os dados (Título, Data ISO, Descrição e URL) são formatados e salvos em um arquivo Excel profissional na raiz do projeto.
