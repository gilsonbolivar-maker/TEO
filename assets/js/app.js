/* Controlador da interface: renderização e eventos. */

let estado = carregar();
let hoje = hojeISO();
let abaAtual = 'inicio';
let temporizadorAviso = null;
let temporizadorSalvar = null;

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const ABAS_FINAIS = [
  { id: 'progresso', rotulo: 'Progresso' },
  { id: 'ajustes', rotulo: 'Ajustes' }
];

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function persistir() {
  clearTimeout(temporizadorSalvar);
  temporizadorSalvar = setTimeout(() => salvar(estado), 200);
}

function avisar(mensagem) {
  const el = $('#aviso');
  el.textContent = mensagem;
  el.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { el.hidden = true; }, 2400);
}

function textoParado(atividade) {
  if (pontosConcluidos(atividade) === 0) return 'ainda não começou';
  const dias = diasParado(atividade, hoje);
  if (dias === 0) return 'avançou hoje';
  if (dias === 1) return 'avançou ontem';
  return `sem avançar há ${dias} dias`;
}

/* ---------- Abas ---------- */

function renderAbas() {
  const atividades = (estado.atividades || []).map(a => ({
    id: 'atv:' + a.id,
    rotulo: `${a.icone} ${a.titulo}`,
    concluida: a.concluida
  }));
  const todas = [{ id: 'inicio', rotulo: 'Início' }, ...atividades, ...ABAS_FINAIS];

  $('#abas').innerHTML = todas.map(aba => `
    <button class="aba ${aba.id === abaAtual ? 'ativa' : ''} ${aba.id.startsWith('atv:') ? 'aba-atividade' : ''}"
            data-aba="${escapar(aba.id)}" role="tab">${escapar(aba.rotulo)}${aba.concluida ? ' ✓' : ''}</button>
  `).join('');
}

function atividadeDaAba() {
  if (!abaAtual.startsWith('atv:')) return null;
  return (estado.atividades || []).find(a => a.id === abaAtual.slice(4)) || null;
}

