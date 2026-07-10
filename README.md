# Sistema de Gestão — Impressão 3D

Mini ERP/CRM para uma operação de impressão 3D sob encomenda: clientes, catálogo de produtos, orçamentos, pedidos, calculadora de custo/preço, estoque de insumos, fila de produção, impressoras, financeiro, relatórios e um portal público para o cliente solicitar orçamento.

Veja o racional completo de arquitetura e regras de negócio em [docs/01-planejamento-arquitetura.md](docs/01-planejamento-arquitetura.md).

## Stack

- **Next.js 16** (App Router, TypeScript)
- **SQLite** + **Prisma 7** (driver adapter `@prisma/adapter-better-sqlite3`)
- Autenticação própria: `bcryptjs` (hash de senha) + `jose` (sessão JWT em cookie)
- Tailwind CSS 4
- Recharts (gráficos do dashboard/relatórios)

Banco de dados é um único arquivo (`dev.db`) na raiz do projeto — sem serviço externo para instalar.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (testado com Node 22)

## Instalação (primeira vez)

```bash
npm install
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

Configurações → **Baixar backup do banco** gera o download do arquivo `dev.db` atual com 1 clique. Para restaurar, pare o servidor e substitua o `dev.db` da raiz do projeto pelo arquivo de backup.

## Migrações do banco

Sempre que o schema (`prisma/schema.prisma`) mudar:

```bash
npx prisma migrate dev --name descricao_da_mudanca
```

Em produção (sem gerar uma nova migration, só aplicar as existentes):

```bash
npx prisma migrate deploy
```
