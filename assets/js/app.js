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

/* ---------- Quadro de atividades: 5 pontos, cada um vale 20% ---------- */

const atividadesAbertas = new Set();

function pontosConcluidos(atividade) {
  return atividade.pontos.filter(p => p.concluido).length;
}

function percentualAtividade(atividade) {
  return Math.round(pontosConcluidos(atividade) * PESO_DO_PONTO);
}

function diasParado(atividade) {
  const d = Math.round((isoParaData(hoje) - isoParaData(atividade.atualizadoEm)) / 86400000);
  return d > 0 ? d : 0;
}

function textoParado(dias) {
  if (dias === 0) return 'avançou hoje';
  if (dias === 1) return 'avançou ontem';
  return `parado há ${dias} dias`;
}

/* Círculo dividido em 5 fatias iguais; cada ponto concluído acende a sua. */
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
      <button class="ponto-marca" data-acao="alternar-ponto" data-indice="${i}"
              ${ponto.titulo.trim() ? '' : 'disabled'}
              title="${ponto.concluido ? 'Desmarcar' : 'Marcar como concluído'}">
        ${ponto.concluido ? '✓' : i + 1}
      </button>
      <input class="ponto-titulo" data-indice="${i}" type="text" maxlength="80"
             value="${escapar(ponto.titulo)}"
             placeholder="Ponto ${i + 1}: o que precisa acontecer"
             aria-label="Nome do ponto ${i + 1}">
      <span class="ponto-peso">${ponto.concluido ? escapar(ponto.em) : PESO_DO_PONTO + '%'}</span>
    </li>`).join('');
}

function cartaoAtividade(a, concluida) {
  const pct = percentualAtividade(a);
  const aberta = atividadesAbertas.has(a.id);
  const dias = diasParado(a);
  return `
    <li class="atividade ${concluida ? 'fechada' : ''}" data-atividade="${a.id}">
      <button class="atividade-cabecalho" data-acao="abrir" aria-expanded="${aberta}">
        <span class="atividade-icone">${escapar(a.icone)}</span>
        <span class="atividade-info">
          <span class="atividade-titulo">${escapar(a.titulo)}</span>
          <span class="regua"><span style="width:${pct}%"></span></span>
        </span>
        <span class="atividade-pct">${pct}%</span>
      </button>

      <div class="atividade-detalhe" ${aberta ? '' : 'hidden'}>
        <div class="detalhe-topo">
          ${circuloDePontos(a)}
          <div class="detalhe-lado">
            <p class="detalhe-parado">${concluida ? 'Objetivo concluído 🏁' : textoParado(dias)}</p>
            <label class="rotulo">Onde parei</label>
            <input class="atividade-nota-campo" type="text" maxlength="90"
                   value="${escapar(a.nota)}" placeholder="Ex.: capítulo 7, página 120"
                   aria-label="Onde parei">
          </div>
        </div>

        <p class="legenda">Os 5 pontos até concluir — cada um fecha ${PESO_DO_PONTO}% do círculo.</p>
        <ul class="lista-pontos">${listaDePontos(a)}</ul>

        <div class="atividade-acoes">
          ${concluida ? '<button data-acao="reabrir">Reabrir</button>' : ''}
          <button data-acao="remover">Remover</button>
        </div>
      </div>
    </li>`;
}

function renderAtividades() {
  const todas = estado.atividades || [];
  const abertas = todas.filter(a => !a.concluida);
  const feitas = todas.filter(a => a.concluida);

  /* Mais avançadas primeiro; empatadas, as paradas há mais tempo sobem. */
  abertas.sort((a, b) => percentualAtividade(b) - percentualAtividade(a) || diasParado(b) - diasParado(a));

  $('#lista-atividades').innerHTML = abertas.map(a => cartaoAtividade(a, false)).join('');
  $('#atividades-vazio').hidden = abertas.length > 0;

  $('#bloco-concluidas').hidden = feitas.length === 0;
  $('#resumo-concluidas').textContent = `Concluídas (${feitas.length})`;
  $('#lista-concluidas').innerHTML = feitas.map(a => cartaoAtividade(a, true)).join('');
}

function ligarEventosAtividades() {
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
    const novo = {
      id: idNovo(),
      titulo,
      icone: $('#atv-icone').value.trim() || '📌',
      nota: '',
      concluida: false,
      atualizadoEm: hoje,
      pontos: pontosVazios()
    };
    atualizar(() => { estado.atividades.push(novo); });
    atividadesAbertas.add(novo.id);
    renderAtividades();
    $('#form-atividade').hidden = true;
    $('#form-atividade').reset();
    avisar('Atividade criada. Defina os 5 pontos.');
  });

  /* Digitação: nome dos pontos e anotação de onde parou salvam a cada tecla. */
  document.addEventListener('input', evento => {
    const item = evento.target.closest('[data-atividade]');
    if (!item) return;
    const atividade = (estado.atividades || []).find(a => a.id === item.dataset.atividade);
    if (!atividade) return;

    if (evento.target.classList.contains('ponto-titulo')) {
      atividade.pontos[Number(evento.target.dataset.indice)].titulo = evento.target.value;
      persistir();
    } else if (evento.target.classList.contains('atividade-nota-campo')) {
      atividade.nota = evento.target.value;
      atividade.atualizadoEm = hoje;
      persistir();
    }
  });

  /* Ao sair do campo, redesenha para liberar o botão de concluir do ponto nomeado. */
  document.addEventListener('change', evento => {
    if (evento.target.closest('.ponto-titulo, .atividade-nota-campo')) renderAtividades();
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
      if (atividadesAbertas.has(id)) atividadesAbertas.delete(id);
      else atividadesAbertas.add(id);
      renderAtividades();

    } else if (acao === 'alternar-ponto') {
      const ponto = atividade.pontos[Number(gatilho.dataset.indice)];
      atualizar(() => {
        ponto.concluido = !ponto.concluido;
        ponto.em = ponto.concluido ? isoParaData(hoje).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
        atividade.atualizadoEm = hoje;
        /* O círculo fechou: a atividade se conclui sozinha. */
        atividade.concluida = pontosConcluidos(atividade) === PONTOS_POR_ATIVIDADE;
      });
      if (atividade.concluida) avisar('🏁 Círculo fechado! Objetivo concluído.');
      else if (ponto.concluido) avisar(`+${PESO_DO_PONTO}% · ${percentualAtividade(atividade)}% do círculo`);

    } else if (acao === 'reabrir') {
      atualizar(() => { atividade.concluida = false; atividade.atualizadoEm = hoje; });

    } else if (acao === 'remover' && confirm(`Remover "${atividade.titulo}"?`)) {
      atualizar(() => { estado.atividades = estado.atividades.filter(a => a.id !== id); });
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
