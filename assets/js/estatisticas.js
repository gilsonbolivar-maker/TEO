/* Cálculos derivados das atividades: percentuais, tempo parado e histórico. */

function pontosConcluidos(atividade) {
  return atividade.pontos.filter(p => p.concluido).length;
}

function percentualAtividade(atividade) {
  return Math.round(pontosConcluidos(atividade) * PESO_DO_PONTO);
}

function diasParado(atividade, referencia) {
  const d = Math.round((isoParaData(referencia) - isoParaData(atividade.atualizadoEm)) / 86400000);
  return d > 0 ? d : 0;
}

function formatarDataCurta(iso) {
  if (!iso || iso.indexOf('-') === -1) return iso || '';
  return isoParaData(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function ordenarAtividades(lista, referencia) {
  return lista.slice().sort((a, b) =>
    Number(a.concluida) - Number(b.concluida) ||
    percentualAtividade(b) - percentualAtividade(a) ||
    diasParado(b, referencia) - diasParado(a, referencia));
}

function resumoGeral(estado) {
  const todas = estado.atividades || [];
  const andamento = todas.filter(a => !a.concluida);
  const concluidas = todas.filter(a => a.concluida);
  const feitos = todas.reduce((soma, a) => soma + pontosConcluidos(a), 0);
  const totais = todas.length * PONTOS_POR_ATIVIDADE;
  return {
    total: todas.length,
    andamento: andamento.length,
    concluidas: concluidas.length,
    pontosFeitos: feitos,
    pontosTotais: totais,
    mediaPercentual: totais ? Math.round((feitos / totais) * 100) : 0
  };
}

/* Todos os pontos já concluídos, do mais recente para o mais antigo. */
function historicoDeAvancos(estado) {
  const avancos = [];
  (estado.atividades || []).forEach(atividade => {
    atividade.pontos.forEach((ponto, indice) => {
      if (ponto.concluido && ponto.em) {
        avancos.push({ atividade, ponto, indice, em: ponto.em });
      }
    });
  });
  return avancos.sort((a, b) => (a.em < b.em ? 1 : a.em > b.em ? -1 : 0));
}
