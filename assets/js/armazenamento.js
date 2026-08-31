/* Camada de persistência: tudo vive no localStorage do navegador do usuário. */

const CHAVE = 'teo-programa-v1';

function idNovo() {
  return 'a' + Math.random().toString(36).slice(2, 9);
}

function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function isoParaData(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

function somarDias(iso, dias) {
  const d = isoParaData(iso);
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function pontosVazios() {
  return Array.from({ length: PONTOS_POR_ATIVIDADE }, () => ({ titulo: '', concluido: false, em: '', recompensa: '' }));
}

/* Sempre devolve exatamente 5 pontos, completando o que vier salvo. */
function normalizarPontos(bruto) {
  const lista = Array.isArray(bruto) ? bruto : [];
  return Array.from({ length: PONTOS_POR_ATIVIDADE }, (_, i) => {
    const p = lista[i] || {};
    return {
      titulo: typeof p.titulo === 'string' ? p.titulo : '',
      concluido: p.concluido === true,
      em: typeof p.em === 'string' ? p.em : '',
      recompensa: typeof p.recompensa === 'string' ? p.recompensa : ''
    };
  });
}

function motoVazia() {
  return {
    apelido: '',
    manutencoes: {
      oleo: { intervalo: 3000, ultimaKm: 0, ultimaEm: '' },
      revisao: { intervalo: 6000, ultimaKm: 0, ultimaEm: '' }
    },
    abastecimentos: []
  };
}

function normalizarMoto(bruto) {
  const base = motoVazia();
  const m = bruto && typeof bruto === 'object' ? bruto : {};
  const manutencoes = {};
  Object.keys(base.manutencoes).forEach(chave => {
    const g = (m.manutencoes || {})[chave] || {};
    manutencoes[chave] = {
      intervalo: Number(g.intervalo) > 0 ? Number(g.intervalo) : base.manutencoes[chave].intervalo,
      ultimaKm: Number(g.ultimaKm) || 0,
      ultimaEm: typeof g.ultimaEm === 'string' ? g.ultimaEm : ''
    };
  });
  return {
    apelido: typeof m.apelido === 'string' ? m.apelido : '',
    manutencoes,
    abastecimentos: (Array.isArray(m.abastecimentos) ? m.abastecimentos : [])
      .filter(a => a && Number(a.km) > 0 && Number(a.litros) > 0)
      .map(a => ({
        id: a.id || idNovo(),
        em: typeof a.em === 'string' ? a.em : hojeISO(),
        km: Number(a.km),
        litros: Number(a.litros),
        valor: Number(a.valor) || 0,
        preco: Number(a.preco) || (Number(a.valor) > 0 ? Number(a.valor) / Number(a.litros) : 0)
      }))
      .sort((x, y) => x.km - y.km)
  };
}

function estadoInicial() {
  return {
    versao: 2,
    perfil: { nome: 'Teo Neto', objetivo: '', inicio: hojeISO() },
    recompensas: [],
    moto: motoVazia(),
    atividades: []
  };
}

function carregar() {
  let bruto = null;
  try {
    bruto = localStorage.getItem(CHAVE);
  } catch (e) {
    console.warn('localStorage indisponível; os dados não serão salvos.', e);
    return estadoInicial();
  }
  if (!bruto) return estadoInicial();
  try {
    return normalizar(JSON.parse(bruto));
  } catch (e) {
    console.warn('Dados salvos corrompidos; recomeçando do zero.', e);
    return estadoInicial();
  }
}

/* Preenche o que falta e descarta campos de versões antigas. */
function normalizar(estado) {
  const base = estadoInicial();
  return {
    versao: 2,
    perfil: Object.assign({}, base.perfil, estado.perfil || {}),
    recompensas: (Array.isArray(estado.recompensas) ? estado.recompensas : [])
      .filter(r => typeof r === 'string' && r.trim())
      .map(r => r.trim()),
    moto: normalizarMoto(estado.moto),
    atividades: (Array.isArray(estado.atividades) ? estado.atividades : [])
      .filter(a => a && typeof a.titulo === 'string')
      .map(a => ({
        id: a.id || idNovo(),
        titulo: a.titulo,
        icone: a.icone || '📌',
        nota: typeof a.nota === 'string' ? a.nota : '',
        concluida: a.concluida === true,
        criadaEm: a.criadaEm || a.atualizadoEm || hojeISO(),
        atualizadoEm: a.atualizadoEm || hojeISO(),
        pontos: normalizarPontos(a.pontos)
      }))
  };
}

function salvar(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
    return true;
  } catch (e) {
    console.warn('Não foi possível salvar no navegador.', e);
    return false;
  }
}

function exportarJSON(estado) {
  return JSON.stringify(estado, null, 2);
}

function importarJSON(texto) {
  return normalizar(JSON.parse(texto));
}

function apagarTudo() {
  try {
    localStorage.removeItem(CHAVE);
  } catch (e) {
    console.warn('Não foi possível limpar o armazenamento.', e);
  }
}
