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
  { id: 'aulas', rotulo: '🎓 Aulas' },
  { id: 'moto', rotulo: '🏍️ Moto' },
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
  const seguinte = a.concluida ? null : proximoPonto(a);
  const proximo = seguinte
    ? (seguinte.ponto.titulo.trim() || `Defina o ponto ${seguinte.indice + 1}`)
    : null;
  return `
    <li class="atividade ${a.concluida ? 'fechada' : ''}" data-atividade="${a.id}">
      <button class="atividade-cabecalho" data-acao="abrir">
        <span class="atividade-icone">${escapar(a.icone)}</span>
        <span class="atividade-info">
          <span class="atividade-titulo">${escapar(a.titulo)}</span>
          <span class="regua"><span style="width:${pct}%"></span></span>
          <span class="atividade-linha-info">${pontosConcluidos(a)} de ${PONTOS_POR_ATIVIDADE} pontos · ${a.concluida ? 'concluída' : textoParado(a)}</span>
          ${proximo ? `<span class="proximo-passo">→ ${escapar(proximo)}</span>` : ''}
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
  renderOpcoesRecompensa();
}

const ICONE_NIVEL = { alerta: '⛔', atencao: '⚠️', bom: '✅', neutro: '🔎' };

function renderAvaliacao(texto) {
  const caixa = $('#avaliacao-recompensa');
  const avisos = avaliarRecompensa(texto);
  caixa.hidden = avisos.length === 0;
  caixa.innerHTML = avisos.map(a => `
    <p class="aviso-item ${a.nivel}"><span>${ICONE_NIVEL[a.nivel]}</span> ${escapar(a.texto)}</p>
  `).join('');
}

function renderOpcoesRecompensa() {
  const jaTem = estado.recompensas || [];
  const disponiveis = RECOMPENSAS_SUGERIDAS.filter(r => !jaTem.includes(r));
  $('#opcoes-recompensa').innerHTML = disponiveis.map(r => `
    <li><button class="opcao-recompensa" data-sugestao="${escapar(r)}">＋ ${escapar(r)}</button></li>
  `).join('') + `
    <li><button class="opcao-recompensa outra" id="botao-outra">＋ Outra — escrever a minha</button></li>`;
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

/* ---------- Aulas ---------- */

const HORAS_NO_MOSTRADOR = 12;
let semanaVista = segundaDaSemana(hojeISO());
const CORES_SETOR = ['#ff7a2f', '#3ecf8e', '#5b9cff', '#c77dff', '#ffb347', '#ff6b8a'];

/* Ponto na circunferência para um horário: 12h no topo, sentido horário. */
function pontoDoRelogio(cx, cy, raio, minutos) {
  const angulo = ((minutos % 720) / 720) * 2 * Math.PI - Math.PI / 2;
  return [cx + raio * Math.cos(angulo), cy + raio * Math.sin(angulo)];
}

function setorSVG(inicio, fim, raioInterno, raioExterno) {
  const [x1e, y1e] = pontoDoRelogio(100, 100, raioExterno, inicio);
  const [x2e, y2e] = pontoDoRelogio(100, 100, raioExterno, fim);
  const [x1i, y1i] = pontoDoRelogio(100, 100, raioInterno, inicio);
  const [x2i, y2i] = pontoDoRelogio(100, 100, raioInterno, fim);
  const grande = (fim - inicio) > 360 ? 1 : 0;
  return `M ${x1e} ${y1e} A ${raioExterno} ${raioExterno} 0 ${grande} 1 ${x2e} ${y2e}
          L ${x2i} ${y2i} A ${raioInterno} ${raioInterno} 0 ${grande} 0 ${x1i} ${y1i} Z`;
}

function renderMostrador(agora) {
  const minutos = agora.getHours() * 60 + agora.getMinutes() + agora.getSeconds() / 60;
  const janela = aulasNaJanela(estado.aulas || [], agora, HORAS_NO_MOSTRADOR, hoje);

  const marcas = Array.from({ length: 12 }, (_, i) => {
    const [x1, y1] = pontoDoRelogio(100, 100, 76, i * 60);
    const [x2, y2] = pontoDoRelogio(100, 100, 81, i * 60);
    const [xt, yt] = pontoDoRelogio(100, 100, 91, i * 60);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="marca"></line>
            <text x="${xt}" y="${yt}" class="marca-hora">${i === 0 ? 12 : i}</text>`;
  }).join('');

  const setores = janela.map((item, i) => `
    <path d="${setorSVG(item.inicio, item.fim, 56, 84)}"
          fill="${CORES_SETOR[i % CORES_SETOR.length]}"
          opacity="${item.comecou ? 1 : .82}"></path>`).join('');

  const [px, py] = pontoDoRelogio(100, 100, 74, minutos);
  const [pxi, pyi] = pontoDoRelogio(100, 100, 14, minutos + 360);

  $('#mostrador').innerHTML = `
    <svg viewBox="0 0 200 200" class="setograma" role="img" aria-label="Aulas das próximas 12 horas">
      <circle cx="100" cy="100" r="72" class="aro"></circle>
      <circle cx="100" cy="100" r="48" class="aro-interno"></circle>
      ${setores}
      ${marcas}
      <line x1="${pxi}" y1="${pyi}" x2="${px}" y2="${py}" class="ponteiro"></line>
      <circle cx="100" cy="100" r="5" class="centro"></circle>
      <text x="100" y="95" class="hora-central">${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</text>
      <text x="100" y="110" class="hora-legenda">próximas ${HORAS_NO_MOSTRADOR}h</text>
    </svg>`;

  $('#legenda-setores').innerHTML = janela.map((item, i) => `
    <li>
      <span class="ponto-cor" style="background:${CORES_SETOR[i % CORES_SETOR.length]}"></span>
      <strong>${escapar(item.aula.turma)}</strong>
      <small>${escapar(item.aula.inicio)}–${escapar(item.aula.fim)}${item.aula.local ? ' · ' + escapar(item.aula.local) : ''}</small>
    </li>`).join('');
}

