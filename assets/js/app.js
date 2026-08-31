/* Controlador da interface: renderização e eventos. */

let estado = carregar();
let hoje = hojeISO();
let temporizadorAviso = null;
let temporizadorSalvar = null;

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

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
  temporizadorAviso = setTimeout(() => { el.hidden = true; }, 2600);
}

function registroDeHoje() {
  if (!estado.registros[hoje]) {
    estado.registros[hoje] = { habitos: {}, vitoria: '', energia: 0 };
  }
  return estado.registros[hoje];
}

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function dataPorExtenso(iso) {
  return isoParaData(iso).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long'
  });
}

/* ---------- Renderização ---------- */

function renderTopo(stats) {
  const nome = estado.perfil.nome || 'Teo Neto';
  $('#nome-usuario').textContent = nome;
  $('#avatar').textContent = nome.trim().charAt(0).toUpperCase() || 'T';
  $('#saudacao').textContent = saudacao() + ',';
  $('#metrica-sequencia').textContent = stats.sequenciaAtual;
  $('#metrica-pontos').textContent = stats.pontos;
  $('#metrica-nivel').textContent = stats.nivel.atual.nivel;
  $('#metrica-nivel-nome').textContent = stats.nivel.atual.nome;

  $('#barra-nivel').style.width = stats.nivel.progresso + '%';
  $('#barra-nivel-texto').textContent = stats.nivel.proximo
    ? `Nível ${stats.nivel.atual.nivel} · ${stats.nivel.atual.nome} — faltam ${stats.nivel.faltam} pts para ${stats.nivel.proximo.nome}`
    : `Nível máximo alcançado: ${stats.nivel.atual.nome}`;
}

function renderHoje() {
  const frase = fraseDoDia(hoje);
  $('#frase-texto').textContent = '“' + frase.texto + '”';
  $('#frase-autor').textContent = '— ' + frase.autor;
  $('#data-hoje').textContent = dataPorExtenso(hoje);

  const ativos = habitosAtivos(estado);
  const marcados = registroDeHoje().habitos;
  const lista = $('#lista-habitos');

  lista.innerHTML = ativos.map(h => `
    <li class="item-habito ${marcados[h.id] ? 'feito' : ''}" data-habito="${h.id}">
      <span class="marcador">✓</span>
      <span class="habito-icone">${escapar(h.icone)}</span>
      <span class="habito-nome">${escapar(h.nome)}</span>
      <span class="habito-pontos">+${h.pontos}</span>
    </li>
  `).join('');
  $('#habitos-vazio').hidden = ativos.length > 0;

  const pct = progressoDoDia(estado, hoje);
  const anel = $('#anel-progresso');
  anel.style.setProperty('--p', pct);
  $('#anel-texto').textContent = pct + '%';

  const feitos = ativos.filter(h => marcados[h.id]).length;
  const pontos = pontosDoDia(estado, hoje);
  let resumo = `${feitos} de ${ativos.length} hábitos · ${pontos} pontos hoje`;
  if (ativos.length && feitos === ativos.length) resumo += ' · dia perfeito! 💯 (+' + BONUS_DIA_PERFEITO + ' de bônus)';
  else if (feitos === 0) resumo += ' · comece pelo mais fácil.';
  $('#resumo-dia').textContent = resumo;

  const campoVitoria = $('#campo-vitoria');
  if (document.activeElement !== campoVitoria) campoVitoria.value = registroDeHoje().vitoria;

  const energia = registroDeHoje().energia;
  $('#energia').innerHTML = ['😴', '🙁', '😐', '🙂', '🤩']
    .map((emoji, i) => `<button type="button" data-energia="${i + 1}" class="${energia === i + 1 ? 'ativa' : ''}" title="Energia ${i + 1} de 5">${emoji}</button>`)
    .join('');

  const objetivo = (estado.perfil.objetivo || '').trim();
  $('#cartao-objetivo').hidden = !objetivo;
  $('#objetivo-texto').textContent = objetivo;
}

