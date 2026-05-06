-- =============================================
-- NotebookTrack — Script de criação do banco
-- Cole este script no Supabase SQL Editor
-- =============================================

-- 1. Tabela de notebooks
create table if not exists notebooks (
  id uuid primary key default gen_random_uuid(),
  patrimonio text not null unique,
  modelo text not null,
  marca text default '',
  serial text default '',
  status text default 'disponivel' check (status in ('disponivel', 'em_uso', 'manutencao')),
  responsavel text default '',
  departamento text default '',
  created_at timestamptz default now()
);

-- 2. Tabela de movimentações
create table if not exists movimentacoes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  patrimonio text not null,
  responsavel text default '',
  departamento text default '',
  observacao text default '',
  created_at timestamptz default now()
);

-- 3. Tabela de perfis de usuário
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  nome text default '',
  perfil text default 'visualizador' check (perfil in ('gestor', 'operador', 'visualizador')),
  created_at timestamptz default now()
);

-- 4. Segurança: habilitar RLS (Row Level Security)
alter table notebooks enable row level security;
alter table movimentacoes enable row level security;
alter table profiles enable row level security;

-- 5. Políticas de acesso — usuários autenticados podem ler tudo
create policy "Leitura autenticada - notebooks"
  on notebooks for select using (auth.role() = 'authenticated');

create policy "Leitura autenticada - movimentacoes"
  on movimentacoes for select using (auth.role() = 'authenticated');

create policy "Leitura autenticada - profiles"
  on profiles for select using (auth.role() = 'authenticated');

-- 6. Políticas de escrita — usuários autenticados podem inserir e atualizar
create policy "Escrita autenticada - notebooks"
  on notebooks for all using (auth.role() = 'authenticated');

create policy "Escrita autenticada - movimentacoes"
  on movimentacoes for all using (auth.role() = 'authenticated');

create policy "Escrita autenticada - profiles"
  on profiles for all using (auth.role() = 'authenticated');

-- =============================================
-- Dados iniciais de exemplo (opcional)
-- Remova este bloco se quiser começar do zero
-- =============================================
insert into notebooks (patrimonio, modelo, marca, serial, status, responsavel, departamento) values
  ('NB-001', 'ThinkPad E14', 'Lenovo', 'LN2024001', 'em_uso', 'Ana Costa', 'TI'),
  ('NB-002', 'EliteBook 840', 'HP', 'HP2024002', 'disponivel', '', ''),
  ('NB-003', 'Inspiron 15', 'Dell', 'DL2024003', 'em_uso', 'Carlos Melo', 'Financeiro'),
  ('NB-004', 'MacBook Air', 'Apple', 'AP2024004', 'manutencao', '', ''),
  ('NB-005', 'Aspire 5', 'Acer', 'AC2024005', 'em_uso', 'Joana Silva', 'RH'),
  ('NB-006', 'VivoBook 15', 'Asus', 'AS2024006', 'disponivel', '', '')
on conflict do nothing;
