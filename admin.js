// Painel de agendamentos (Supabase)
const telaLogin = document.getElementById('tela-login');
const telaLista = document.getElementById('tela-lista');
const erroLogin = document.getElementById('erro-login');
const lista = document.getElementById('lista');

let token = null;
try { token = sessionStorage.getItem('ps_token'); } catch (e) {}

function cabecalhos() {
  const h = { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
}

function mostrarTela(logado) {
  telaLogin.hidden = logado;
  telaLista.hidden = !logado;
}

function sair() {
  token = null;
  try { sessionStorage.removeItem('ps_token'); } catch (e) {}
  mostrarTela(false);
}

async function entrar() {
  erroLogin.textContent = '';
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('senha').value
      })
    });
    const j = await r.json();
    if (!r.ok || !j.access_token) {
      erroLogin.textContent = 'E-mail ou senha incorretos.';
      return;
    }
    token = j.access_token;
    try { sessionStorage.setItem('ps_token', token); } catch (e) {}
    mostrarTela(true);
    carregar();
  } catch (e) {
    erroLogin.textContent = 'Sem conexão. Tente de novo.';
  }
}

async function carregar() {
  try {
    const r = await fetch(
      SUPABASE_URL + '/rest/v1/agendamentos?select=*&order=data.asc,hora.asc',
      { headers: cabecalhos() }
    );
    if (r.status === 401 || r.status === 403) { sair(); return; }
    mostrar(await r.json());
  } catch (e) {
    document.getElementById('total').textContent = 'Erro ao carregar.';
  }
}

async function excluir(id) {
  await fetch(
    SUPABASE_URL + '/rest/v1/agendamentos?id=eq.' + encodeURIComponent(id),
    { method: 'DELETE', headers: cabecalhos() }
  );
  carregar();
}

function linha(rotulo, valor) {
  const p = document.createElement('p');
  const b = document.createElement('strong');
  b.textContent = rotulo + ': ';
  p.appendChild(b);
  p.appendChild(document.createTextNode(valor));
  return p;
}

function mostrar(itens) {
  lista.textContent = '';
  document.getElementById('total').textContent = itens.length + ' agendamento(s)';

  itens.forEach(function (a) {
    const card = document.createElement('div');
    card.className = 'ag-card';

    const p = (a.data || '').split('-');
    const dataBR = p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : a.data;

    const titulo = document.createElement('h3');
    titulo.textContent = dataBR + ' às ' + a.hora;
    card.appendChild(titulo);

    card.appendChild(linha('Cliente', a.nome));
    card.appendChild(linha('Pet', a.pet + ' (' + a.tipo + ')'));
    card.appendChild(linha('Serviço', a.servico));
    if (a.veterinario) card.appendChild(linha('Veterinário', a.veterinario));
    card.appendChild(linha('Telefone', a.telefone));
    if (a.observacoes) card.appendChild(linha('Obs.', a.observacoes));

    const acoes = document.createElement('div');
    acoes.className = 'ag-acoes';

    let numero = (a.telefone || '').replace(/\D/g, '');
    if (numero.length <= 11) numero = '55' + numero;
    const zap = document.createElement('a');
    zap.href = 'https://wa.me/' + numero;
    zap.target = '_blank';
    zap.textContent = 'Chamar no WhatsApp';
    acoes.appendChild(zap);

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Excluir';
    del.onclick = function () {
      if (confirm('Excluir este agendamento?')) excluir(a.id);
    };
    acoes.appendChild(del);

    card.appendChild(acoes);
    lista.appendChild(card);
  });
}

if (SUPABASE_KEY === 'COLE_AQUI') {
  erroLogin.textContent = 'Preencha o arquivo supabase-config.js primeiro.';
} else {
  document.getElementById('btn-entrar').onclick = entrar;
  document.getElementById('btn-sair').onclick = sair;
  if (token) { mostrarTela(true); carregar(); }
}