function renderProgresso(stats) {
  const cartoes = [
    { valor: stats.sequenciaAtual, rotulo: 'sequência atual (dias)' },
    { valor: stats.melhorSequencia, rotulo: 'melhor sequência' },
    { valor: stats.diasAtivos, rotulo: 'dias ativos' },
    { valor: stats.diasPerfeitos, rotulo: 'dias perfeitos' },
    { valor: stats.pontos, rotulo: 'pontos acumulados' },
    { valor: stats.totalMarcacoes, rotulo: 'hábitos cumpridos' }
  ];
  $('#grade-stats').innerHTML = cartoes.map(c => `
    <div class="stat">
      <div class="stat-valor">${c.valor}</div>
      <div class="stat-rotulo">${c.rotulo}</div>
    </div>
  `).join('');

  renderMapaCalor();

  const desempenho = desempenhoPorHabito(estado, 30);
  $('#desempenho-habitos').innerHTML = desempenho.length ? desempenho.map(d => `
    <div class="linha-desempenho">
      <div class="cabecalho">
        <span>${escapar(d.habito.icone)} ${escapar(d.habito.nome)}</span>
        <span>${d.percentual}% <small>(${d.feitos}/${d.total})</small></span>
      </div>
      <div class="trilha"><div style="width:${d.percentual}%"></div></div>
    </div>
  `).join('') : '<p class="vazio">Adicione hábitos para ver o desempenho.</p>';

  const semana = [];
  for (let i = 6; i >= 0; i--) {
    const dia = somarDias(hoje, -i);
    semana.push({
      dia,
      rotulo: isoParaData(dia).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
      pct: progressoDoDia(estado, dia)
    });
  }
  const media = Math.round(semana.reduce((s, d) => s + d.pct, 0) / 7);
  $('#revisao-semana').innerHTML = `
    <p class="legenda">Média dos últimos 7 dias: <strong>${media}%</strong> — ${mensagemSemana(media)}</p>
    <div class="semana">
      ${semana.map(d => `
        <div class="dia-semana">
          <p class="rotulo-dia">${escapar(d.rotulo)}</p>
          <div class="trilha"><div style="width:${d.pct}%"></div></div>
          <span class="valor">${d.pct}%</span>
        </div>
      `).join('')}
    </div>
  `;
}

function mensagemSemana(media) {
  if (media >= 90) return 'semana impecável, mantenha o ritmo.';
  if (media >= 70) return 'semana forte; ajuste os detalhes.';
  if (media >= 40) return 'dá para melhorar: escolha um hábito para não falhar nenhum dia.';
  if (media > 0) return 'semana difícil. Recomece hoje, sem drama.';
  return 'nenhum registro ainda nesta semana. Comece agora.';
}

function renderMapaCalor() {
  const total = 84;
  let inicio = somarDias(hoje, -(total - 1));
  inicio = somarDias(inicio, -isoParaData(inicio).getDay());
  const fimSemana = somarDias(hoje, 6 - isoParaData(hoje).getDay());

  const celulas = [];
  let cursor = inicio;
  while (cursor <= fimSemana) {
    if (cursor > hoje) {
      celulas.push(`<i class="celula n0 fora" title="${cursor}"></i>`);
    } else {
      const pct = progressoDoDia(estado, cursor);
      const nivel = pct === 0 ? 0 : pct < 34 ? 1 : pct < 67 ? 2 : pct < 100 ? 3 : 4;
      celulas.push(`<i class="celula n${nivel}" title="${dataPorExtenso(cursor)} — ${pct}%"></i>`);
    }
    cursor = somarDias(cursor, 1);
  }
  $('#mapa-calor').innerHTML = celulas.join('');
}

function renderConquistas(stats) {
  const lista = conquistasDesbloqueadas(stats);
  const abertas = lista.filter(c => c.desbloqueada).length;
  $('#conquistas-contador').textContent = `${abertas} de ${lista.length} medalhas conquistadas.`;
  $('#grade-conquistas').innerHTML = lista.map(c => `
    <div class="conquista ${c.desbloqueada ? '' : 'bloqueada'}">
      <div class="icone">${c.desbloqueada ? c.icone : '🔒'}</div>
      <p class="nome">${escapar(c.nome)}</p>
      <p class="desc">${escapar(c.desc)}</p>
    </div>
  `).join('');
}

