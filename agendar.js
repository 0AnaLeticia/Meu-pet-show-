// ===== Agendar horário: salva na agenda do cliente (neste aparelho) =====

// TROQUE pelos nomes dos veterinários da loja
const VETERINARIOS = ['Dr. Nome 1', 'Dra. Nome 2', 'Dr. Nome 3'];

// Horários de atendimento (edite como quiser)
const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// ----- Só entra quem tem conta (cadastro feito na página Sua Conta) -----
let usuario = null;
try {
  const email = localStorage.getItem('ps_sessao');
  usuario = JSON.parse(localStorage.getItem('ps_usuarios') || '[]')
    .find(function (u) { return u.email === email; });
} catch (e) {}

if (!usuario) {
  window.location.replace('suaconta.html');
}

const campoData = document.getElementById('ag-data');
const campoHora = document.getElementById('ag-hora');
const campoVet = document.getElementById('ag-vet');
const campoVetBox = document.getElementById('ag-vet-campo');
const campoServico = document.getElementById('ag-servico');

// Preenche a lista de veterinários
campoVet.innerHTML = '<option value="Sem preferência">Sem preferência</option>' +
  VETERINARIOS.map(function (v) { return '<option value="' + v + '">' + v + '</option>'; }).join('');

// Data de hoje no formato do campo (aaaa-mm-dd), no fuso do celular
function hojeISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

// Não deixa escolher data passada
campoData.min = hojeISO();
campoData.value = hojeISO();

// Mostra o campo "Veterinário" só nos serviços veterinários
function atualizarServico() {
  const opcao = campoServico.options[campoServico.selectedIndex];
  campoVetBox.classList.toggle('agendar-oculto', !opcao.dataset.vet);
}

// Mostra os horários; se for hoje, esconde os que já passaram
function atualizarHorarios() {
  let lista = HORARIOS;
  if (campoData.value === hojeISO()) {
    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    lista = HORARIOS.filter(function (h) {
      const p = h.split(':');
      return Number(p[0]) * 60 + Number(p[1]) > minutosAgora;
    });
  }
  campoHora.innerHTML = lista.length
    ? lista.map(function (h) { return '<option>' + h + '</option>'; }).join('')
    : '<option value="">Sem horários hoje, escolha outra data</option>';
}

atualizarServico();
atualizarHorarios();

// Preenche os dados da conta e mostra "Olá"
if (usuario) {
  document.getElementById('ag-nome').value = usuario.nome;
  document.getElementById('ag-tel').value = usuario.whatsapp;
  document.getElementById('ag-pet').value = usuario.pet;
  const tipos = { cachorro: 'Cachorro', gato: 'Gato', ave: 'Ave', outro: 'Outro' };
  document.getElementById('ag-tipo').value = tipos[usuario.especie] || 'Outro';

  const saudacao = document.getElementById('ag-saudacao');
  saudacao.textContent = 'Olá, ' + usuario.nome.split(' ')[0] + '! ';
  const sair = document.createElement('a');
  sair.href = '#';
  sair.textContent = 'Sair';
  sair.onclick = function (e) {
    e.preventDefault();
    try { localStorage.removeItem('ps_sessao'); } catch (x) {}
    window.location.href = 'suaconta.html';
  };
  saudacao.appendChild(sair);
}


// ----- Agenda salva neste aparelho -----
function lerAgenda() {
  try { return JSON.parse(localStorage.getItem('ps_agenda') || '[]'); }
  catch (e) { return []; }
}

function salvarAgenda(lista) {
  try { localStorage.setItem('ps_agenda', JSON.stringify(lista)); return true; }
  catch (e) { return false; }
}

function dataBR(iso) {
  const p = iso.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function mostrarAgenda() {
  const caixa = document.getElementById('ag-lista');
  if (!caixa || !usuario) return;
  caixa.textContent = '';

  const meus = lerAgenda()
    .filter(function (x) { return x.email === usuario.email; })
    .sort(function (a, b) { return (a.data + a.hora).localeCompare(b.data + b.hora); });

  if (!meus.length) {
    const vazio = document.createElement('p');
    vazio.textContent = 'Você ainda não tem agendamentos.';
    caixa.appendChild(vazio);
    return;
  }

  meus.forEach(function (x) {
    const card = document.createElement('div');
    card.className = 'agenda-item';

    const titulo = document.createElement('strong');
    titulo.textContent = dataBR(x.data) + ' às ' + x.hora;
    card.appendChild(titulo);

    const linha1 = document.createElement('p');
    linha1.textContent = x.servico + (x.veterinario ? ' com ' + x.veterinario : '');
    card.appendChild(linha1);

    const linha2 = document.createElement('p');
    linha2.textContent = 'Pet: ' + x.pet + ' (' + x.tipo + ')';
    card.appendChild(linha2);

    if (x.obs) {
      const linha3 = document.createElement('p');
      linha3.textContent = 'Obs.: ' + x.obs;
      card.appendChild(linha3);
    }

    const cancelar = document.createElement('button');
    cancelar.type = 'button';
    cancelar.textContent = 'Cancelar';
    cancelar.onclick = function () {
      if (!confirm('Cancelar este agendamento?')) return;
      salvarAgenda(lerAgenda().filter(function (y) { return y.id !== x.id; }));
      atualizarHorarios();
      mostrarAgenda();
    };
    card.appendChild(cancelar);

    caixa.appendChild(card);
  });
}

function enviarAgendamento() {
  const nome = document.getElementById('ag-nome').value.trim();
  const tel = document.getElementById('ag-tel').value.trim();
  const pet = document.getElementById('ag-pet').value.trim();
  const tipo = document.getElementById('ag-tipo').value;
  const servico = campoServico.value;
  const data = campoData.value;
  const hora = campoHora.value;
  const obs = document.getElementById('ag-obs').value.trim();
  const ehVet = !campoVetBox.classList.contains('agendar-oculto');
  const vet = ehVet ? campoVet.value : '';

  if (!nome || !tel || !pet || !data || !hora) {
    alert('Preencha nome, telefone, nome do pet, data e horário.');
    return;
  }

  const agenda = lerAgenda();

  // Não deixa marcar dois serviços no mesmo dia e horário
  const repetido = agenda.some(function (x) {
    return x.email === usuario.email && x.data === data && x.hora === hora;
  });
  if (repetido) {
    alert('Você já tem um agendamento nesse dia e horário. Escolha outro horário.');
    return;
  }

  agenda.push({
    id: String(Date.now()) + Math.random().toString(16).slice(2),
    email: usuario.email,
    nome: nome,
    telefone: tel,
    pet: pet,
    tipo: tipo,
    servico: servico,
    veterinario: vet,
    data: data,
    hora: hora,
    obs: obs
  });

  if (!salvarAgenda(agenda)) {
    alert('Não foi possível salvar o agendamento neste navegador.');
    return;
  }

  // Envia também para o admin (banco de dados). Se falhar, o agendamento do cliente continua salvo.
  if (window.salvarAgendamento) {
    window.salvarAgendamento({
      nome: nome,
      telefone: tel,
      pet: pet,
      tipo: tipo,
      servico: servico,
      veterinario: vet,
      data: data,
      hora: hora,
      observacoes: obs
    }).catch(function (erro) {
      console.error('Não foi possível enviar ao admin:', erro);
    });
  }

  const ok = document.getElementById('ag-ok');
  ok.textContent = '✅ Agendamento confirmado para ' + dataBR(data) + ' às ' + hora + '!';
  ok.hidden = false;

  document.getElementById('ag-obs').value = '';
  mostrarAgenda();
  ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

mostrarAgenda();
