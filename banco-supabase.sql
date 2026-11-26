-- Tabela de agendamentos
create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome text not null check (char_length(nome) <= 100),
  telefone text not null check (char_length(telefone) <= 30),
  pet text not null check (char_length(pet) <= 100),
  tipo text not null check (char_length(tipo) <= 30),
  servico text not null check (char_length(servico) <= 60),
  veterinario text check (char_length(veterinario) <= 60),
  data date not null,
  hora text not null check (char_length(hora) <= 10),
  observacoes text check (char_length(observacoes) <= 500)
);

-- Liga a proteção por linha (RLS)
alter table public.agendamentos enable row level security;

-- Qualquer cliente do site pode CRIAR um agendamento
create policy "clientes podem agendar"
  on public.agendamentos for insert
  to anon
  with check (true);

-- Só quem está logado no painel pode LER
create policy "painel pode ler"
  on public.agendamentos for select
  to authenticated
  using (true);

-- Só quem está logado no painel pode APAGAR
create policy "painel pode apagar"
  on public.agendamentos for delete
  to authenticated
  using (true);
