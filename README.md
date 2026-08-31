# Programa Motivacional · Teo Neto

Programa de hábitos diários — um **plano escrito** ([PLANO.md](PLANO.md)) e um **app web** que executa esse plano no dia a dia: hábitos, sequência (streak), pontos, níveis, medalhas, diário e histórico.

Rotina contínua: não tem data de término, o objetivo é a constância.

## Como usar

Abra o `index.html` no navegador — é só isso. Não há build, dependências ou servidor obrigatório.

```bash
# opcional: servir localmente
python3 -m http.server 8000
# depois: http://localhost:8000
```

No celular, adicione a página à tela inicial para abrir como um app.

## O que o app faz

- **Hoje** — frase motivacional do dia (muda todo dia), lista de hábitos com marcação em um toque, anel de progresso, quadro **Minhas atividades**, diário da "vitória do dia" e registro de energia (1 a 5).
- **Minhas atividades** — objetivos que atravessam semanas (livro, curso, projeto). A lista mostra o nome com uma **régua de progresso** embaixo. Cada atividade se divide em **5 pontos definidos por você**, valendo 20% cada: concluir um ponto acende uma fatia do **círculo**, e quando as cinco acendem o círculo fecha e a atividade é concluída sozinha. Guarda também a anotação de onde você parou e a data de cada ponto concluído.
- **Progresso** — sequência atual e melhor sequência, dias ativos e perfeitos, mapa de calor das últimas 12 semanas, desempenho de cada hábito nos últimos 30 dias e revisão dos últimos 7 dias com média e recado automático.
- **Conquistas** — 12 medalhas, de "Primeiro Passo" a "Centurião" (100 dias seguidos).
- **Ajustes** — nome, objetivo do programa, criar/desativar/remover hábitos (com sugestões prontas), exportar e importar backup, reiniciar tudo.

### Regras de pontuação

- Cada hábito vale os pontos definidos nele (padrão 10; ajustável de 1 a 100).
- Dia com todos os hábitos ativos cumpridos = **dia perfeito**, +20 de bônus.
- Os pontos acumulados sobem o nível, de *Semente* (0) a *Mestre* (6500). A tabela completa está no [plano](PLANO.md#5-pontos-níveis-e-medalhas).
- A sequência conta dias seguidos com pelo menos um hábito cumprido.

## Publicar online

O app é estático — não precisa de build nem de servidor.

**Render:** crie um **Static Site** (não Web Service), aponte para este repositório e use:

| Campo | Valor |
|---|---|
| Root Directory | *(vazio)* |
| Build Command | *(vazio)* |
| Publish Directory | `.` |

O arquivo `render.yaml` na raiz já traz essa configuração — se você criar o serviço via **Blueprint**, o Render preenche tudo sozinho.

**Se mesmo assim for por Web Service** (o Render exige um Start Command nessa tela), o projeto traz um servidor estático mínimo, sem dependências:

| Campo | Valor |
|---|---|
| Language | `Node` |
| Build Command | *(vazio)* |
| Start Command | `npm start` |

> Prefira Static Site: o Web Service gratuito hiberna após 15 minutos parado e leva quase um minuto para acordar. Static Site é gratuito e fica sempre no ar.

**GitHub Pages** (alternativa ainda mais simples, e o repositório já está pronto para ela):

1. Abra o repositório no GitHub → aba **Settings** (no celular ou tablet ela pode estar atrás do ícone `⋯`).
2. No menu da esquerda, clique em **Pages**.
3. Em *Build and deployment* → **Source**: `Deploy from a branch`.
4. **Branch**: selecione a branch do projeto e a pasta `/ (root)` → **Save**.
5. Aguarde 1 a 2 minutos e recarregue a página: o link aparece no topo.

O endereço final é:

```
https://gilsonbolivar-maker.github.io/TEO/
```

A partir daí, todo `git push` na branch publicada atualiza o site sozinho. O arquivo `.nojekyll` na raiz evita que o GitHub tente processar o projeto como um site Jekyll.

## Instalar como aplicativo (PWA)

O programa é um Progressive Web App: instala na tela de início e **funciona sem internet**.

**iPhone / iPad:** abra o site no Safari → botão de compartilhar → **Adicionar à Tela de Início**.
**Android:** Chrome → menu `⋮` → **Instalar aplicativo**.
**Computador:** ícone de instalar na barra de endereço do Chrome ou Edge.

Depois de instalado, o app abre em tela cheia, com ícone próprio, sem barra de navegador, e carrega mesmo em modo avião — o `sw.js` guarda os arquivos no aparelho.

> Ao alterar arquivos do app, suba a versão em `sw.js` (`const VERSAO = 'teo-v1'`) para os aparelhos já instalados receberem a atualização.

### Lembrete diário

O app **não envia notificação sozinho** — push de verdade exigiria um servidor. A forma que funciona hoje, sem custo:

1. Abra **Atalhos** → aba **Automação** → **+**
2. **Hora do Dia** → escolha o horário
3. Repetir **Diariamente**, executar **Imediatamente**
4. Ação **Abrir app** → **Teo**

As mesmas instruções estão dentro do app, na aba Ajustes.

## Dados e privacidade

Tudo é salvo no `localStorage` **do navegador que você usa** — nada sai do aparelho, não há servidor nem conta. Consequências práticas:

- Trocar de navegador ou aparelho começa do zero.
- Limpar dados do site apaga o histórico.
- Use **Ajustes → Exportar backup** de vez em quando (o plano sugere uma vez por mês) e **Importar backup** para restaurar ou migrar.

## Estrutura

```
index.html                  estrutura da página
manifest.json               identidade do app instalado (nome, ícones, cores)
sw.js                       service worker: guarda o app para uso sem internet
assets/img/                 ícones do aplicativo
servidor.js                 servidor estático opcional (só para Render Web Service)
package.json                define o comando `npm start`
assets/css/estilo.css       estilos (tema escuro, com versão clara automática)
assets/js/dados.js          frases, hábitos sugeridos, níveis e medalhas
assets/js/armazenamento.js  leitura/escrita no localStorage, datas, backup
assets/js/estatisticas.js   pontos, sequências, níveis, desempenho
assets/js/app.js            renderização e eventos
PLANO.md                    o programa escrito: rituais, regras e protocolos
render.yaml                 configuração de publicação no Render (site estático)
.nojekyll                   desliga o processamento Jekyll no GitHub Pages
```

## Personalizar

- **Frases:** edite o array `FRASES` em `assets/js/dados.js`.
- **Hábitos iniciais e sugestões:** `HABITOS_PADRAO` e `HABITOS_SUGERIDOS` no mesmo arquivo.
- **Níveis e medalhas:** `NIVEIS` e `CONQUISTAS`, também em `dados.js`.
- **Bônus de dia perfeito:** `BONUS_DIA_PERFEITO` em `assets/js/estatisticas.js`.