function renderAjustes() {
  if (document.activeElement !== $('#campo-nome')) $('#campo-nome').value = estado.perfil.nome || '';
  if (document.activeElement !== $('#campo-objetivo')) $('#campo-objetivo').value = estado.perfil.objetivo || '';

  $('#lista-editavel').innerHTML = estado.habitos.map(h => `
    <li class="item-editavel ${h.ativo ? '' : 'inativo'}" data-habito="${h.id}">
      <span>${escapar(h.icone)}</span>
      <span class="nome">${escapar(h.nome)}</span>
      <span class="habito-pontos">+${h.pontos}</span>
      <button class="icone-botao" data-acao="alternar" title="${h.ativo ? 'Desativar' : 'Reativar'}">${h.ativo ? '👁️' : '🚫'}</button>
      <button class="icone-botao" data-acao="remover" title="Remover">🗑️</button>
    </li>
  `).join('') || '<li class="vazio">Nenhum hábito cadastrado.</li>';

  $('#sugestoes').innerHTML = HABITOS_SUGERIDOS
    .filter(s => !estado.habitos.some(h => h.nome === s.nome))
    .map((s, i) => `<button type="button" class="chip" data-sugestao="${i}">${escapar(s.icone)} ${escapar(s.nome)}</button>`)
    .join('') || '<p class="legenda">Todas as sugestões já estão na sua lista.</p>';
}

/* ---------- Quadro "continuar de onde parei" ---------- */

let atividadeEditando = null;

function diasParado(atividade) {
  const d = Math.round((isoParaData(hoje) - isoParaData(atividade.atualizadoEm)) / 86400000);
  return d > 0 ? d : 0;
}

function textoParado(dias) {
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'ontem';
  return `parado há ${dias} dias`;
}

/* Um módulo conta como preenchido quando tem pelo menos um campo escrito. */
function moduloPreenchido(atividade, mod) {
  const dados = (atividade.modulos || {})[mod.id] || {};
  return mod.campos.some(campo => (dados[campo.id] || '').trim() !== '');
}

function modulosPreenchidos(atividade) {
  return MODULOS.filter(mod => moduloPreenchido(atividade, mod)).length;
}

/* O módulo seguinte só abre depois que o anterior recebe alguma coisa:
   preencher cinco blocos de uma vez espanta qualquer um. */
function moduloLiberado(atividade, indice) {
  return indice === 0 || moduloPreenchido(atividade, MODULOS[indice - 1]);
}

const modulosAbertos = new Set();

function campoModulo(atividade, mod, campo) {
  const valor = ((atividade.modulos || {})[mod.id] || {})[campo.id] || '';
  const comuns = `class="campo-modulo" data-modulo="${mod.id}" data-campo="${campo.id}" aria-label="${escapar(campo.rotulo)}"`;
  const entrada = campo.tipo === 'date'
    ? `<input type="date" ${comuns} value="${escapar(valor)}">`
    : campo.linhas
      ? `<textarea rows="${campo.linhas}" ${comuns} placeholder="${escapar(campo.dica || '')}">${escapar(valor)}</textarea>`
      : `<input type="text" maxlength="120" ${comuns} value="${escapar(valor)}" placeholder="${escapar(campo.dica || '')}">`;
  return `<label class="rotulo">${escapar(campo.rotulo)}</label>${entrada}`;
}

function blocoModulos(atividade) {
  const total = modulosPreenchidos(atividade);
  const corpo = MODULOS.map((mod, i) => {
    const liberado = moduloLiberado(atividade, i);
    const pronto = moduloPreenchido(atividade, mod);
    return `
      <div class="modulo ${liberado ? '' : 'travado'} ${pronto ? 'pronto' : ''}">
        <p class="modulo-cabecalho">
          <span class="modulo-num">${liberado ? mod.num : '🔒'}</span>
          <strong>${escapar(mod.nome)}</strong>
          ${pronto ? '<span class="modulo-marca">✓</span>' : ''}
        </p>
        <p class="modulo-resumo">${escapar(mod.resumo)}</p>
        ${liberado
          ? mod.campos.map(campo => campoModulo(atividade, mod, campo)).join('')
          : `<p class="modulo-aviso">Preencha <strong>${escapar(MODULOS[i - 1].nome)}</strong> para abrir este módulo.</p>`}
      </div>`;
  }).join('');

  return `
    <details class="modulos" data-modulos="${atividade.id}" ${modulosAbertos.has(atividade.id) ? 'open' : ''}>
      <summary>Módulos · ${total} de ${MODULOS.length} preenchidos</summary>
      ${corpo}
    </details>`;
}

