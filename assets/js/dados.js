/* Dados estáticos do programa. */

const FRASES = [
  { texto: 'Disciplina é escolher entre o que você quer agora e o que você quer mais.', autor: 'Abraham Lincoln' },
  { texto: 'Não é preciso ser grande para começar, mas é preciso começar para ser grande.', autor: 'Zig Ziglar' },
  { texto: 'A repetição vence o talento quando o talento não repete.', autor: 'Provérbio do esporte' },
  { texto: 'Você não sobe ao nível dos seus objetivos, você cai ao nível dos seus sistemas.', autor: 'James Clear' },
  { texto: 'O melhor momento para plantar uma árvore foi há 20 anos. O segundo melhor é agora.', autor: 'Provérbio chinês' },
  { texto: 'Pequenos progressos diários geram resultados impressionantes com o tempo.', autor: 'Robin Sharma' },
  { texto: 'A dor da disciplina pesa gramas. A dor do arrependimento pesa toneladas.', autor: 'Jim Rohn' },
  { texto: 'Comece onde você está. Use o que você tem. Faça o que você pode.', autor: 'Arthur Ashe' },
  { texto: 'Sucesso é a soma de pequenos esforços repetidos dia após dia.', autor: 'Robert Collier' },
  { texto: 'Nunca é tarde para ser aquilo que você poderia ter sido.', autor: 'George Eliot' },
  { texto: 'Cair sete vezes, levantar oito.', autor: 'Provérbio japonês' },
  { texto: 'A motivação te faz começar. O hábito te faz continuar.', autor: 'Jim Ryun' },
  { texto: 'Faça hoje o que os outros não querem, para viver amanhã como os outros não podem.', autor: 'Jerry Rice' },
  { texto: 'Você é o resultado do que faz repetidamente. Excelência é hábito, não ato.', autor: 'Aristóteles (atribuído)' },
  { texto: 'Um dia ou dia um. Você decide.', autor: 'Anônimo' },
  { texto: 'A jornada de mil quilômetros começa com um único passo.', autor: 'Lao-Tsé' },
  { texto: 'Se está difícil, é porque você está no caminho certo, não no caminho fácil.', autor: 'Anônimo' },
  { texto: 'Ninguém é lembrado pelo que planejou fazer.', autor: 'Anônimo' },
  { texto: 'Energia e persistência conquistam todas as coisas.', autor: 'Benjamin Franklin' },
  { texto: 'O que você faz nos dias sem vontade define o seu resultado.', autor: 'Anônimo' },
  { texto: 'Não conte os dias. Faça os dias contarem.', autor: 'Muhammad Ali' },
  { texto: 'A qualidade nunca é um acidente: é sempre o resultado de um esforço inteligente.', autor: 'John Ruskin' },
  { texto: 'Compare-se com quem você era ontem, não com quem outra pessoa é hoje.', autor: 'Jordan Peterson' },
  { texto: 'O sucesso é ir de fracasso em fracasso sem perder o entusiasmo.', autor: 'Winston Churchill' },
  { texto: 'A sorte é o que acontece quando a preparação encontra a oportunidade.', autor: 'Sêneca' },
  { texto: 'Foco não é dizer sim ao que importa. É dizer não a mil outras coisas.', autor: 'Steve Jobs' },
  { texto: 'Aquele que tem um porquê enfrenta quase qualquer como.', autor: 'Friedrich Nietzsche' },
  { texto: 'Não espere pela inspiração. Ela chega quando você já está trabalhando.', autor: 'Pablo Picasso' },
  { texto: 'Constância vale mais que intensidade.', autor: 'Anônimo' },
  { texto: 'Vencer não é tudo, mas querer vencer é.', autor: 'Vince Lombardi' },
  { texto: 'Você perde 100% das chances que não arrisca.', autor: 'Wayne Gretzky' },
  { texto: 'Um pouco todo dia vence muito de vez em quando.', autor: 'Anônimo' },
  { texto: 'Todo mestre já foi um iniciante que não desistiu.', autor: 'Anônimo' },
  { texto: 'A mente cansada mente. Continue mesmo assim.', autor: 'David Goggins (adaptado)' },
  { texto: 'Faça de novo. Faça melhor. Faça amanhã também.', autor: 'Anônimo' },
  { texto: 'Coragem não é ausência de medo, é agir apesar dele.', autor: 'Nelson Mandela' },
  { texto: 'O corpo alcança o que a mente acredita.', autor: 'Napoleon Hill' },
  { texto: 'Disciplina é liberdade.', autor: 'Jocko Willink' },
  { texto: 'Melhor 1% hoje do que 100% num dia que nunca chega.', autor: 'Anônimo' },
  { texto: 'Quem quer, arruma um jeito. Quem não quer, arruma uma desculpa.', autor: 'Provérbio popular' },
  { texto: 'Grandes resultados exigem grandes ambições.', autor: 'Heráclito' },
  { texto: 'Trabalhe enquanto eles dormem. Aprenda enquanto eles se distraem.', autor: 'Anônimo' }
];

/* Cada atividade se divide em 5 pontos; cada ponto vale 20% do círculo. */
const PONTOS_POR_ATIVIDADE = 5;
const PESO_DO_PONTO = 100 / PONTOS_POR_ATIVIDADE;

