var NUM = '5527992832260';
var CHAVE = 'tevi_carrinho';

function carregarItens() {
  try {
    var raw = localStorage.getItem(CHAVE);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function salvarItens(itens) {
  try { localStorage.setItem(CHAVE, JSON.stringify(itens)); } catch(e) {}
}

function getT(btn) {
  var el = btn.parentElement;
  while (el) {
    if (el.dataset && el.dataset.tema) return el.dataset.tema;
    el = el.parentElement;
  }
  return 'Dia dos Namorados';
}

function adicionarAoCarrinho(btn) {
  var itens = carregarItens();
  var tema = getT(btn);
  var sub = btn.getAttribute('data-subtipo');
  var id = tema + '||' + sub;
  var idx = -1;
  for (var i = 0; i < itens.length; i++) {
    if (itens[i].id === id) { idx = i; break; }
  }
  if (idx >= 0) {
    itens.splice(idx, 1);
    btn.classList.remove('selecionado');
    btn.textContent = 'Quero esta carta';
  } else {
    itens.push({ id: id, tema: tema, sub: sub });
    btn.classList.add('selecionado');
    btn.textContent = 'Adicionado ao pedido';
  }
  salvarItens(itens);
  atualizarBarrinha(itens);
}

function remover(id) {
  var itens = carregarItens().filter(function(x){ return x.id !== id; });
  salvarItens(itens);
  document.querySelectorAll('.btn-quero.selecionado').forEach(function(b) {
    var t = getT(b);
    var s = b.getAttribute('data-subtipo');
    if ((t + '||' + s) === id) {
      b.classList.remove('selecionado');
      b.textContent = 'Quero esta carta';
    }
  });
  atualizarBarrinha(itens);
}

function limpar() {
  salvarItens([]);
  document.querySelectorAll('.btn-quero.selecionado').forEach(function(b) {
    b.classList.remove('selecionado');
    b.textContent = 'Quero esta carta';
  });
  atualizarBarrinha([]);
}

function toggleLista() {
  var painel = document.getElementById('carrinho-painel');
  var btn = document.getElementById('btn-ver-lista');
  var aberto = painel.classList.contains('aberto');
  if (aberto) {
    painel.classList.remove('aberto');
    btn.textContent = 'Ver lista';
  } else {
    renderLista();
    painel.classList.add('aberto');
    btn.textContent = 'Fechar lista';
  }
}

function renderLista() {
  var itens = carregarItens();
  var container = document.getElementById('c-lista');
  if (!container) return;
  container.innerHTML = '';
  itens.forEach(function(item) {
    var div = document.createElement('div');
    div.className = 'c-item';
    var info = document.createElement('div');
    var t = document.createElement('div');
    t.className = 'c-item-tema';
    t.textContent = item.tema;
    var n = document.createElement('div');
    n.className = 'c-item-nome';
    n.textContent = item.sub;
    info.appendChild(t);
    info.appendChild(n);
    var rem = document.createElement('button');
    rem.className = 'c-item-rem';
    rem.textContent = 'x';
    rem.setAttribute('data-id', item.id);
    rem.onclick = function(){ remover(this.getAttribute('data-id')); };
    div.appendChild(info);
    div.appendChild(rem);
    container.appendChild(div);
  });
  var plano = document.createElement('div');
  plano.id = 'carrinho-plano-txt';
  var n = itens.length;
  if (n === 1) plano.innerHTML = 'Sugestao: carta avulsa <strong>R$ 3,90</strong>';
  else if (n <= 3) plano.innerHTML = 'Sugestao: kit 3 cartas <strong>R$ 7,00</strong>';
  else plano.innerHTML = 'Sugestao: baralho 10 cartas <strong>R$ 25,00</strong>';
  container.appendChild(plano);
}

function enviarWpp() {
  var itens = carregarItens();
  if (itens.length === 0) return;
  var n = itens.length;
  var linhas = itens.map(function(x){ return '- ' + x.tema + ': ' + x.sub; }).join('\n');
  var plano = n === 1 ? 'carta avulsa (R$ 3,90)' : n <= 3 ? 'kit 3 cartas (R$ 7,00)' : 'baralho 10 cartas (R$ 25,00)';
  var msg = 'Oi! Quero desbloquear estas cartas do Te Vi\n\n' + linhas + '\n\nAcho que o ' + plano + ' faz sentido. Como fazer?';
  window.open('https://wa.me/' + NUM + '?text=' + encodeURIComponent(msg), '_blank');
}

function atualizarBarrinha(itens) {
  var bar = document.getElementById('carrinho-bar');
  var num = document.getElementById('c-num');
  var plural = document.getElementById('c-plural');
  if (!bar) return;
  var n = itens.length;
  if (n > 0) {
    bar.classList.add('visivel');
    if (num) num.textContent = n;
    if (plural) plural.textContent = n === 1 ? '' : 's';
  } else {
    bar.classList.remove('visivel');
    var painel = document.getElementById('carrinho-painel');
    if (painel) painel.classList.remove('aberto');
  }
}

function iniciarCarrinho() {
  var itens = carregarItens();
  atualizarBarrinha(itens);
  itens.forEach(function(item) {
    document.querySelectorAll('.btn-quero').forEach(function(b) {
      var t = getT(b);
      var s = b.getAttribute('data-subtipo');
      if ((t + '||' + s) === item.id) {
        b.classList.add('selecionado');
        b.textContent = 'Adicionado ao pedido';
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', iniciarCarrinho);
