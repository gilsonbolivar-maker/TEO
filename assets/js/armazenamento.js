/* Camada de persistência: tudo vive no localStorage do navegador do usuário. */

const CHAVE = 'teo-programa-v1';

function idNovo() {
  return 'h' + Math.random().toString(36).slice(2, 9);
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

function dataParaISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function somarDias(iso, dias) {
  const d = isoParaData(iso);
  d.setDate(d.getDate() + dias);
  return dataParaISO(d);
}

function estadoInicial() {
  return {
    versao: 1,
    perfil: {
      nome: 'Teo Neto',
      objetivo: '',
      inicio: hojeISO()
    },
    habitos: HABITOS_PADRAO.map(h => ({ id: idNovo(), ativo: true, ...h })),
    registros: {},
    config: { tema: 'escuro' }
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

/* Preenche campos que possam faltar em dados antigos ou importados. */
function normalizar(estado) {
  const base = estadoInicial();
  const limpo = {
    versao: 1,
    perfil: Object.assign({}, base.perfil, estado.perfil || {}),
    habitos: Array.isArray(estado.habitos) ? estado.habitos : base.habitos,
    registros: (estado.registros && typeof estado.registros === 'object') ? estado.registros : {},
    config: Object.assign({}, base.config, estado.config || {})
  };
  limpo.habitos = limpo.habitos
    .filter(h => h && typeof h.nome === 'string')
    .map(h => ({
      id: h.id || idNovo(),
      nome: h.nome,
      icone: h.icone || '✅',
      pontos: Number(h.pontos) > 0 ? Number(h.pontos) : 10,
      ativo: h.ativo !== false
    }));
  Object.keys(limpo.registros).forEach(dia => {
    const r = limpo.registros[dia] || {};
    limpo.registros[dia] = {
      habitos: (r.habitos && typeof r.habitos === 'object') ? r.habitos : {},
      vitoria: typeof r.vitoria === 'string' ? r.vitoria : '',
      energia: Number(r.energia) || 0
    };
  });
  return limpo;
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