/* O ícone da atividade é deduzido do nome — sem campo para preencher. */
const ICONES = [
  { icone: '📖', palavras: ['ler', 'leitura', 'livro', 'romance'] },
  { icone: '🏃', palavras: ['corr', ' km', 'maratona', 'caminhada'] },
  { icone: '🏋️', palavras: ['academia', 'muscula', 'treino', 'peso'] },
  { icone: '🎸', palavras: ['violão', 'violao', 'guitarra', 'música', 'musica', 'piano', 'bateria'] },
  { icone: '🗣️', palavras: ['inglês', 'ingles', 'espanhol', 'idioma', 'francês'] },
  { icone: '💻', palavras: ['program', 'código', 'codigo', 'site', 'aplicativo'] },
  { icone: '🎓', palavras: ['curso', 'aula', 'estud', 'faculdade', 'escola'] },
  { icone: '📝', palavras: ['prova', 'vestibular', 'enem', 'concurso', 'redaç'] },
  { icone: '🥗', palavras: ['dieta', 'aliment', 'comida', 'emagrec'] },
  { icone: '🧘', palavras: ['medita', 'respira', 'ioga', 'yoga'] },
  { icone: '💰', palavras: ['dinheiro', 'poupar', 'financ', 'investir', 'economizar'] },
  { icone: '✍️', palavras: ['escrev', 'diário', 'texto', 'artigo'] },
  { icone: '🚴', palavras: ['bicicleta', 'bike', 'pedal'] },
  { icone: '🏊', palavras: ['nata', 'piscina', 'nadar'] },
  { icone: '⚽', palavras: ['futebol', 'jogo', 'time'] },
  { icone: '✈️', palavras: ['viagem', 'viajar'] },
  { icone: '🎨', palavras: ['desenh', 'pint', 'arte'] }
];

function iconeSugerido(titulo) {
  const nome = titulo.toLowerCase();
  const achado = ICONES.find(item => item.palavras.some(palavra => nome.includes(palavra)));
  return achado ? achado.icone : '🎯';
}

/* Verificação simples da recompensa: procura termos conhecidos e devolve avisos.
   É uma checagem por palavras, não um julgamento — a decisão continua do usuário. */
const CHECAGENS = [
  {
    nivel: 'alerta',
    texto: 'Isso desfaz o esforço que você acabou de fazer. Recompensa não pode contradizer o objetivo.',
    termos: ['faltar', 'matar aula', 'pular treino', 'não estudar', 'nao estudar', 'não treinar',
             'nao treinar', 'largar', 'desistir', 'parar de']
  },
  {
    nivel: 'alerta',
    texto: 'Gasto alto para uma recompensa que se repete a cada ponto. Guarde para quando o círculo fechar, ou combine o valor antes.',
    termos: ['comprar', 'compra ', 'celular', 'iphone', 'ipad', 'videogame', 'console', 'playstation',
             'xbox', 'notebook', 'tênis', 'tenis', 'drone', 'r$', 'reais', 'dinheiro', 'mesada', 'viagem']
  },
  {
    nivel: 'atencao',
    texto: 'Atenção à saúde: melhor deixar como algo ocasional, não a cada ponto.',
    termos: ['refrigerante', 'doce', 'chocolate', 'fast food', 'hambúrguer', 'hamburguer', 'açúcar',
             'acucar', 'cerveja', 'álcool', 'alcool', 'cigarro', 'energético', 'energetico',
             'virar a noite', 'madrugada', 'balada']
  },
  {
    nivel: 'atencao',
    texto: 'Sem limite definido. Combine um tempo (ex.: uma hora) para não virar o dia inteiro.',
    termos: ['o dia inteiro', 'sem limite', 'ilimitado', 'quanto quiser', 'a noite toda', 'o quanto eu']
  },
  {
    nivel: 'bom',
    texto: 'Custo baixo ou nenhum, e não atrapalha a rotina.',
    termos: ['cinema', 'filme', 'série', 'serie', 'jogo', 'jogar', 'parque', 'praia', 'amigos', 'amigo',
             'dormir', 'música', 'musica', 'futebol', 'bicicleta', 'pedalar', 'passear', 'ler',
             'descansar', 'piscina', 'sorvete', 'lanche', 'pizza', 'skate', 'praia']
  }
];

function avaliarRecompensa(texto) {
  const nome = texto.toLowerCase().trim();
  if (!nome) return [];

  let avisos = CHECAGENS
    .filter(c => c.termos.some(t => nome.includes(t)))
    .map(c => ({ nivel: c.nivel, texto: c.texto }));

  /* Havendo ressalva, o elogio some: não faz sentido dizer que está tudo bem e alertar ao mesmo tempo. */
  if (avisos.some(a => a.nivel !== 'bom')) avisos = avisos.filter(a => a.nivel !== 'bom');

  if (nome.length < 4 || ['prêmio', 'premio', 'algo bom', 'alguma coisa', 'presente'].includes(nome)) {
    avisos.unshift({ nivel: 'atencao', texto: 'Muito vago. Descreva o que é, senão na hora não vale como recompensa.' });
  }

  if (!avisos.length) {
    avisos.push({ nivel: 'neutro', texto: 'Não encontrei problema. Confira você mesmo: cabe no bolso, faz bem e não atrapalha o objetivo?' });
  }
  return avisos;
}
