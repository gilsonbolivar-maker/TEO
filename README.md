# Programa Motivacional · Teo Neto

Acompanhamento de desenvolvimento em atividades específicas — um **plano escrito** ([PLANO.md](PLANO.md)) e um **app web** que o executa: cada atividade tem 5 pontos, cada ponto fecha 20% de um círculo.

## Como usar

Abra o `index.html` no navegador — é só isso. Não há build, dependências ou servidor obrigatório.

```bash
# opcional: servir localmente
python3 -m http.server 8000
# depois: http://localhost:8000
```

No celular, adicione a página à tela inicial para abrir como um app.

## O que o app faz

O programa acompanha o desenvolvimento em **atividades específicas**. Cada atividade se divide em **5 pontos definidos por quem faz**, valendo **20%** cada. Concluir um ponto acende uma fatia do círculo; quando as cinco acendem, o círculo fecha e a atividade é concluída sozinha.

- **Início** — o resumo em números (em andamento, concluídas, pontos concluídos, média geral) e a lista de atividades, cada uma com a **régua de progresso**, os pontos vencidos, há quanto tempo não avança e **qual é o próximo passo**.
- **Uma aba por atividade** — círculo grande, anotação de onde parou e os cinco pontos. A barra de abas rola quando há muitas.
- **Progresso** — o andamento de todas as atividades lado a lado e o histórico de avanços com a data de cada ponto concluído.
- **Recompensas** — cada ponto concluído dá direito a escolher uma recompensa da lista que o próprio usuário cadastra em Ajustes. Em Ajustes há dez opções prontas para escolher com um toque e, ao fim da lista, **Outra**, que abre o campo livre. Ao digitar uma recompensa própria, o app comenta na hora se ela gera gasto, se pesa na saúde, se está vaga ou se contradiz o próprio objetivo — é uma checagem por palavras conhecidas (`CHECAGENS` em `dados.js`), um lembrete, não um bloqueio: quem decide é o usuário. A escolha fica registrada no ponto e no histórico; desmarcar o ponto devolve a recompensa.
- **🎓 Aulas** — um **mostrador circular** no estilo Sectograph: um mostrador de **24 horas** onde cada aula do dia vira um setor colorido no anel, com o ponteiro na hora atual e a legenda das turmas logo abaixo. As aulas já encerradas ficam esmaecidas e a que está em curso, cheia. As setas ‹ › no topo mudam o dia exibido. Sob o mostrador, a data e **em que turma é a aula agora** (com o horário, a sala e quanto falta para terminar) ou qual é a próxima e em quanto tempo. Abaixo, a grade **navegável por semana** (‹ ›), com o dia atual destacado. Uma aula pode ocorrer em **vários dias da semana, cada um com o seu horário** — marque os dias e defina a hora de cada um na mesma tela, útil quando a mesma turma tem aula terça de manhã e sexta à tarde — e vale **toda semana** ou **só na semana exibida**, útil para reposições e aulas avulsas. Tocar numa aula da grade abre o formulário preenchido para editá-la; o ✕ remove.
- **🏍️ Moto** — controle da moto do dia a dia: odômetro, consumo do último tanque e média geral em km/l, custo por quilômetro, e o acompanhamento de **troca de óleo** e **revisão** por quilometragem (intervalo ajustável, botão "Fiz agora", aviso quando falta pouco ou já venceu). Os abastecimentos guardam km, litros, **preço do litro no dia** e valor pago — preencher um dos dois últimos calcula o outro; o consumo sai da distância desde o abastecimento anterior dividida pelos litros deste — por isso o cálculo pede tanque cheio.
- **Ajustes** — nome, objetivo geral, lista de recompensas, receita do lembrete diário e backup dos dados.

O app é deliberadamente enxuto: sem hábitos diários, medalhas, pontuação de jogo ou diário. A tela mostra o que informa o progresso e nada mais.

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

> O `sw.js` busca código e estilo na rede primeiro, usando o cache apenas como reserva sem internet — assim uma versão nova nunca roda com arquivos antigos. Quando um service worker novo assume, a página recarrega uma vez sozinha. Ao alterar arquivos do app, suba mesmo assim a versão em `sw.js` (`const VERSAO`).

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
assets/js/dados.js          frases e o número de pontos por atividade
assets/js/armazenamento.js  leitura/escrita no localStorage, datas, backup
assets/js/estatisticas.js   percentuais, tempo parado e histórico de avanços
assets/js/app.js            renderização e eventos
PLANO.md                    o programa escrito: rituais, regras e protocolos
render.yaml                 configuração de publicação no Render (site estático)
.nojekyll                   desliga o processamento Jekyll no GitHub Pages
```

## Personalizar

- **Frases do rodapé:** array `FRASES` em `assets/js/dados.js`.
- **Quantidade de pontos por atividade:** `PONTOS_POR_ATIVIDADE` no mesmo arquivo — o peso de cada ponto e o círculo se ajustam sozinhos.
