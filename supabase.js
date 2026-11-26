// Salva os agendamentos no banco de dados (Supabase)
if (typeof SUPABASE_KEY !== 'undefined' && SUPABASE_KEY !== 'COLE_AQUI') {
  window.salvarAgendamento = async function (dados) {
    const resposta = await fetch(SUPABASE_URL + '/rest/v1/agendamentos', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        nome: dados.nome,
        telefone: dados.telefone,
        pet: dados.pet,
        tipo: dados.tipo,
        servico: dados.servico,
        veterinario: dados.veterinario,
        data: dados.data,
        hora: dados.hora,
        observacoes: dados.observacoes
      })
    });

    if (!resposta.ok) {
      throw new Error('Erro ao salvar: ' + resposta.status);
    }
  };
}
