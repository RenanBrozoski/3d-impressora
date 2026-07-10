# Sistema de Gestão — Impressão 3D

Mini ERP/CRM para uma operação de impressão 3D sob encomenda: clientes, catálogo de produtos, orçamentos, pedidos, calculadora de custo/preço, estoque de insumos, fila de produção, impressoras, financeiro, relatórios e um portal público para o cliente solicitar orçamento.

Veja o racional completo de arquitetura e regras de negócio em [docs/01-planejamento-arquitetura.md](docs/01-planejamento-arquitetura.md).

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Postgres (Neon)** + **Prisma 7** (driver adapter `@prisma/adapter-neon`, compatível com serverless)
- Autenticação própria: `bcryptjs` (hash de senha) + `jose` (sessão JWT em cookie)
- Tailwind CSS 4
- Recharts (gráficos do dashboard/relatórios)

O banco é um projeto Postgres gratuito no [Neon](https://neon.tech) — não precisa instalar nada localmente, só criar o projeto e colar a connection string no `.env`. Isso também é o que permite hospedar o sistema de graça na Vercel (plano Hobby).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (testado com Node 22)
- Um projeto Postgres gratuito no [Neon](https://neon.tech) (crie e copie a connection string)

## Instalação (primeira vez)

```bash
npm install
```

Copie `.env.example` para `.env` e cole a connection string do Neon em `DATABASE_URL`. Depois:

```bash
npx prisma migrate deploy
npx prisma db seed
```

O seed cria dois usuários e as configurações padrão:

| Papel | E-mail | Senha |
|---|---|---|
| Administrador | `admin@impressao3d.local` | `admin123` |
| Operador | `operador@impressao3d.local` | `operador123` |

**Troque essas senhas em Configurações → Usuários assim que acessar pela primeira vez.**

## Rodando em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Rodando em modo "produção local"

```bash
npm run build
npm run start
```

Ou simplesmente dê duplo clique em [`start.bat`](start.bat), que faz o build (se necessário) e sobe o servidor.

## Estrutura de pastas

```
prisma/schema.prisma   modelo de dados completo (16 tabelas)
prisma/seed.ts         usuário admin/operador + configurações padrão
src/app/(auth)/        login
src/app/(app)/         área logada (todos os módulos, com menu lateral)
src/app/solicitar/     formulário público de solicitação de orçamento
src/app/acompanhar/    página pública de acompanhamento de pedido
src/app/actions/       Server Actions (regras de negócio de cada módulo)
src/lib/               calculadora, sessão/auth, relatórios, validações Zod
storage/uploads/       arquivos enviados (STL/OBJ/3MF, fotos) — criado sob demanda
```

## Backup do banco

Configurações → **Baixar backup do banco** gera um arquivo `.json` com todas as tabelas do sistema, com 1 clique. Para restaurar, seria necessário reimportar esse JSON tabela por tabela (não é uma restauração automática — serve como registro/exportação de segurança).

## Deploy na Vercel (gratuito)

1. Suba este repositório no GitHub e importe-o em [vercel.com/new](https://vercel.com/new).
2. Em **Environment Variables**, configure `DATABASE_URL` (a mesma connection string do Neon) e `SESSION_SECRET`.
3. No primeiro deploy, rode `npx prisma migrate deploy` apontando para o mesmo `DATABASE_URL` (a partir da sua máquina, ou via `vercel env pull` + o comando local) para aplicar as migrations no banco de produção.
4. **Uploads (STL/OBJ/3MF, fotos)**: hoje ficam em `storage/uploads` no disco local, o que **não funciona na Vercel** (sistema de arquivos é temporário lá). Antes de depender do envio de arquivos em produção, é preciso trocar por um storage externo (ex.: Vercel Blob).

## Migrações do banco

Sempre que o schema (`prisma/schema.prisma`) mudar:

```bash
npx prisma migrate dev --name descricao_da_mudanca
```

Em produção (sem gerar uma nova migration, só aplicar as existentes):

```bash
npx prisma migrate deploy
```