function renderRelogio() {
  const agora = new Date();
  renderMostrador(agora);
  $('#relogio-data').textContent = agora.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long'
  });

  const s = situacaoAulas(estado.aulas || [], agora, hoje);
  const caixa = $('#aula-agora');

  if (s.emAndamento) {
    caixa.className = 'aula-agora em-aula';
    caixa.innerHTML = `
      <p class="aula-rotulo">Aula agora</p>
      <p class="aula-turma">${escapar(s.emAndamento.turma)}</p>
      <p class="aula-detalhe">${escapar(s.emAndamento.inicio)} às ${escapar(s.emAndamento.fim)}${s.emAndamento.local ? ' · ' + escapar(s.emAndamento.local) : ''} · termina em ${duracaoEmTexto(s.restante)}</p>`;
  } else if (s.proxima) {
    caixa.className = 'aula-agora';
    caixa.innerHTML = `
      <p class="aula-rotulo">Sem aula agora · próxima</p>
      <p class="aula-turma">${escapar(s.proxima.aula.turma)}</p>
      <p class="aula-detalhe">${escapar(DIAS_SEMANA[isoParaData(s.proxima.dia).getDay()])}, ${escapar(s.proxima.aula.inicio)}${s.proxima.aula.local ? ' · ' + escapar(s.proxima.aula.local) : ''} · em ${duracaoEmTexto(s.faltam)}</p>`;
  } else {
    caixa.className = 'aula-agora';
    caixa.innerHTML = '<p class="aula-detalhe">Nenhuma aula cadastrada na grade.</p>';
  }
}

