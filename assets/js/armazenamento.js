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
  return Array.from({ length: PONTOS_POR_ATIVIDADE }, () => ({ titulo: '', concluido: false, em: '' }));
}

/* Sempre devolve exatamente 5 pontos, completando o que vier salvo. */
function normalizarPontos(bruto) {
  const lista = Array.isArray(bruto) ? bruto : [];
  return Array.from({ length: PONTOS_POR_ATIVIDADE }, (_, i) => {
    const p = lista[i] || {};
    return {
      titulo: typeof p.titulo === 'string' ? p.titulo : '',
      concluido: p.concluido === true,
      em: typeof p.em === 'string' ? p.em : ''
    };
  });
}

function estadoInicial() {
  return {
    versao: 2,
    perfil: { nome: 'Teo Neto', objetivo: '', inicio: hojeISO() },
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
