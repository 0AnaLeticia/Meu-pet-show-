// Carrossel (banner) da página inicial
const trilho = document.getElementById('trilho');
const itens = trilho.querySelectorAll('.carrossel-item');
const bolinhas = document.querySelectorAll('.bolinha');
let atual = 0;

function mostrarItem(indice) {
  // Volta ao começo/fim quando passa do limite
  atual = (indice + itens.length) % itens.length;

  // Desliza o trilho para o item escolhido
  trilho.style.transform = 'translateX(-' + (atual * 100) + '%)';

  // Atualiza a bolinha ativa
  bolinhas.forEach(function (b, i) {
    b.classList.toggle('ativa', i === atual);
  });
}

// Funções chamadas pelos botões e bolinhas do HTML
function moverCarrossel(direcao) {
  mostrarItem(atual + direcao);
}

function irParaItem(indice) {
  mostrarItem(indice);
}

// Troca sozinho a cada 6 segundos
setInterval(function () {
  mostrarItem(atual + 1);
}, 6000);