function renderGrade() {
  const aulas = estado.aulas || [];
  const semanaAtual = segundaDaSemana(hoje);
  const fimSemana = somarDias(semanaVista, 6);

  $('#semana-titulo').textContent = semanaVista === semanaAtual
    ? `Esta semana · ${formatarDataCurta(semanaVista)} a ${formatarDataCurta(fimSemana)}`
    : `Semana de ${formatarDataCurta(semanaVista)} a ${formatarDataCurta(fimSemana)}`;
  $('#semana-hoje').hidden = semanaVista === semanaAtual;

  const dias = Array.from({ length: 7 }, (_, i) => somarDias(semanaVista, i))
    .filter(dia => aulasDoDia(aulas, dia).length);

  $('#grade-aulas').innerHTML = dias.map(dia => `
    <div class="dia-grade ${dia === hoje ? 'hoje' : ''}">
      <p class="dia-nome">${DIAS_SEMANA[isoParaData(dia).getDay()]} ${formatarDataCurta(dia)}${dia === hoje ? ' · hoje' : ''}</p>
      <ul class="lista-aulas">
        ${aulasDoDia(aulas, dia).map(a => `
          <li class="aula">
            <span class="aula-hora">${escapar(a.inicio)}<small>${escapar(a.fim)}</small></span>
            <span class="aula-info">
              <strong>${escapar(a.turma)}</strong>
              <small>${a.local ? escapar(a.local) + ' · ' : ''}${a.semana ? 'só nesta semana' : 'toda semana'}${a.dias.length > 1 ? ' · ' + a.dias.map(d => DIAS_SEMANA[d].slice(0, 3)).join(', ') : ''}</small>
            </span>
            <button class="icone-botao" data-remover-aula="${a.id}" title="Remover">✕</button>
          </li>`).join('')}
      </ul>
    </div>`).join('');
  $('#aulas-vazio').hidden = dias.length > 0;
  $('#aulas-vazio').textContent = aulas.length
    ? 'Nenhuma aula nesta semana.'
    : 'Nenhuma aula na grade. Toque em + Aula.';
}

/* ---------- Moto ---------- */

const NOMES_MANUTENCAO = {
  oleo: { nome: 'Troca de óleo', icone: '🛢️' },
  revisao: { nome: 'Revisão', icone: '🔧' }
};

function numero(valor, casas) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

function renderMoto() {
  const moto = estado.moto;
  const r = resumoMoto(moto);

  $('#resumo-moto').innerHTML = `
    <div class="resumo-item"><span class="resumo-valor">${numero(r.km, 0)}<small> km</small></span><span class="resumo-rotulo">odômetro</span></div>
    <div class="resumo-item"><span class="resumo-valor">${r.ultimoConsumo ? numero(r.ultimoConsumo, 1) : '—'}<small> km/l</small></span><span class="resumo-rotulo">último consumo</span></div>
    <div class="resumo-item"><span class="resumo-valor">${r.consumoMedio ? numero(r.consumoMedio, 1) : '—'}<small> km/l</small></span><span class="resumo-rotulo">média geral</span></div>
    <div class="resumo-item"><span class="resumo-valor">${r.custoPorKm ? 'R$ ' + numero(r.custoPorKm, 2) : '—'}</span><span class="resumo-rotulo">custo por km</span></div>`;

  $('#manutencoes').innerHTML = Object.keys(moto.manutencoes).map(chave => {
    const m = moto.manutencoes[chave];
    const s = situacaoManutencao(m, r.km);
    const rotulo = s.semRegistro
      ? 'Sem registro'
      : s.vencida
        ? `Vencida há ${numero(-s.restante, 0)} km`
        : `Faltam ${numero(s.restante, 0)} km`;
    return `
      <div class="manutencao ${s.semRegistro ? 'sem-registro' : s.vencida ? 'vencida' : s.perto ? 'perto' : ''}" data-manutencao="${chave}">
        <div class="cabecalho">
          <span>${NOMES_MANUTENCAO[chave].icone} ${NOMES_MANUTENCAO[chave].nome}</span>
          <span class="manutencao-status">${rotulo}</span>
        </div>
        <div class="regua"><span style="width:${s.percorrido}%"></span></div>
        <p class="legenda">${s.semRegistro
          ? 'Toque em “Fiz agora” quando trocar, ou registre o histórico ajustando o intervalo.'
          : `Última em ${numero(m.ultimaKm, 0)} km${m.ultimaEm ? ' (' + formatarDataCurta(m.ultimaEm) + ')' : ''} · próxima em ${numero(s.proxima, 0)} km`}</p>
        <div class="manutencao-acoes">
          <label class="campo-rotulado pequeno">A cada (km)
            <input type="number" min="100" step="100" class="campo-intervalo" data-manutencao="${chave}" value="${m.intervalo}">
          </label>
          <button class="botao secundario compacto" data-feita="${chave}">Fiz agora</button>
        </div>
      </div>`;
  }).join('');

  $('#lista-abastecimentos').innerHTML = r.lista.slice().reverse().map(a => `
    <li class="abastecimento" data-abastecimento="${a.id}">
      <div class="abastecimento-info">
        <strong>${numero(a.km, 0)} km</strong>
        <small>${escapar(formatarDataCurta(a.em))} · ${numero(a.litros, 2)} L${a.valor ? ' · R$ ' + numero(a.valor, 2) : ''}${a.precoLitro ? ' (R$ ' + numero(a.precoLitro, 2) + '/L)' : ''}</small>
      </div>
      <span class="abastecimento-consumo">${a.consumo ? numero(a.consumo, 1) + ' km/l' : '—'}</span>
      <button class="icone-botao" data-remover-abastecimento="${a.id}" title="Remover">✕</button>
    </li>`).join('');
  $('#abastecimentos-vazio').hidden = r.lista.length > 0;
}

