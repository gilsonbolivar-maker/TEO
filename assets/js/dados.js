/* Dados estáticos do programa: frases, hábitos sugeridos, níveis e conquistas. */

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

const HABITOS_SUGERIDOS = [
  { nome: 'Acordar no horário', icone: '⏰', pontos: 10 },
  { nome: 'Beber 2L de água', icone: '💧', pontos: 10 },
  { nome: 'Exercício físico (30 min)', icone: '🏃', pontos: 15 },
  { nome: 'Leitura (20 min)', icone: '📚', pontos: 10 },
  { nome: 'Estudo focado (1h)', icone: '🎯', pontos: 20 },
  { nome: 'Arrumar o quarto', icone: '🛏️', pontos: 5 },
  { nome: 'Sem redes sociais até o meio-dia', icone: '📵', pontos: 15 },
  { nome: 'Alimentação limpa', icone: '🥗', pontos: 10 },
  { nome: 'Dormir antes das 23h', icone: '🌙', pontos: 15 },
  { nome: 'Planejar o dia seguinte', icone: '🗒️', pontos: 10 }
];

const HABITOS_PADRAO = [
  { nome: 'Exercício físico (30 min)', icone: '🏃', pontos: 15 },
  { nome: 'Estudo focado (1h)', icone: '🎯', pontos: 20 },
  { nome: 'Leitura (20 min)', icone: '📚', pontos: 10 },
  { nome: 'Beber 2L de água', icone: '💧', pontos: 10 },
  { nome: 'Dormir antes das 23h', icone: '🌙', pontos: 15 }
];

const NIVEIS = [
  { nivel: 1,  nome: 'Semente',     minimo: 0 },
  { nivel: 2,  nome: 'Broto',       minimo: 100 },
  { nivel: 3,  nome: 'Raiz Firme',  minimo: 250 },
  { nivel: 4,  nome: 'No Ritmo',    minimo: 500 },
  { nivel: 5,  nome: 'Constância',  minimo: 900 },
  { nivel: 6,  nome: 'Disciplina',  minimo: 1400 },
  { nivel: 7,  nome: 'Força',       minimo: 2000 },
  { nivel: 8,  nome: 'Imparável',   minimo: 3000 },
  { nivel: 9,  nome: 'Lenda',       minimo: 4500 },
  { nivel: 10, nome: 'Mestre',      minimo: 6500 }
];

/* Cada conquista recebe as estatísticas calculadas e devolve true quando desbloqueada. */
const CONQUISTAS = [
  { id: 'primeiro-passo', icone: '👣', nome: 'Primeiro Passo',   desc: 'Marcar o primeiro hábito do programa.', teste: e => e.totalMarcacoes >= 1 },
  { id: 'dia-perfeito',   icone: '💯', nome: 'Dia Perfeito',     desc: 'Completar todos os hábitos em um dia.', teste: e => e.diasPerfeitos >= 1 },
  { id: 'trio',           icone: '🔥', nome: 'Pegando Fogo',     desc: 'Manter 3 dias seguidos de atividade.', teste: e => e.melhorSequencia >= 3 },
  { id: 'semana',         icone: '🗓️', nome: 'Semana Cheia',     desc: 'Manter 7 dias seguidos de atividade.', teste: e => e.melhorSequencia >= 7 },
  { id: 'quinzena',       icone: '⚡', nome: 'Duas Semanas',     desc: 'Manter 14 dias seguidos de atividade.', teste: e => e.melhorSequencia >= 14 },
  { id: 'mes',            icone: '🏆', nome: 'Um Mês Inteiro',   desc: 'Manter 30 dias seguidos de atividade.', teste: e => e.melhorSequencia >= 30 },
  { id: 'centuriao',      icone: '👑', nome: 'Centurião',        desc: 'Manter 100 dias seguidos de atividade.', teste: e => e.melhorSequencia >= 100 },
  { id: 'perfeitos-10',   icone: '💎', nome: 'Dez Sem Falhar',   desc: 'Acumular 10 dias perfeitos.', teste: e => e.diasPerfeitos >= 10 },
  { id: 'pontos-500',     icone: '⭐', nome: '500 Pontos',       desc: 'Acumular 500 pontos no programa.', teste: e => e.pontos >= 500 },
  { id: 'pontos-2000',    icone: '🌟', nome: '2000 Pontos',      desc: 'Acumular 2000 pontos no programa.', teste: e => e.pontos >= 2000 },
  { id: 'diario',         icone: '✍️', nome: 'Memória Viva',     desc: 'Registrar 10 vitórias no diário.', teste: e => e.vitoriasRegistradas >= 10 },
  { id: 'retorno',        icone: '🔄', nome: 'Voltei Mais Forte', desc: 'Voltar a marcar hábitos depois de falhar um dia.', teste: e => e.retomadas >= 1 }
];