function cartaoAtividade(a, concluida) {
  const dias = diasParado(a);
  const pct = a.meta > 0 ? Math.min(100, Math.round((a.atual / a.meta) * 100)) : 0;
  const unidade = a.unidade ? ' ' + escapar(a.unidade) : '';
  return `
    <li class="atividade" data-atividade="${a.id}">
      <div class="atividade-topo">
        <span class="atividade-icone">${escapar(a.icone)}</span>
        <span class="atividade-titulo">${escapar(a.titulo)}</span>
        <span class="atividade-modulos">${modulosPreenchidos(a)}/${MODULOS.length}</span>
        ${concluida ? '' : `<span class="atividade-parado ${dias >= 3 ? 'alerta' : ''}">${textoParado(dias)}</span>`}
      </div>
      <p class="atividade-nota ${a.nota ? '' : 'vazia'}">${a.nota ? escapar(a.nota) : 'Sem anotação de onde parou.'}</p>
      ${a.meta > 0 ? `
        <div class="atividade-progresso">
          <div class="trilha"><div style="width:${pct}%"></div></div>
          <span class="numeros">${a.atual}/${a.meta}${unidade} · ${pct}%</span>
        </div>` : ''}
      ${blocoModulos(a)}
      <div class="atividade-acoes">
        ${concluida
          ? '<button data-acao="reabrir">Reabrir</button>'
          : '<button data-acao="continuar">Continuar</button><button data-acao="concluir">Concluir</button>'}
        <button data-acao="remover">Remover</button>
      </div>
    </li>
  `;
}

function renderAtividades() {
  const todas = estado.atividades || [];
  const abertas = todas.filter(a => !a.concluida);
  const feitas = todas.filter(a => a.concluida);

  /* As paradas há mais tempo aparecem primeiro: são as que precisam de atenção. */
  abertas.sort((a, b) => diasParado(b) - diasParado(a));

  $('#lista-atividades').innerHTML = abertas.map(a => cartaoAtividade(a, false)).join('');
  $('#atividades-vazio').hidden = abertas.length > 0;

  $('#bloco-concluidas').hidden = feitas.length === 0;
  $('#resumo-concluidas').textContent = `Concluídas (${feitas.length})`;
  $('#lista-concluidas').innerHTML = feitas.map(a => cartaoAtividade(a, true)).join('');
}

function abrirFormAtividade(atividade) {
  atividadeEditando = atividade ? atividade.id : null;
  $('#atv-icone').value = atividade ? atividade.icone : '📌';
  $('#atv-titulo').value = atividade ? atividade.titulo : '';
  $('#atv-nota').value = atividade ? atividade.nota : '';
  $('#atv-atual').value = atividade && atividade.atual ? atividade.atual : '';
  $('#atv-meta').value = atividade && atividade.meta ? atividade.meta : '';
  $('#atv-unidade').value = atividade ? atividade.unidade : '';
  $('#form-atividade').hidden = false;
  $('#atv-titulo').focus();
}

function fecharFormAtividade() {
  atividadeEditando = null;
  $('#form-atividade').hidden = true;
  $('#form-atividade').reset();
}

