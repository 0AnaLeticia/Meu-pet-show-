// Conta do cliente (fica salva só neste aparelho)
async function hashSenha(texto) {
  const bytes = new TextEncoder().encode(texto);
  const resumo = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(resumo))
    .map(function (b) { return b.toString(16).padStart(2, '0'); })
    .join('');
}

function lerUsuarios() {
  try { return JSON.parse(localStorage.getItem('ps_usuarios') || '[]'); }
  catch (e) { return []; }
}

function salvarUsuarios(lista) {
  try { localStorage.setItem('ps_usuarios', JSON.stringify(lista)); return true; }
  catch (e) { return false; }
}

function entrarNaConta(email) {
  try { localStorage.setItem('ps_sessao', email); } catch (e) {}
  window.location.href = 'agendar.html';
}

// Se já estiver logado neste aparelho, mostra um aviso com atalho para agendar
(function () {
  let sessao = null;
  try { sessao = localStorage.getItem('ps_sessao'); } catch (e) {}
  const usuario = lerUsuarios().find(function (u) { return u.email === sessao; });
  if (!usuario) return;

  const aviso = document.createElement('div');
  aviso.className = 'conta-logado';

  const texto = document.createElement('p');
  texto.textContent = 'Você já está logado como ' + usuario.nome.split(' ')[0] + '.';
  aviso.appendChild(texto);

  const ir = document.createElement('a');
  ir.href = 'agendar.html';
  ir.textContent = 'Ir para agendar';
  aviso.appendChild(ir);

  const sair = document.createElement('button');
  sair.type = 'button';
  sair.textContent = 'Sair';
  sair.onclick = function () {
    try { localStorage.removeItem('ps_sessao'); } catch (e) {}
    window.location.reload();
  };
  aviso.appendChild(sair);

  const card = document.querySelector('.conta-card');
  card.insertBefore(aviso, card.firstChild);
})();

// ----- Cadastro -----
document.getElementById('form-cadastro').addEventListener('submit', async function (ev) {
  ev.preventDefault();

  const email = document.getElementById('cad-email').value.trim().toLowerCase();
  const usuarios = lerUsuarios();

  if (usuarios.some(function (u) { return u.email === email; })) {
    alert('Este e-mail já está cadastrado. Entre em "Já tenho conta".');
    mostrarAba('login');
    return;
  }

  usuarios.push({
    nome: document.getElementById('cad-nome').value.trim(),
    whatsapp: document.getElementById('cad-whatsapp').value.trim(),
    pet: document.getElementById('cad-pet').value.trim(),
    especie: document.getElementById('cad-especie').value,
    email: email,
    senha: await hashSenha(document.getElementById('cad-senha').value)
  });

  if (!salvarUsuarios(usuarios)) {
    alert('Não foi possível salvar o cadastro neste navegador. Saia da aba anônima e tente de novo.');
    return;
  }

  entrarNaConta(email);
});

// ----- Login -----
document.getElementById('form-login').addEventListener('submit', async function (ev) {
  ev.preventDefault();

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = await hashSenha(document.getElementById('login-senha').value);

  const achou = lerUsuarios().some(function (u) {
    return u.email === email && u.senha === senha;
  });

  if (!achou) {
    alert('E-mail ou senha incorretos. Se você ainda não se cadastrou neste aparelho, toque em "Quero me cadastrar".');
    return;
  }

  entrarNaConta(email);
});
