/* Cálculos derivados do estado: pontos, sequências, nível e desempenho por hábito. */

const BONUS_DIA_PERFEITO = 20;

function habitosAtivos(estado) {
  return estado.habitos.filter(h => h.ativo);
}

function registroDo(estado, dia) {
  return estado.registros[dia] || { habitos: {}, vitoria: '', energia: 0 };
}

function marcadosNoDia(estado, dia) {
  const marcados = registroDo(estado, dia).habitos;
  return Object.keys(marcados).filter(id => marcados[id]);
}

function diaAtivo(estado, dia) {
  return marcadosNoDia(estado, dia).length > 0;
}

function diaPerfeito(estado, dia) {
  const ativos = habitosAtivos(estado);
  if (ativos.length === 0) return false;
  const marcados = registroDo(estado, dia).habitos;
  return ativos.every(h => marcados[h.id]);
}

function pontosDoDia(estado, dia) {
  const marcados = registroDo(estado, dia).habitos;
  let total = 0;
  estado.habitos.forEach(h => {
    if (marcados[h.id]) total += h.pontos;
  });
  if (diaPerfeito(estado, dia)) total += BONUS_DIA_PERFEITO;
  return total;
}

function progressoDoDia(estado, dia) {
  const ativos = habitosAtivos(estado);
  if (ativos.length === 0) return 0;
  const marcados = registroDo(estado, dia).habitos;
  const feitos = ativos.filter(h => marcados[h.id]).length;
  return Math.round((feitos / ativos.length) * 100);
}

/* Dias com atividade, do mais antigo para o mais recente. */
function diasComAtividade(estado) {
  return Object.keys(estado.registros)
    .filter(dia => diaAtivo(estado, dia))
    .sort();
}

function sequenciaAtual(estado) {
  const hoje = hojeISO();
  let cursor = diaAtivo(estado, hoje) ? hoje : somarDias(hoje, -1);
  let sequencia = 0;
  while (diaAtivo(estado, cursor)) {
    sequencia++;
    cursor = somarDias(cursor, -1);
  }
  return sequencia;
}

function melhorSequencia(estado) {
  const dias = diasComAtividade(estado);
  let melhor = 0;
  let atual = 0;
  let anterior = null;
  dias.forEach(dia => {
    atual = (anterior && somarDias(anterior, 1) === dia) ? atual + 1 : 1;
    if (atual > melhor) melhor = atual;
    anterior = dia;
  });
  return melhor;
}

/* Quantas vezes o programa foi retomado depois de um dia em branco. */
function retomadas(estado) {
  const dias = diasComAtividade(estado);
  let total = 0;
  for (let i = 1; i < dias.length; i++) {
    if (somarDias(dias[i - 1], 1) !== dias[i]) total++;
  }
  return total;
}

function nivelDe(pontos) {
  let atual = NIVEIS[0];
  for (const n of NIVEIS) {
    if (pontos >= n.minimo) atual = n;
  }
  const proximo = NIVEIS.find(n => n.minimo > pontos) || null;
  const base = atual.minimo;
  const alvo = proximo ? proximo.minimo : atual.minimo;
  const progresso = proximo ? Math.round(((pontos - base) / (alvo - base)) * 100) : 100;
  return { atual, proximo, progresso, faltam: proximo ? alvo - pontos : 0 };
}

/* Percentual de dias em que cada hábito foi cumprido na janela informada. */
function desempenhoPorHabito(estado, dias) {
  const hoje = hojeISO();
  const inicio = estado.perfil.inicio || hoje;
  const janela = [];
  for (let i = dias - 1; i >= 0; i--) {
    const dia = somarDias(hoje, -i);
    if (dia >= inicio) janela.push(dia);
  }
  return habitosAtivos(estado).map(h => {
    const feitos = janela.filter(dia => registroDo(estado, dia).habitos[h.id]).length;
    return {
      habito: h,
      feitos,
      total: janela.length,
      percentual: janela.length ? Math.round((feitos / janela.length) * 100) : 0
    };
  });
}

function estatisticas(estado) {
  const dias = Object.keys(estado.registros).sort();
  let pontos = 0;
  let totalMarcacoes = 0;
  let diasPerfeitos = 0;
  let vitoriasRegistradas = 0;

  dias.forEach(dia => {
    pontos += pontosDoDia(estado, dia);
    totalMarcacoes += marcadosNoDia(estado, dia).length;
    if (diaPerfeito(estado, dia)) diasPerfeitos++;
    if (registroDo(estado, dia).vitoria.trim()) vitoriasRegistradas++;
  });

  const pontuacao = pontos;
  return {
    pontos: pontuacao,
    totalMarcacoes,
    diasAtivos: diasComAtividade(estado).length,
    diasPerfeitos,
    vitoriasRegistradas,
    sequenciaAtual: sequenciaAtual(estado),
    melhorSequencia: melhorSequencia(estado),
    retomadas: retomadas(estado),
    nivel: nivelDe(pontuacao)
  };
}

function conquistasDesbloqueadas(stats) {
  return CONQUISTAS.map(c => ({ ...c, desbloqueada: c.teste(stats) }));
}

/* Frase do dia: determinística, muda a cada data. */
function fraseDoDia(dia) {
  const base = isoParaData(dia).getTime() / 86400000;
  return FRASES[Math.floor(base) % FRASES.length];
}