function ligarEventosAtividades() {
  $('#botao-nova-atividade').addEventListener('click', () => {
    if (!$('#form-atividade').hidden && atividadeEditando === null) fecharFormAtividade();
    else abrirFormAtividade(null);
  });

  $('#botao-cancelar-atividade').addEventListener('click', fecharFormAtividade);

  $('#form-atividade').addEventListener('submit', evento => {
    evento.preventDefault();
    const titulo = $('#atv-titulo').value.trim();
    if (!titulo) return;
    const dados = {
      titulo,
      icone: $('#atv-icone').value.trim() || '📌',
      nota: $('#atv-nota').value.trim(),
      atual: Math.max(0, Number($('#atv-atual').value) || 0),
      meta: Math.max(0, Number($('#atv-meta').value) || 0),
      unidade: $('#atv-unidade').value.trim(),
      atualizadoEm: hoje
    };
    const emEdicao = atividadeEditando;
    atualizar(() => {
      const existente = (estado.atividades || []).find(a => a.id === emEdicao);
      if (existente) Object.assign(existente, dados);
      else estado.atividades.push({ id: idNovo(), concluida: false, modulos: modulosVazios(), ...dados });
    });
    avisar(emEdicao ? 'Atividade atualizada.' : 'Atividade adicionada.');
    fecharFormAtividade();
  });

  /* Salva enquanto digita, para nada se perder se o app for fechado no meio.
     A tela só é redesenhada ao sair do campo, para não atrapalhar a digitação. */
  function gravarCampoModulo(campo) {
    const item = campo.closest('[data-atividade]');
    if (!item) return null;
    const atividade = (estado.atividades || []).find(a => a.id === item.dataset.atividade);
    if (!atividade) return null;
    atividade.modulos[campo.dataset.modulo][campo.dataset.campo] = campo.value;
    atividade.atualizadoEm = hoje;
    persistir();

    /* Atualiza só os contadores: redesenhar a lista inteira tiraria o foco do campo. */
    const feitos = modulosPreenchidos(atividade);
    const resumo = item.querySelector('.modulos > summary');
    const marcador = item.querySelector('.atividade-modulos');
    if (resumo) resumo.textContent = `Módulos · ${feitos} de ${MODULOS.length} preenchidos`;
    if (marcador) marcador.textContent = `${feitos}/${MODULOS.length}`;
    return atividade;
  }

  document.addEventListener('input', evento => {
    const campo = evento.target.closest('.campo-modulo');
    if (campo) gravarCampoModulo(campo);
  });

  document.addEventListener('change', evento => {
    const campo = evento.target.closest('.campo-modulo');
    if (campo && gravarCampoModulo(campo)) renderAtividades();
  });

  document.addEventListener('toggle', evento => {
    const bloco = evento.target.closest('[data-modulos]');
    if (!bloco) return;
    if (bloco.open) modulosAbertos.add(bloco.dataset.modulos);
    else modulosAbertos.delete(bloco.dataset.modulos);
  }, true);

  document.addEventListener('click', evento => {
    const botao = evento.target.closest('.atividade-acoes [data-acao]');
    if (!botao) return;
    const id = botao.closest('[data-atividade]').dataset.atividade;
    const atividade = (estado.atividades || []).find(a => a.id === id);
    if (!atividade) return;
    const acao = botao.dataset.acao;

    if (acao === 'continuar') {
      abrirFormAtividade(atividade);
      $('#form-atividade').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (acao === 'concluir') {
      atualizar(() => {
        atividade.concluida = true;
        atividade.atualizadoEm = hoje;
        if (atividade.meta > 0) atividade.atual = atividade.meta;
      });
      avisar('🏁 Atividade concluída!');
    } else if (acao === 'reabrir') {
      atualizar(() => {
        atividade.concluida = false;
        atividade.atualizadoEm = hoje;
      });
    } else if (acao === 'remover' && confirm(`Remover "${atividade.titulo}" do quadro?`)) {
      atualizar(() => {
        estado.atividades = estado.atividades.filter(a => a.id !== id);
      });
      avisar('Atividade removida.');
    }
  });
}

function render() {
  const stats = estatisticas(estado);
  renderTopo(stats);
  renderHoje();
  renderAtividades();
  renderProgresso(stats);
  renderConquistas(stats);
  renderAjustes();
  return stats;
}

/* Aplica uma mudança e avisa sobre nível novo ou medalha nova. */
function atualizar(mudanca) {
  const antes = estatisticas(estado);
  const medalhasAntes = conquistasDesbloqueadas(antes).filter(c => c.desbloqueada).map(c => c.id);
  mudanca();
  persistir();
  const depois = render();

  if (depois.nivel.atual.nivel > antes.nivel.atual.nivel) {
    avisar(`🎉 Novo nível: ${depois.nivel.atual.nome}!`);
    return;
  }
  const nova = conquistasDesbloqueadas(depois)
    .filter(c => c.desbloqueada && !medalhasAntes.includes(c.id))[0];
  if (nova) avisar(`${nova.icone} Medalha desbloqueada: ${nova.nome}`);
}

/* ---------- Eventos ---------- */

function trocarAba(nome) {
  $$('.aba').forEach(b => b.classList.toggle('ativa', b.dataset.aba === nome));
  $$('.painel').forEach(p => p.classList.toggle('ativo', p.id === 'painel-' + nome));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function ligarEventos() {
  $$('.aba').forEach(botao => {
    botao.addEventListener('click', () => trocarAba(botao.dataset.aba));
  });

  $('#lista-habitos').addEventListener('click', evento => {
    const item = evento.target.closest('[data-habito]');
    if (!item) return;
    atualizar(() => {
      const marcados = registroDeHoje().habitos;
      const id = item.dataset.habito;
      if (marcados[id]) delete marcados[id];
      else marcados[id] = true;
    });
  });

  $('#energia').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-energia]');
    if (!botao) return;
    const valor = Number(botao.dataset.energia);
    atualizar(() => {
      const r = registroDeHoje();
      r.energia = r.energia === valor ? 0 : valor;
    });
  });

  $('#campo-vitoria').addEventListener('input', evento => {
    registroDeHoje().vitoria = evento.target.value;
    persistir();
  });
  $('#campo-vitoria').addEventListener('blur', () => atualizar(() => {}));

  $('#campo-nome').addEventListener('input', evento => {
    estado.perfil.nome = evento.target.value;
    persistir();
    renderTopo(estatisticas(estado));
  });

  $('#campo-objetivo').addEventListener('input', evento => {
    estado.perfil.objetivo = evento.target.value;
    persistir();
    const objetivo = evento.target.value.trim();
    $('#cartao-objetivo').hidden = !objetivo;
    $('#objetivo-texto').textContent = objetivo;
  });

  $('#form-habito').addEventListener('submit', evento => {
    evento.preventDefault();
    const nome = $('#novo-nome').value.trim();
    if (!nome) return;
    atualizar(() => {
      estado.habitos.push({
        id: idNovo(),
        nome,
        icone: $('#novo-icone').value.trim() || '✅',
        pontos: Math.min(100, Math.max(1, Number($('#novo-pontos').value) || 10)),
        ativo: true
      });
    });
    $('#novo-nome').value = '';
    $('#novo-icone').value = '✅';
    $('#novo-pontos').value = 10;
    avisar('Hábito adicionado.');
  });

  $('#lista-editavel').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-acao]');
    if (!botao) return;
    const id = botao.closest('[data-habito]').dataset.habito;
    const habito = estado.habitos.find(h => h.id === id);
    if (!habito) return;

    if (botao.dataset.acao === 'alternar') {
      atualizar(() => { habito.ativo = !habito.ativo; });
    } else if (confirm(`Remover "${habito.nome}"? O histórico dele também sai das contas.`)) {
      atualizar(() => {
        estado.habitos = estado.habitos.filter(h => h.id !== id);
        Object.values(estado.registros).forEach(r => { delete r.habitos[id]; });
      });
      avisar('Hábito removido.');
    }
  });

  $('#sugestoes').addEventListener('click', evento => {
    const chip = evento.target.closest('[data-sugestao]');
    if (!chip) return;
    const sugestao = HABITOS_SUGERIDOS.filter(s => !estado.habitos.some(h => h.nome === s.nome))[Number(chip.dataset.sugestao)];
    if (!sugestao) return;
    atualizar(() => {
      estado.habitos.push({ id: idNovo(), ativo: true, ...sugestao });
    });
    avisar('Hábito adicionado.');
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
        avisar('Backup importado.');
      } catch (e) {
        avisar('Arquivo inválido.');
      }
    };
    leitor.readAsText(arquivo);
    evento.target.value = '';
  });

  $('#botao-apagar').addEventListener('click', () => {
    if (!confirm('Apagar todo o histórico e recomeçar do zero?')) return;
    apagarTudo();
    atualizar(() => { estado = estadoInicial(); });
    avisar('Programa reiniciado.');
  });

  ligarEventosAtividades();

  /* Se a aba ficar aberta durante a virada do dia, recarrega o dia atual. */
  setInterval(() => {
    const agora = hojeISO();
    if (agora !== hoje) {
      hoje = agora;
      render();
    }
  }, 60000);
}

ligarEventos();
render();

/* Registra o service worker para o programa funcionar sem internet.
   Só roda em site publicado (https) ou em teste local. */
if ('serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .catch(erro => console.warn('Service worker não registrado:', erro));
  });
}
