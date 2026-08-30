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

- **Hoje** — frase motivacional do dia (muda todo dia), lista de hábitos com marcação em um toque, anel de progresso, diário da "vitória do dia" e registro de energia (1 a 5).
- **Progresso** — sequência atual e melhor sequência, dias ativos e perfeitos, mapa de calor das últimas 12 semanas, desempenho de cada hábito nos últimos 30 dias e revisão dos últimos 7 dias com média e recado automático.
- **Conquistas** — 12 medalhas, de "Primeiro Passo" a "Centurião" (100 dias seguidos).
- **Ajustes** — nome, objetivo do programa, criar/desativar/remover hábitos (com sugestões prontas), exportar e importar backup, reiniciar tudo.

### Regras de pontuação

- Cada hábito vale os pontos definidos nele (padrão 10; ajustável de 1 a 100).
- Dia com todos os hábitos ativos cumpridos = **dia perfeito**, +20 de bônus.
- Os pontos acumulados sobem o nível, de *Semente* (0) a *Mestre* (6500). A tabela completa está no [plano](PLANO.md#5-pontos-níveis-e-medalhas).
- A sequência conta dias seguidos com pelo menos um hábito cumprido.

## Dados e privacidade

Tudo é salvo no `localStorage` **do navegador que você usa** — nada sai do aparelho, não há servidor nem conta. Consequências práticas:

- Trocar de navegador ou aparelho começa do zero.
- Limpar dados do site apaga o histórico.
- Use **Ajustes → Exportar backup** de vez em quando (o plano sugere uma vez por mês) e **Importar backup** para restaurar ou migrar.

## Estrutura

```
index.html                  estrutura da página
assets/css/estilo.css       estilos (tema escuro, com versão clara automática)
assets/js/dados.js          frases, hábitos sugeridos, níveis e medalhas
assets/js/armazenamento.js  leitura/escrita no localStorage, datas, backup
assets/js/estatisticas.js   pontos, sequências, níveis, desempenho
assets/js/app.js            renderização e eventos
PLANO.md                    o programa escrito: rituais, regras e protocolos
```

## Personalizar

- **Frases:** edite o array `FRASES` em `assets/js/dados.js`.
- **Hábitos iniciais e sugestões:** `HABITOS_PADRAO` e `HABITOS_SUGERIDOS` no mesmo arquivo.
- **Níveis e medalhas:** `NIVEIS` e `CONQUISTAS`, também em `dados.js`.
- **Bônus de dia perfeito:** `BONUS_DIA_PERFEITO` em `assets/js/estatisticas.js`.
