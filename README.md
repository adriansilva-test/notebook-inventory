# NotebookTrack — Guia de instalação

## Passo 1 — Configurar o Supabase

1. Acesse https://supabase.com e faça login
2. Clique em "New project" e dê um nome (ex: notebook-inventory)
3. Escolha uma senha para o banco e clique em "Create new project"
4. Aguarde ~2 minutos até o projeto ficar pronto
5. No menu lateral, clique em "SQL Editor"
6. Clique em "New query", cole TODO o conteúdo do arquivo `supabase/schema.sql` e clique em "Run"
7. Vá em "Project Settings" > "API"
8. Copie o valor de "Project URL" — você vai precisar logo
9. Copie o valor de "anon public" (em Project API keys) — você vai precisar logo

## Passo 2 — Configurar as variáveis de ambiente

1. Na pasta do projeto, duplique o arquivo `.env.example` e renomeie para `.env`
2. Abra o `.env` e cole os valores que você copiou:

```
VITE_SUPABASE_URL=https://SEU_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...seu_anon_key...
```

## Passo 3 — Criar seu usuário administrador no Supabase

1. No Supabase, vá em "Authentication" > "Users"
2. Clique em "Add user" > "Create new user"
3. Informe seu e-mail e uma senha
4. Depois vá em "SQL Editor" e rode:

```sql
insert into profiles (id, nome, perfil)
select id, 'Admin', 'gestor' from auth.users where email = 'SEU_EMAIL_AQUI';
```

## Passo 4 — Rodar o projeto localmente

Abra o terminal (Prompt de Comando ou PowerShell) dentro da pasta do projeto e rode:

```bash
npm install
npm run dev
```

Acesse http://localhost:5173 no navegador e faça login com o usuário que você criou.

## Passo 5 — Publicar no Vercel

1. Crie um repositório no GitHub:
   - Acesse https://github.com/new
   - Dê um nome (ex: notebook-inventory) e clique em "Create repository"

2. No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/notebook-inventory.git
git push -u origin main
```

3. Acesse https://vercel.com, clique em "Add New Project"
4. Conecte sua conta do GitHub e selecione o repositório
5. Antes de clicar em "Deploy", clique em "Environment Variables" e adicione:
   - `VITE_SUPABASE_URL` — o valor do seu Project URL
   - `VITE_SUPABASE_ANON_KEY` — o valor do seu anon key
6. Clique em "Deploy"

Pronto! Em ~1 minuto o sistema estará no ar em um endereço como:
https://notebook-inventory.vercel.app
