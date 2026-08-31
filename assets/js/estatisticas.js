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

/* O primeiro ponto ainda não concluído — o que fazer em seguida. */
function proximoPonto(atividade) {
  const indice = atividade.pontos.findIndex(p => !p.concluido);
  if (indice === -1) return null;
  return { indice, ponto: atividade.pontos[indice] };
}

/* ---------- Moto ---------- */

/* Consumo de um abastecimento: distância desde o anterior dividida pelos litros deste.
   O primeiro registro não tem consumo, por não haver distância anterior conhecida. */
function abastecimentosComConsumo(moto) {
  const lista = moto.abastecimentos.slice().sort((a, b) => a.km - b.km);
  return lista.map((a, i) => {
    const anterior = lista[i - 1];
    const distancia = anterior ? a.km - anterior.km : 0;
    return {
      ...a,
      distancia,
      consumo: anterior && a.litros > 0 ? distancia / a.litros : 0,
      precoLitro: a.valor > 0 ? a.valor / a.litros : 0
    };
  });
}

function kmAtual(moto) {
  return moto.abastecimentos.reduce((maior, a) => Math.max(maior, a.km), 0);
}

function resumoMoto(moto) {
  const lista = abastecimentosComConsumo(moto);
  const comConsumo = lista.filter(a => a.consumo > 0);
  const distanciaTotal = lista.length > 1 ? lista[lista.length - 1].km - lista[0].km : 0;
  const litrosTotais = lista.slice(1).reduce((soma, a) => soma + a.litros, 0);
  const gastoTotal = lista.slice(1).reduce((soma, a) => soma + a.valor, 0);
  return {
    lista,
    km: kmAtual(moto),
    ultimoConsumo: comConsumo.length ? comConsumo[comConsumo.length - 1].consumo : 0,
    consumoMedio: litrosTotais > 0 ? distanciaTotal / litrosTotais : 0,
    custoPorKm: distanciaTotal > 0 && gastoTotal > 0 ? gastoTotal / distanciaTotal : 0,
    abastecimentos: lista.length
  };
}

/* Quanto falta para a próxima manutenção, em quilômetros. */
function situacaoManutencao(manutencao, km) {
  /* Sem registro da última troca não há como cobrar a próxima. */
  if (!manutencao.ultimaKm) {
    return { semRegistro: true, proxima: 0, restante: 0, percorrido: 0, vencida: false, perto: false };
  }
  const proxima = manutencao.ultimaKm + manutencao.intervalo;
  const restante = proxima - km;
  const percorrido = manutencao.intervalo > 0
    ? Math.min(100, Math.max(0, Math.round(((km - manutencao.ultimaKm) / manutencao.intervalo) * 100)))
    : 0;
  return { proxima, restante, percorrido, vencida: restante <= 0, perto: restante > 0 && restante <= 300 };
}