function trocarAba(nome) {
  if (nome.startsWith('atv:') && !(estado.atividades || []).some(a => 'atv:' + a.id === nome)) nome = 'inicio';
  abaAtual = nome;
  const alvo = nome.startsWith('atv:') ? 'painel-atividade' : 'painel-' + nome;
  $$('.painel').forEach(p => p.classList.toggle('ativo', p.id === alvo));
  renderAbas();
  if (nome.startsWith('atv:')) renderPainelAtividade();
  const aberta = $('#abas .aba.ativa');
  if (aberta) aberta.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Topo e início ---------- */

function renderTopo() {
  const nome = estado.perfil.nome || 'Teo Neto';
  $('#nome-usuario').textContent = nome;
  $('#avatar').textContent = nome.trim().charAt(0).toUpperCase() || 'T';
  const objetivo = (estado.perfil.objetivo || '').trim();
  $('#topo-objetivo').textContent = objetivo;
  $('#topo-objetivo').hidden = !objetivo;
}

function renderResumo() {
  const r = resumoGeral(estado);
  $('#resumo').innerHTML = `
    <div class="resumo-item"><span class="resumo-valor">${r.andamento}</span><span class="resumo-rotulo">em andamento</span></div>
    <div class="resumo-item"><span class="resumo-valor">${r.concluidas}</span><span class="resumo-rotulo">concluídas</span></div>
    <div class="resumo-item"><span class="resumo-valor">${r.pontosFeitos}<small>/${r.pontosTotais}</small></span><span class="resumo-rotulo">pontos concluídos</span></div>
    <div class="resumo-item"><span class="resumo-valor">${r.mediaPercentual}%</span><span class="resumo-rotulo">média geral</span></div>`;
}

function linhaAtividade(a) {
  const pct = percentualAtividade(a);
  return `
    <li class="atividade ${a.concluida ? 'fechada' : ''}" data-atividade="${a.id}">
      <button class="atividade-cabecalho" data-acao="abrir">
        <span class="atividade-icone">${escapar(a.icone)}</span>
        <span class="atividade-info">
          <span class="atividade-titulo">${escapar(a.titulo)}</span>
          <span class="regua"><span style="width:${pct}%"></span></span>
          <span class="atividade-linha-info">${pontosConcluidos(a)} de ${PONTOS_POR_ATIVIDADE} pontos · ${a.concluida ? 'concluída' : textoParado(a)}</span>
        </span>
        <span class="atividade-pct">${pct}%</span>
      </button>
    </li>`;
}

function renderAtividades() {
  const todas = ordenarAtividades(estado.atividades || [], hoje);
  $('#lista-atividades').innerHTML = todas.map(linhaAtividade).join('');
  $('#atividades-vazio').hidden = todas.length > 0;
}

/* ---------- Aba de uma atividade ---------- */

function circuloDePontos(atividade) {
  const raio = 42;
  const volta = 2 * Math.PI * raio;
  const fatia = volta / PONTOS_POR_ATIVIDADE;
  const vao = 5;
  const arcos = atividade.pontos.map((ponto, i) => `
    <circle cx="50" cy="50" r="${raio}" fill="none"
      class="fatia ${ponto.concluido ? 'acesa' : ''}"
      stroke-width="9" stroke-linecap="round"
      stroke-dasharray="${(fatia - vao).toFixed(2)} ${(volta - fatia + vao).toFixed(2)}"
      stroke-dashoffset="${(-i * fatia).toFixed(2)}"
      transform="rotate(-90 50 50)"></circle>`).join('');

  return `
    <svg class="circulo" viewBox="0 0 100 100" role="img"
         aria-label="${percentualAtividade(atividade)} por cento concluído">
      ${arcos}
      <text x="50" y="47" class="circulo-pct">${percentualAtividade(atividade)}%</text>
      <text x="50" y="62" class="circulo-frac">${pontosConcluidos(atividade)} de ${PONTOS_POR_ATIVIDADE}</text>
    </svg>`;
}

function listaDePontos(atividade) {
  return atividade.pontos.map((ponto, i) => `
    <li class="ponto ${ponto.concluido ? 'feito' : ''}">
      <div class="ponto-linha">
        <button class="ponto-marca" data-acao="alternar-ponto" data-indice="${i}"
                ${ponto.titulo.trim() ? '' : 'disabled'}
                title="${ponto.concluido ? 'Desmarcar' : 'Marcar como concluído'}">
          ${ponto.concluido ? '✓' : i + 1}
        </button>
        <input class="ponto-titulo" data-indice="${i}" type="text" maxlength="80"
               value="${escapar(ponto.titulo)}"
               placeholder="Ponto ${i + 1}: o que precisa acontecer"
               aria-label="Nome do ponto ${i + 1}">
        <span class="ponto-peso">${ponto.concluido ? escapar(formatarDataCurta(ponto.em)) : PESO_DO_PONTO + '%'}</span>
      </div>
      ${ponto.concluido ? `
        <button class="ponto-recompensa" data-acao="escolher-recompensa" data-indice="${i}">
          ${ponto.recompensa ? '🎁 ' + escapar(ponto.recompensa) : '🎁 Escolher recompensa'}
        </button>` : ''}
    </li>`).join('');
}

function renderPainelAtividade() {
  const a = atividadeDaAba();
  if (!a) { trocarAba('inicio'); return; }

  $('#painel-atividade').innerHTML = `
    <article class="cartao cartao-atividade">
      <div class="atividade-titulo-grande">
        <span class="atividade-icone" id="icone-atual">${escapar(a.icone)}</span>
        <input class="atividade-titulo-campo" type="text" maxlength="60"
               value="${escapar(a.titulo)}" aria-label="Nome da atividade">
      </div>
      <p class="detalhe-parado">${a.concluida ? 'Objetivo concluído 🏁' : textoParado(a)}</p>

      ${circuloDePontos(a)}

      <label class="rotulo">Onde parei</label>
      <input class="atividade-nota-campo" type="text" maxlength="90"
             value="${escapar(a.nota)}" placeholder="Ex.: capítulo 7, página 120" aria-label="Onde parei">

      <p class="legenda titulo-pontos">Os 5 pontos até concluir — cada um fecha ${PESO_DO_PONTO}% do círculo.</p>
      <ul class="lista-pontos">${listaDePontos(a)}</ul>

      <div class="atividade-acoes">
        ${a.concluida ? '<button data-acao="reabrir">Reabrir</button>' : ''}
        <button data-acao="remover">Remover atividade</button>
      </div>
    </article>`;
  $('#painel-atividade').dataset.atividade = a.id;
}

/* ---------- Progresso ---------- */

function renderProgresso() {
  const todas = ordenarAtividades(estado.atividades || [], hoje);
  $('#andamento').innerHTML = todas.length ? todas.map(a => {
    const pct = percentualAtividade(a);
    const parado = diasParado(a, hoje);
    return `
      <div class="linha-andamento">
        <div class="cabecalho">
          <span>${escapar(a.icone)} ${escapar(a.titulo)}</span>
          <span class="${!a.concluida && parado >= 3 ? 'alerta' : ''}">${pct}%</span>
        </div>
        <div class="regua"><span style="width:${pct}%"></span></div>
        <p class="legenda">${pontosConcluidos(a)} de ${PONTOS_POR_ATIVIDADE} pontos · ${a.concluida ? 'concluída' : textoParado(a)}</p>
      </div>`;
  }).join('') : '<p class="vazio">Crie uma atividade para acompanhar o andamento.</p>';

  const avancos = historicoDeAvancos(estado);
  $('#historico').innerHTML = avancos.slice(0, 20).map(av => `
    <li class="avanco">
      <span class="avanco-data">${escapar(formatarDataCurta(av.em))}</span>
      <span class="avanco-texto">
        <strong>${escapar(av.ponto.titulo)}</strong>
        <small>${escapar(av.atividade.icone)} ${escapar(av.atividade.titulo)} · ponto ${av.indice + 1}${av.ponto.recompensa ? ' · 🎁 ' + escapar(av.ponto.recompensa) : ''}</small>
      </span>
    </li>`).join('');
  $('#historico-vazio').hidden = avancos.length > 0;
}

/* ---------- Recompensas ---------- */

let escolhaEmAberto = null;

function renderRecompensas() {
  const lista = estado.recompensas || [];
  $('#lista-recompensas').innerHTML = lista.map((r, i) => `
    <li class="recompensa">
      <span>🎁 ${escapar(r)}</span>
      <button class="icone-botao" data-remover-recompensa="${i}" title="Remover">✕</button>
    </li>`).join('');
  $('#recompensas-vazio').hidden = lista.length > 0;
}

function abrirEscolhaRecompensa(atividade, indice) {
  escolhaEmAberto = { atividade, indice };
  const lista = estado.recompensas || [];
  const ponto = atividade.pontos[indice];

  $('#modal-texto').textContent = lista.length
    ? `“${ponto.titulo}” está fechado. Escolha sua recompensa:`
    : 'Você ainda não cadastrou nenhuma recompensa. Cadastre em Ajustes para poder escolher.';

  $('#modal-lista').innerHTML = lista.map((r, i) => `
    <li><button class="recompensa-opcao ${ponto.recompensa === r ? 'escolhida' : ''}" data-recompensa="${i}">🎁 ${escapar(r)}</button></li>
  `).join('');

  $('#modal-recompensa').hidden = false;
}

function fecharEscolhaRecompensa() {
  escolhaEmAberto = null;
  $('#modal-recompensa').hidden = true;
}

/* ---------- Render geral ---------- */

function render() {
  renderTopo();
  renderAbas();
  renderResumo();
  renderAtividades();
  renderProgresso();
  renderRecompensas();
  if (abaAtual.startsWith('atv:')) renderPainelAtividade();

  const frase = fraseDoDia(hoje);
  $('#frase-rodape').textContent = `“${frase.texto}” — ${frase.autor}`;
}

function fraseDoDia(dia) {
  const base = isoParaData(dia).getTime() / 86400000;
  return FRASES[Math.floor(base) % FRASES.length];
}

function atualizar(mudanca) {
  mudanca();
  persistir();
  render();
}

/* ---------- Eventos ---------- */

function ligarEventos() {
  $('#abas').addEventListener('click', evento => {
    const botao = evento.target.closest('.aba');
    if (botao) trocarAba(botao.dataset.aba);
  });

  $('#botao-nova-atividade').addEventListener('click', () => {
    const form = $('#form-atividade');
    form.hidden = !form.hidden;
    if (!form.hidden) $('#atv-titulo').focus();
  });

  $('#botao-cancelar-atividade').addEventListener('click', () => {
    $('#form-atividade').hidden = true;
    $('#form-atividade').reset();
  });

  $('#form-atividade').addEventListener('submit', evento => {
    evento.preventDefault();
    const titulo = $('#atv-titulo').value.trim();
    if (!titulo) return;
    const nova = {
      id: idNovo(),
      titulo,
      icone: iconeSugerido(titulo),
      nota: '',
      concluida: false,
      criadaEm: hoje,
      atualizadoEm: hoje,
      pontos: pontosVazios()
    };
    atualizar(() => { estado.atividades.push(nova); });
    $('#form-atividade').hidden = true;
    $('#form-atividade').reset();
    trocarAba('atv:' + nova.id);
    avisar('Atividade criada. Defina os 5 pontos.');
  });

  /* Digitação grava a cada tecla, para nada se perder se o app for fechado. */
  document.addEventListener('input', evento => {
    const item = evento.target.closest('[data-atividade]');
    if (!item) return;
    const atividade = (estado.atividades || []).find(a => a.id === item.dataset.atividade);
    if (!atividade) return;

    if (evento.target.classList.contains('ponto-titulo')) {
      atividade.pontos[Number(evento.target.dataset.indice)].titulo = evento.target.value;
      persistir();
      const marca = evento.target.closest('.ponto').querySelector('.ponto-marca');
      if (marca) marca.disabled = evento.target.value.trim() === '';
    } else if (evento.target.classList.contains('atividade-titulo-campo')) {
      const nome = evento.target.value.trim();
      if (nome) {
        atividade.titulo = nome;
        atividade.icone = iconeSugerido(nome);
        persistir();
        /* Atualiza aba, lista e ícone sem redesenhar o campo em que se digita. */
        $('#icone-atual').textContent = atividade.icone;
        renderAbas();
        renderAtividades();
      }
    } else if (evento.target.classList.contains('atividade-nota-campo')) {
      atividade.nota = evento.target.value;
      atividade.atualizadoEm = hoje;
      persistir();
    }
  });

  document.addEventListener('click', evento => {
    const gatilho = evento.target.closest('[data-acao]');
    if (!gatilho) return;
    const item = gatilho.closest('[data-atividade]');
    if (!item) return;
    const id = item.dataset.atividade;
    const atividade = (estado.atividades || []).find(a => a.id === id);
    if (!atividade) return;
    const acao = gatilho.dataset.acao;

    if (acao === 'abrir') {
      trocarAba('atv:' + id);

    } else if (acao === 'alternar-ponto') {
      const ponto = atividade.pontos[Number(gatilho.dataset.indice)];
      atualizar(() => {
        ponto.concluido = !ponto.concluido;
        ponto.em = ponto.concluido ? hoje : '';
        if (!ponto.concluido) ponto.recompensa = '';
        atividade.atualizadoEm = hoje;
        /* O círculo fechou: a atividade se conclui sozinha. */
        atividade.concluida = pontosConcluidos(atividade) === PONTOS_POR_ATIVIDADE;
      });
      renderPainelAtividade();
      if (ponto.concluido) abrirEscolhaRecompensa(atividade, Number(gatilho.dataset.indice));

    } else if (acao === 'escolher-recompensa') {
      abrirEscolhaRecompensa(atividade, Number(gatilho.dataset.indice));

    } else if (acao === 'reabrir') {
      atualizar(() => { atividade.concluida = false; atividade.atualizadoEm = hoje; });
      renderPainelAtividade();

    } else if (acao === 'remover' && confirm(`Remover "${atividade.titulo}"?`)) {
      atualizar(() => { estado.atividades = estado.atividades.filter(a => a.id !== id); });
      trocarAba('inicio');
      avisar('Atividade removida.');
    }
  });

  $('#form-recompensa').addEventListener('submit', evento => {
    evento.preventDefault();
    const texto = $('#nova-recompensa').value.trim();
    if (!texto) return;
    atualizar(() => { estado.recompensas.push(texto); });
    $('#nova-recompensa').value = '';
  });

  $('#lista-recompensas').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-remover-recompensa]');
    if (!botao) return;
    const i = Number(botao.dataset.removerRecompensa);
    atualizar(() => { estado.recompensas.splice(i, 1); });
  });

  $('#modal-lista').addEventListener('click', evento => {
    const opcao = evento.target.closest('[data-recompensa]');
    if (!opcao || !escolhaEmAberto) return;
    const { atividade, indice } = escolhaEmAberto;
    const premio = estado.recompensas[Number(opcao.dataset.recompensa)];
    atualizar(() => { atividade.pontos[indice].recompensa = premio; });
    fecharEscolhaRecompensa();
    renderPainelAtividade();
    avisar(`🎁 Recompensa escolhida: ${premio}`);
  });

  $('#modal-fechar').addEventListener('click', fecharEscolhaRecompensa);
  $('#modal-recompensa').addEventListener('click', evento => {
    if (evento.target.id === 'modal-recompensa') fecharEscolhaRecompensa();
  });

  $('#campo-nome').addEventListener('input', evento => {
    estado.perfil.nome = evento.target.value;
    persistir();
    renderTopo();
  });

  $('#campo-objetivo').addEventListener('input', evento => {
    estado.perfil.objetivo = evento.target.value;
    persistir();
    renderTopo();
  });

  $('#botao-exportar').addEventListener('click', () => {
    const blob = new Blob([exportarJSON(estado)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `programa-teo-${hoje}.json`;
    link.click();
    URL.revokeObjectURL(url);
    avisar('Backup exportado.');
  });

  $('#botao-importar').addEventListener('click', () => $('#arquivo-importar').click());

  $('#arquivo-importar').addEventListener('change', evento => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const importado = importarJSON(leitor.result);
        atualizar(() => { estado = importado; });
        trocarAba('inicio');
        avisar('Backup importado.');
      } catch (e) {
        avisar('Arquivo inválido.');
      }
    };
    leitor.readAsText(arquivo);
    evento.target.value = '';
  });

  $('#botao-apagar').addEventListener('click', () => {
    if (!confirm('Apagar todas as atividades e recomeçar do zero?')) return;
    apagarTudo();
    atualizar(() => { estado = estadoInicial(); });
    trocarAba('inicio');
    avisar('Programa reiniciado.');
  });

  /* Se o app ficar aberto durante a virada do dia, recarrega o dia atual. */
  setInterval(() => {
    const agora = hojeISO();
    if (agora !== hoje) { hoje = agora; render(); }
  }, 60000);
}

function iniciar() {
  $('#campo-nome').value = estado.perfil.nome || '';
  $('#campo-objetivo').value = estado.perfil.objetivo || '';
  ligarEventos();
  render();
}

iniciar();

/* Registra o service worker para o programa funcionar sem internet. */
if ('serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .catch(erro => console.warn('Service worker não registrado:', erro));
  });
}