/* ---------- Render geral ---------- */

function render() {
  renderTopo();
  renderAbas();
  renderResumo();
  renderAtividades();
  renderProgresso();
  renderRecompensas();
  renderMoto();
  renderGrade();
  renderRelogio();
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
    $('#avaliacao-recompensa').hidden = true;
    $('#form-recompensa').hidden = true;
  });

  $('#nova-recompensa').addEventListener('input', evento => renderAvaliacao(evento.target.value));

  $('#opcoes-recompensa').addEventListener('click', evento => {
    const botao = evento.target.closest('button');
    if (!botao) return;
    if (botao.id === 'botao-outra') {
      $('#form-recompensa').hidden = false;
      $('#nova-recompensa').focus();
      return;
    }
    atualizar(() => { estado.recompensas.push(botao.dataset.sugestao); });
    avisar('Recompensa adicionada.');
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

  $('#aula-dias').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => `
    <label class="dia-chip">
      <input type="checkbox" value="${d}">
      <span>${DIAS_SEMANA[d].slice(0, 3)}</span>
    </label>`).join('');

  $('#botao-nova-aula').addEventListener('click', () => {
    const form = $('#form-aula');
    form.hidden = !form.hidden;
    if (!form.hidden) $('#aula-turma').focus();
  });

  $('#botao-cancelar-aula').addEventListener('click', () => {
    $('#form-aula').hidden = true;
    $('#form-aula').reset();
  });

  $('#form-aula').addEventListener('submit', evento => {
    evento.preventDefault();
    const turma = $('#aula-turma').value.trim();
    const inicio = $('#aula-inicio').value;
    const fim = $('#aula-fim').value;
    const dias = $$('#aula-dias input:checked').map(c => Number(c.value));
    if (!turma || !inicio || !fim) return;
    if (!dias.length) { avisar('Marque pelo menos um dia da semana.'); return; }
    if (minutosDe(fim) <= minutosDe(inicio)) { avisar('O fim precisa ser depois do início.'); return; }

    atualizar(() => {
      estado.aulas.push({
        id: idNovo(), dias: dias.sort(), inicio, fim, turma,
        local: $('#aula-local').value.trim(),
        semana: $('#aula-repeticao').value === 'unica' ? semanaVista : ''
      });
      estado.aulas.sort((x, y) => x.dias[0] - y.dias[0] || (x.inicio < y.inicio ? -1 : 1));
    });
    $('#form-aula').hidden = true;
    $('#form-aula').reset();
    avisar(dias.length > 1 ? `Aula adicionada em ${dias.length} dias.` : 'Aula adicionada à grade.');
  });

  $('#grade-aulas').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-remover-aula]');
    if (!botao) return;
    atualizar(() => {
      estado.aulas = estado.aulas.filter(a => a.id !== botao.dataset.removerAula);
    });
  });

  $('#semana-anterior').addEventListener('click', () => { semanaVista = somarDias(semanaVista, -7); renderGrade(); });
  $('#semana-proxima').addEventListener('click', () => { semanaVista = somarDias(semanaVista, 7); renderGrade(); });
  $('#semana-hoje').addEventListener('click', () => { semanaVista = segundaDaSemana(hoje); renderGrade(); });

  /* O relógio anda sozinho, sem redesenhar o resto da tela. */
  setInterval(renderRelogio, 1000);

  $('#botao-novo-abastecimento').addEventListener('click', () => {
    const form = $('#form-abastecimento');
    form.hidden = !form.hidden;
    if (!form.hidden) $('#ab-km').focus();
  });

  $('#botao-cancelar-abastecimento').addEventListener('click', () => {
    $('#form-abastecimento').hidden = true;
    $('#form-abastecimento').reset();
  });

  $('#form-abastecimento').addEventListener('submit', evento => {
    evento.preventDefault();
    const km = Number($('#ab-km').value);
    const litros = Number($('#ab-litros').value);
    if (!(km > 0) || !(litros > 0)) return;
    if (estado.moto.abastecimentos.some(a => a.km === km)) {
      avisar('Já existe um registro com essa quilometragem.');
      return;
    }
    const preco = Number($('#ab-preco').value) || 0;
    const valor = Number($('#ab-valor').value) || (preco > 0 ? preco * litros : 0);
    atualizar(() => {
      estado.moto.abastecimentos.push({
        id: idNovo(), em: hoje, km, litros, valor,
        preco: preco || (valor > 0 ? valor / litros : 0)
      });
      estado.moto.abastecimentos.sort((a, b) => a.km - b.km);
    });
    $('#form-abastecimento').hidden = true;
    $('#form-abastecimento').reset();
    const r = resumoMoto(estado.moto);
    avisar(r.ultimoConsumo ? `Consumo: ${numero(r.ultimoConsumo, 1)} km/l` : 'Abastecimento registrado.');
  });

  /* Preço do litro e valor pago se completam: preencher um calcula o outro. */
  $('#form-abastecimento').addEventListener('input', evento => {
    const litros = Number($('#ab-litros').value);
    if (!(litros > 0)) return;
    if (evento.target.id === 'ab-preco' || (evento.target.id === 'ab-litros' && $('#ab-preco').value)) {
      const preco = Number($('#ab-preco').value);
      if (preco > 0) $('#ab-valor').value = (preco * litros).toFixed(2);
    } else if (evento.target.id === 'ab-valor') {
      const valor = Number($('#ab-valor').value);
      if (valor > 0) $('#ab-preco').value = (valor / litros).toFixed(2);
    }
  });

  $('#lista-abastecimentos').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-remover-abastecimento]');
    if (!botao) return;
    const id = botao.dataset.removerAbastecimento;
    atualizar(() => {
      estado.moto.abastecimentos = estado.moto.abastecimentos.filter(a => a.id !== id);
    });
  });

  $('#manutencoes').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-feita]');
    if (!botao) return;
    const chave = botao.dataset.feita;
    const km = kmAtual(estado.moto);
    if (!km) { avisar('Registre um abastecimento primeiro, para o app saber a quilometragem.'); return; }
    atualizar(() => {
      estado.moto.manutencoes[chave].ultimaKm = km;
      estado.moto.manutencoes[chave].ultimaEm = hoje;
    });
    avisar(`${NOMES_MANUTENCAO[chave].nome} registrada em ${numero(km, 0)} km.`);
  });

  $('#manutencoes').addEventListener('change', evento => {
    const campo = evento.target.closest('.campo-intervalo');
    if (!campo) return;
    const valor = Number(campo.value);
    if (!(valor > 0)) return;
    atualizar(() => { estado.moto.manutencoes[campo.dataset.manutencao].intervalo = valor; });
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

/* Registra o service worker para o programa funcionar sem internet.
   Quando uma versão nova assume, a página recarrega uma vez: sem isso o
   HTML novo ficaria rodando com o JavaScript antigo guardado no aparelho. */
if ('serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost')) {
  let recarregando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recarregando) return;
    recarregando = true;
    location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registro => registro.update())
      .catch(erro => console.warn('Service worker não registrado:', erro));
  });
}
